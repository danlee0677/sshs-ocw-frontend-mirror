import { useState, useMemo } from "react";
import { Form, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Badge, Button, Checkbox, CheckIcon, Collapse, Combobox, Flex, Group, Pagination, Pill, PillsInput, ScrollArea, Stack, Table, Tabs, Text, TextInput, UnstyledButton, useCombobox } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { useableTags } from "../../libs/utils";
import { FROM_MD_QUERY } from "../../libs/styles";
import classes from './search.module.css'
import MainPageAppshell from "../../components/appshell/MainPageAppshell";
import { http } from "../../libs/http";
import { searchParamsSchema, resultSchema, type ResultType, type SearchParamsType } from "../../libs/types";

type TabValue = "subjectTitle" | "subjectDescription" | "lessonTitle"

export async function clientLoader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);

    const isAdvancedSearch = url.searchParams.get('advanced')

    let rawParams = {};
    if (Array.from(url.searchParams.keys()).length > 0) {
      rawParams = {
        keyword: url.searchParams.get("keyword") || "",
        // 모든 태그 가져오기
        tags: url.searchParams.getAll("tags"),
        subjectTitle: isAdvancedSearch ? url.searchParams.get("subjectTitle") === "on" : undefined,
        subjectDescription: isAdvancedSearch ? url.searchParams.get("subjectDescription") === "on" : undefined,
        lessonTitle: isAdvancedSearch ? url.searchParams.get("lessonTitle") === "on" : undefined,
        or: isAdvancedSearch ? url.searchParams.get("or") === "on" : undefined,
        teacherCertified: isAdvancedSearch ? url.searchParams.get("teacherCertified") === "on" : undefined,
      }
    }

    const parsed = searchParamsSchema.safeParse(rawParams);
    if (!parsed.success) throw new Error("Invalid search tag/keyword format");

    const decodedTags = {
      ...parsed.data,
      tags: parsed.data.tags.map((tag) => decodeURIComponent(tag))
    }

    const res = await http.post(`${import.meta.env.VITE_API_URL}/api/search`, decodedTags);
    const searchParsed = resultSchema.safeParse(res.data);

    if (!searchParsed.success) throw new Error("Failed to parse search");

    return { searchResult: searchParsed.data, searchParams: decodedTags };
  } catch (err) {
    if (err instanceof Response) throw err;
    throw err;
  }
}

export default function SearchResult() {
  const { searchResult, searchParams } = useLoaderData<typeof clientLoader>();
  const location = useLocation();

  return (
    <MainPageAppshell showSearch={false}>
      <SearchContent key={location.search} searchResult={searchResult} searchParams={searchParams} />
    </MainPageAppshell>
  )
}

const texthighlight = (text: string, keyword: string) => {
  if (!keyword) return text;
  const index = text.toLowerCase().indexOf(keyword.toLowerCase())
  if (index === -1) return <Text>{text}</Text>

  const before = text.slice(0, index)
  const match = text.slice(index, index + keyword.length)
  const after = text.slice(index + keyword.length)

  return <>
    <Text span truncate="start">{before}</Text>
    <Text span fw={700}>{match}</Text>
    <Text span truncate="end">{after}</Text>
  </>
}

