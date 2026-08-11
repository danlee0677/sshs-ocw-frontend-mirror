import { ScrollArea, Tooltip } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useLayoutEffect, useRef } from "react"
import { type Streak } from "../../libs/types"
import classes from "./StreakBody.module.css"

interface StreakBodyProps {
  streak: Streak,
  threshold: number[],
  // readonly: getStreakColors() in libs/styles.ts returns a readonly tuple from
  // an `as const` object. Widening here is correct; copying the array at the
  // call site to satisfy a narrower type would not be.
  colors: readonly string[],
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GAP = 2

// Must equal `.labelCol` width (28px) + `.cols` gap (4px) in StreakBody.module.css.
// That is now an exact identity rather than a coincidence — the old layout spread
// the same 32px across a `.dayLabelSpacer` and a separately-sized `.dayLabels`,
// so the month labels de-aligned from the grid if either drifted.
const DAY_LABEL_AREA = 32

// Below MIN_CELL the grid is unreadable and the Tooltips are untappable: at 360px
// the old `Math.max(4, ...)` floor produced literal 4px cells. Past this size the
// grid overflows and scrolls horizontally instead of shrinking further.
// MAX_CELL bounds how much the grid can grow after the first measuring pass, which
// is what keeps the placeholder height honest — see `.wrapper`'s min-height.
const MIN_CELL = 10
const MAX_CELL = 14

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function StreakBody({ streak, threshold, colors }: StreakBodyProps) {
  // `ref` sits on `.wrapper`, which is deliberately OUTSIDE the ScrollArea below
  // and is a plain full-width block. useElementSize reads borderBoxSize, so it
  // reports the AVAILABLE width; an overflowing child cannot inflate it and
  // cannot feed back into cellSize.
  const { ref, width } = useElementSize()
  const viewportRef = useRef<HTMLDivElement>(null)
  const dayMap = streak.days

  const totalDays = isLeapYear(streak.year) ? 366 : 365
  const startOffset = new Date(streak.year, 0, 1).getDay()
  const totalCols = Math.ceil((startOffset + totalDays) / 7)

  const gridAvailable = width - DAY_LABEL_AREA
  const cellSize = Math.min(
    MAX_CELL,
    Math.max(MIN_CELL, Math.floor((gridAvailable - (totalCols - 1) * GAP) / totalCols))
  )

  function getColor(count: number): string {
    for (let i=0; i<threshold.length; i++) {
      if (count <= threshold[i]) return colors[i]
    }
    return colors[colors.length - 1];
  }

  const jan1Ms = new Date(streak.year, 0, 1).getTime()
  const monthPositions = MONTHS.map((name, m) => {
    const dayIndex = Math.round((new Date(streak.year, m, 1).getTime() - jan1Ms) / 86400000)
    const col = Math.floor((startOffset + dayIndex) / 7)
    return { name, col }
  })

  const totalCells = startOffset + totalDays

  // Open on the current week rather than January. useLayoutEffect, not
  // useEffect: useEffect runs after paint, so the user would watch the grid jump
  // from January to today. This writes the DOM, not state, so it does not trip
  // react-hooks/set-state-in-effect.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || width === 0) return

    const now = new Date()
    const targetCol = now.getFullYear() === streak.year
      ? Math.floor(
        (startOffset + Math.round(
          (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - jan1Ms) / 86400000
        )) / 7
      )
      : totalCols - 1

    viewport.scrollLeft = Math.max(0, targetCol * (cellSize + GAP) - viewport.clientWidth / 2)
  }, [streak.year, cellSize, totalCols, startOffset, jan1Ms, width])

  // Kept: the measurement genuinely needs a first pass. `.wrapper` carries a
  // min-height matching the final grid, so this placeholder reserves the space
  // and the page does not shift. Rendering the grid at MIN_CELL on pass one
  // instead would mount 366 Tooltips twice, each instantiating floating-ui.
  if (width === 0) return <div ref={ref} className={classes.wrapper} />

  return (
    <div ref={ref} className={classes.wrapper}>
      <div className={classes.cols}>
        {/* Pinned day-label column, deliberately OUTSIDE the scroller so
            Mon/Wed/Fri stay visible while the year scrolls under them. Its width
            plus `.cols`' gap is DAY_LABEL_AREA. */}
        <div className={classes.labelCol}>
          <div className={classes.monthSpacer} />
          <div
            className={classes.dayLabels}
            style={{ gridTemplateRows: `repeat(7, ${cellSize}px)`, gap: GAP }}
          >
            {DAY_LABELS.map((d, i) => (
              <span key={d} style={{ visibility: (i === 1 || i === 3 || i === 5) ? 'visible' : 'hidden' }}>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* THE one horizontal scroller. The month row and the grid are both
            inside a single `.inner`, which is what makes them scroll in
            lockstep — as two sibling scrollers they would drift. `.wrapper` no
            longer sets overflow-x for the same reason. */}
        <ScrollArea
          type="auto"
          scrollbars="x"
          scrollbarSize={8}
          viewportRef={viewportRef}
          className={classes.scroller}
        >
          <div className={classes.inner}>
            <div
              className={classes.monthLabels}
              style={{ width: totalCols * (cellSize + GAP) - GAP }}
            >
              {monthPositions.map(({ name, col }) => (
                <span
                  key={name}
                  className={classes.monthLabel}
                  style={{ left: col * (cellSize + GAP) }}
                >
                  {name}
                </span>
              ))}
            </div>

            <div
              className={classes.grid}
              style={{
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                gridAutoColumns: `${cellSize}px`,
                gap: GAP,
              }}
            >
              {Array.from({ length: totalCells }, (_, i) => {
                if (i < startOffset) {
                  return (
                    <div
                      key={`pad-${i}`}
                      className={classes.cell}
                      style={{ width: cellSize, height: cellSize, background: 'transparent' }}
                    />
                  )
                }

                const dayIndex = i - startOffset
                const count = dayMap[String(dayIndex)] ?? 0
                const date = new Date(streak.year, 0, dayIndex + 1)
                const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const tooltipLabel = count === 0
                  ? `No activity on ${dateLabel}`
                  : `${count} activit${count === 1 ? 'y' : 'ies'} on ${dateLabel}`

                return (
                  // touch:true is required for the Tooltip to open on a tap at all —
                  // Mantine's default events are { hover: true, focus: false, touch: false }.
                  <Tooltip
                    key={dayIndex}
                    label={tooltipLabel}
                    withArrow
                    fz="xs"
                    events={{ hover: true, focus: true, touch: true }}
                  >
                    <div
                      className={classes.cell}
                      style={{ width: cellSize, height: cellSize, background: getColor(count) }}
                    />
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
