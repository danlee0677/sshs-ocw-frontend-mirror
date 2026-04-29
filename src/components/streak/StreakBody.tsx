import { Tooltip } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { type Streak } from "../../libs/types"
import classes from "./StreakBody.module.css"

interface StreakBodyProps {
  streak: Streak,
  threshold: number[],
  colors: string[],
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GAP = 2
const DAY_LABEL_AREA = 32  // 28px spacer + 4px gap between labels and grid

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function StreakBody({ streak, threshold, colors }: StreakBodyProps) {
  const { ref, width } = useElementSize()
  const dayMap = streak.days

  const totalDays = isLeapYear(streak.year) ? 366 : 365
  const startOffset = new Date(streak.year, 0, 1).getDay()
  const totalCols = Math.ceil((startOffset + totalDays) / 7)

  const gridAvailable = width - DAY_LABEL_AREA
  const cellSize = Math.max(4, Math.floor((gridAvailable - (totalCols - 1) * GAP) / totalCols))

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

  if (width === 0) return <div ref={ref} className={classes.wrapper} />

  return (
    <div ref={ref} className={classes.wrapper}>
      <div className={classes.monthRow}>
        <div className={classes.dayLabelSpacer} />
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
      </div>

      <div className={classes.gridRow}>
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
              <Tooltip key={dayIndex} label={tooltipLabel} withArrow fz="xs">
                <div
                  className={classes.cell}
                  style={{ width: cellSize, height: cellSize, background: getColor(count) }}
                />
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}
