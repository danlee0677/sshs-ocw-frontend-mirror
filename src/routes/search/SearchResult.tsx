import { useEffect, useState, useMemo } from "react";
import { Form, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Button, Checkbox, CheckIcon, Combobox, Flex, Group, Pagination, Paper, Pill, PillsInput, ScrollArea, Space, Stack, Table, Tabs, Text, TextInput, useCombobox } from "@mantine/core";
import { useableTags } from "../../libs/utils";
import { IconSearch } from "@tabler/icons-react";
import classes from './search.module.css'
import SearchAppshell from "../../components/appshell/SearchAppshell";
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
    <SearchAppshell>
      <SearchContent key={location.search} searchResult={searchResult} searchParams={searchParams} />
    </SearchAppshell>
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
  const [activeTab, setActiveTab] = useState<TabValue>("subjectTitle")
  const [page, setPage] = useState(1);

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

  // make list for avaliable search type
  const availableTabs = useMemo<TabValue[]>(() => {
    const arr: (TabValue | false)[] = [
      searchParams.subjectTitle && "subjectTitle",
      searchParams.subjectDescription && "subjectDescription",
      searchParams.lessonTitle && "lessonTitle"
    ]
    return arr.filter(Boolean) as TabValue[];
  }, [searchParams.subjectTitle, searchParams.subjectDescription, searchParams.lessonTitle])

  useEffect(() => {
    if (availableTabs.length === 0) return;
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
      setPage(1);
    }
  }, [availableTabs, activeTab])

  return (
    <ScrollArea h="100%" w="100%" scrollbarSize={10}>
      <Form method="get" style={{ width: "100%", height: "100%" }}>
        { /* hidden inputs */}
        {tags.map((tag) =>
          <input type="hidden" name="tags" value={encodeURIComponent(tag)} key={`hidden-${tag}`} />)
        }
        <input type="hidden" name="advanced" value="on" />

        <Flex w="90%" h="100%" p="md" justify="center">
          <Stack w='80%'>
            <Flex w={'100%'} justify="center" align="center">
              <TextInput
                name="keyword"
                placeholder="검색어를 입력해 주세요."
                maxLength={20}
                defaultValue={searchParams.keyword}
                className={`${classes.searchBar}`} />
              <Space w={10} />
              <Button type="submit" variant="outline" className={classes.searchButton}>검색</Button>
            </Flex>

            <Group gap="md" w={'100%'} justify="center">
              <Tabs w={'80%'} value={activeTab} onChange={(v) => { if (v) { setActiveTab(v as TabValue); setPage(1); } }} keepMounted={false}>
                <Tabs.List>
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
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={TITLE_WIDTH} c="dimmed" fz="sm">제목</Table.Th>
                            <Table.Th w={LINK_WIDTH} c="dimmed" fz="sm">링크</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.subjectTitle.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td className={classes.resultTitle} onClick={() => navigate(`/subject/${val._id}`)}>{texthighlight(val.title, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" variant="subtle" size="sm" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                      {Math.ceil(searchResult.subjectTitle.length / ITEMS_PER_PAGE) > 1 && (
                        <Pagination total={Math.ceil(searchResult.subjectTitle.length / ITEMS_PER_PAGE)} value={page} onChange={setPage} />
                      )}
                    </Stack>
                  </Tabs.Panel>
                )}

                {searchParams.subjectDescription && (
                  <Tabs.Panel value="subjectDescription">
                    <Stack gap="md">
                      <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={TITLE_WIDTH} c="dimmed" fz="sm">내용</Table.Th>
                            <Table.Th w={LINK_WIDTH} c="dimmed" fz="sm">링크</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.subjectDescription.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td className={classes.resultTitle} onClick={() => navigate(`/subject/${val._id}`)}>{texthighlight(val.description, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" variant="subtle" size="sm" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                      {Math.ceil(searchResult.subjectDescription.length / ITEMS_PER_PAGE) > 1 && (
                        <Pagination total={Math.ceil(searchResult.subjectDescription.length / ITEMS_PER_PAGE)} value={page} onChange={setPage} />
                      )}
                    </Stack>
                  </Tabs.Panel>
                )}

                {searchParams.lessonTitle && (
                  <Tabs.Panel value="lessonTitle">
                    <Stack gap="md">
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

          <Stack w={'25%'} className={classes.GroupBox} align="center" py="xl" mt={120} style={{ alignSelf: 'flex-start' }}>
            <Flex w={'80%'} direction={'column'} justify={'space-between'} h={'300px'} align={'center'}>
              <Paper bg={'none'} w={'80%'} h="30%">
                <Checkbox name="subjectTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="과목 제목" defaultChecked={searchParams.subjectTitle} color="white" iconColor="black" />
                <Checkbox name="subjectDescription" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="과목 내용" defaultChecked={searchParams.subjectDescription} color="white" iconColor="black" />
                <Checkbox name="lessonTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="강의 제목" defaultChecked={searchParams.lessonTitle} color="white" iconColor="black" />
                <Checkbox name="or" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="태그 or로 검색" defaultChecked={searchParams.or} color="white" iconColor="black" />
              </Paper>

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
            </Flex>
          </Stack>


        </Flex>
      </Form>
    </ScrollArea>
  )
}