function SearchContent({ searchResult, searchParams }: { searchResult: ResultType, searchParams: SearchParamsType }) {
  // null = "no explicit choice yet", so the fallback below picks the first
  // available tab. The old initial value of "subjectTitle" was simply wrong
  // whenever that search type was unchecked, which is what the removed effect
  // existed to paper over.
  const [selectedTab, setSelectedTab] = useState<TabValue | null>(null)
  const [page, setPage] = useState(1);

  // Mobile filter disclosure.
  //
  // FROM_MD_QUERY (min-width: 62em), NOT the negation of TABLET_QUERY
  // (max-width: 62em). The toggle below is `hiddenFrom="md"`, which Mantine
  // compiles to `(min-width: 62em) { display: none !important }` — so keying the
  // JS off a max-width query made both match at exactly 62em/992px: the panel
  // collapsed AND the toggle that opens it was hidden, leaving an empty card
  // with no way in. Both sides now evaluate the SAME query and therefore agree
  // at every width. See the FROM_*_QUERY doc in libs/styles.ts.
  //
  // getInitialValueInEffect:false reads matchMedia synchronously — safe, this is
  // a SPA and SearchContent never appears in the prerendered shell.
  const isDesktopFilters = useMediaQuery(FROM_MD_QUERY, false, { getInitialValueInEffect: false })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersExpanded = isDesktopFilters || filtersOpen

  const ITEMS_PER_PAGE = 10;
  const TITLE_WIDTH = 250;
  const LINK_WIDTH = 50;

  const [tags, setTags] = useState<string[]>(searchParams.tags || []);

  // for tag selection
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })

  const navigate = useNavigate();

  const handleValueSelect = (val: string) =>
    setTags((cur) =>
      cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]
    );

  const handleValueRemove = (val: string) =>
    setTags((cur) => cur.filter((v) => v !== val));

  const displayTags = tags.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ))

  const options = useableTags
    .map((item) => (
      <Combobox.Option value={item} key={item} active={tags.includes(item)}>
        <Group gap="sm">
          {tags.includes(item) ? <CheckIcon size={12} /> : null}
          <span>{item}</span>
        </Group>
      </Combobox.Option>
    ))

  const filteredSubjectTitle = searchParams.teacherCertified
    ? searchResult.subjectTitle.filter(v => v.teacher_certified)
    : searchResult.subjectTitle;
  const filteredSubjectDescription = searchParams.teacherCertified
    ? searchResult.subjectDescription.filter(v => v.teacher_certified)
    : searchResult.subjectDescription;

  // make list for avaliable search type
  const availableTabs = useMemo<TabValue[]>(() => {
    const arr: (TabValue | false)[] = [
      searchParams.subjectTitle && "subjectTitle",
      searchParams.subjectDescription && "subjectDescription",
      searchParams.lessonTitle && "lessonTitle"
    ]
    return arr.filter(Boolean) as TabValue[];
  }, [searchParams.subjectTitle, searchParams.subjectDescription, searchParams.lessonTitle])

  // Derived during render, not synced in an effect. The old version called
  // setActiveTab + setPage from an effect body (react-hooks/set-state-in-effect),
  // which cost a cascading re-render on every mount where the stored tab was not
  // available. It is safe to derive because `availableTabs` is a useMemo over
  // `searchParams` props and SearchContent is remounted on every submit via
  // `key={location.search}` — so it is constant for this component's lifetime.
  // `availableTabs` can legitimately be empty (advanced=on with all three
  // unchecked), and Tabs accepts value={null}.
  const activeTab = selectedTab ?? availableTabs[0] ?? null;

  return (
    <ScrollArea h="100%" w="100%" scrollbarSize={10}>
      <Form method="get" style={{ width: "100%", height: "100%" }}>
        { /* hidden inputs */}
        {tags.map((tag) =>
          <input type="hidden" name="tags" value={encodeURIComponent(tag)} key={`hidden-${tag}`} />)
        }
        <input type="hidden" name="advanced" value="on" />

        {/* Was `w="90%"` containing an 80% and a 25% column — 105%, so the filter
            sidebar was pushed past the right edge at every width. */}
        <Flex
          w="100%"
          h="100%"
          p="md"
          gap="md"
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'flex-start' }}>
          <Stack w={{ base: '100%', md: '72%' }}>
            <Flex w={'100%'} gap="xs" justify="center" align="center">
              <TextInput
                name="keyword"
                placeholder="검색어를 입력해 주세요."
                maxLength={20}
                defaultValue={searchParams.keyword}
                flex={1}
                className={`${classes.searchBar}`} />
              <Button type="submit" variant="outline" style={{ flex: '0 0 auto' }} className={classes.searchButton}>검색</Button>
            </Flex>

            <Group gap="md" w={'100%'} justify="center">
              {/* was w='80%' nested inside another w='80%' Stack — the triple-nested
                  percentages are why results rendered so narrow */}
              <Tabs w={'100%'} value={activeTab} onChange={(v) => { if (v) { setSelectedTab(v as TabValue); setPage(1); } }} keepMounted={false}>
                {/* 3 Korean tabs overflow below 360px */}
                <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                  {searchParams.subjectTitle && (
                    <Tabs.Tab value="subjectTitle">과목 제목</Tabs.Tab>
                  )}
                  {searchParams.subjectDescription && (
                    <Tabs.Tab value="subjectDescription">과목 내용</Tabs.Tab>
                  )}
                  {searchParams.lessonTitle && (
                    <Tabs.Tab value="lessonTitle">강의 제목</Tabs.Tab>
                  )}
                </Tabs.List>

                {searchParams.subjectTitle && (
                  <Tabs.Panel value="subjectTitle">
                    <Stack gap="md">
                      <Table.ScrollContainer minWidth={340}>
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={TITLE_WIDTH} c="dimmed" fz="sm">제목</Table.Th>
                            <Table.Th w={LINK_WIDTH} c="dimmed" fz="sm">링크</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {filteredSubjectTitle.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td className={classes.resultTitle} onClick={() => navigate(`/subject/${val._id}`)}>
                                <Group gap="xs" wrap="nowrap">
                                  {/* Badge, not Pill: Pill has no `color` prop and no 'light' variant, so both
                                      props were silently ignored and this rendered plain grey. */}
                                  {val.teacher_certified && <Badge color="green" variant="light" size="sm">인증</Badge>}
                                  {texthighlight(val.title, searchParams.keyword)}
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Button type="button" variant="subtle" size="sm" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                      </Table.ScrollContainer>
                      {Math.ceil(filteredSubjectTitle.length / ITEMS_PER_PAGE) > 1 && (
                        <Pagination total={Math.ceil(filteredSubjectTitle.length / ITEMS_PER_PAGE)} value={page} onChange={setPage} />
                      )}
                    </Stack>
                  </Tabs.Panel>
                )}

                {searchParams.subjectDescription && (
                  <Tabs.Panel value="subjectDescription">
                    <Stack gap="md">
                      <Table.ScrollContainer minWidth={340}>
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={TITLE_WIDTH} c="dimmed" fz="sm">내용</Table.Th>
                            <Table.Th w={LINK_WIDTH} c="dimmed" fz="sm">링크</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {filteredSubjectDescription.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td className={classes.resultTitle} onClick={() => navigate(`/subject/${val._id}`)}>
                                <Group gap="xs" wrap="nowrap">
                                  {/* Badge, not Pill: Pill has no `color` prop and no 'light' variant, so both
                                      props were silently ignored and this rendered plain grey. */}
                                  {val.teacher_certified && <Badge color="green" variant="light" size="sm">인증</Badge>}
                                  {texthighlight(val.description, searchParams.keyword)}
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Button type="button" variant="subtle" size="sm" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                      </Table.ScrollContainer>
                      {Math.ceil(filteredSubjectDescription.length / ITEMS_PER_PAGE) > 1 && (
                        <Pagination total={Math.ceil(filteredSubjectDescription.length / ITEMS_PER_PAGE)} value={page} onChange={setPage} />
                      )}
                    </Stack>
                  </Tabs.Panel>
                )}

                {searchParams.lessonTitle && (
                  <Tabs.Panel value="lessonTitle">
                    <Stack gap="md">
                      <Table.ScrollContainer minWidth={340}>
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={TITLE_WIDTH} c="dimmed" fz="sm">제목</Table.Th>
                            <Table.Th w={LINK_WIDTH} c="dimmed" fz="sm">링크</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.lessonTitle.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td className={classes.resultTitle} onClick={() => navigate(`/lesson/${val._id}`)}>{texthighlight(val.title, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" variant="subtle" size="sm" onClick={() => navigate(`/lesson/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                      </Table.ScrollContainer>

                      {Math.ceil(searchResult.lessonTitle.length / ITEMS_PER_PAGE) > 1 && (
                        <Group justify="center" w="100%">
                          <Pagination total={Math.ceil(searchResult.lessonTitle.length / ITEMS_PER_PAGE)} value={page} onChange={setPage} />
                        </Group>
                      )}

                    </Stack>
                  </Tabs.Panel>
                )}
              </Tabs>
            </Group>
          </Stack>

          {/* ONE sidebar instance, never conditionally unmounted: every control below
              lives inside <Form method="get">, and an unmounted input is not submitted.

              This deliberately does NOT render two copies behind
              visibleFrom/hiddenFrom. Those compile to `display: none !important`, and
              display:none inputs ARE still submitted — so a single instance already
              satisfies the never-unmount rule, while two copies would submit two
              values per name. The checkboxes are uncontrolled (defaultChecked, no
              onChange), so the copies would diverge the moment a user toggled the
              visible one, and the loader's searchParams.get() takes the FIRST match —
              which could be the stale hidden copy. Only the disclosure chrome is
              responsive.

              Three ways to break this:
              - Do NOT add `keepMounted` to the Collapse. It keeps the closed panel at
                height 0 but still focusable, putting five invisible checkboxes into
                the mobile tab order.
              - Do NOT set `transitionDuration={0}`, and do NOT enable
                `theme.respectReducedMotion`. Collapse returns null when the resolved
                duration is 0, which would silently drop all five fields from every
                search. Mantine defaults respectReducedMotion to false and root.tsx
                does not override it, so this is safe only by default.
              - Do NOT swap Collapse for Accordion. AccordionPanel has no keepMounted
                escape hatch and renders a Collapse internally, hitting the same branch.

              `filtersOpen` resets to closed after each search because SearchContent is
              remounted via key={location.search}. That is intended. */}
          <Stack w={{ base: '100%', md: '28%' }} className={classes.GroupBox} p="md" gap="sm">
            <UnstyledButton
              hiddenFrom="md"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersExpanded}
              aria-controls="search-filters"
              py="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text fw={500}>검색 옵션</Text>
                <IconChevronDown
                  size={18}
                  style={{
                    transform: filtersExpanded ? 'rotate(180deg)' : undefined,
                    transition: 'transform 150ms ease',
                  }} />
              </Group>
            </UnstyledButton>

            <Collapse in={filtersExpanded} id="search-filters">
              <Stack w="100%" gap="md">
                <Stack gap="xs" w="100%">
                  {/* color="white" iconColor="black" removed from all five: already low
                      contrast on a light card, and in dark mode a white blob with an
                      invisible black check. The theme primary handles both schemes. */}
                  <Checkbox name="subjectTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                    label="과목 제목" defaultChecked={searchParams.subjectTitle} />
                  <Checkbox name="subjectDescription" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                    label="과목 내용" defaultChecked={searchParams.subjectDescription} />
                  <Checkbox name="lessonTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                    label="강의 제목" defaultChecked={searchParams.lessonTitle} />
                  <Checkbox name="or" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                    label="태그 or로 검색" defaultChecked={searchParams.or} />
                  <Checkbox name="teacherCertified" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                    label="교사 인증 과목만" defaultChecked={searchParams.teacherCertified} />
                </Stack>

              <Flex w="100%" justify="center">
                <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
                  <Combobox.DropdownTarget>
                    <PillsInput onClick={() => combobox.openDropdown()} w="80%">
                      <Pill.Group>
                        {displayTags}

                        <Combobox.EventsTarget>
                          <PillsInput.Field
                            onFocus={() => combobox.openDropdown()}
                            onBlur={() => combobox.closeDropdown()}
                            onChange={() => {
                              combobox.updateSelectedOptionIndex();
                            }}
                            placeholder={tags.length > 0 ? "" : "태그를 입력해 주세요"}
                          />
                        </Combobox.EventsTarget>
                      </Pill.Group>
                    </PillsInput>
                  </Combobox.DropdownTarget>

                  <Combobox.Dropdown>
                    <Combobox.Options>
                      {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
                    </Combobox.Options>
                  </Combobox.Dropdown>
                </Combobox>
              </Flex>
              </Stack>
            </Collapse>
          </Stack>


        </Flex>
      </Form>
    </ScrollArea>
  )
}