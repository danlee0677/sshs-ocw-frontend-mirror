import { useEffect, useState, useMemo } from "react";
import { Form, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Button, Checkbox, CheckIcon, Combobox, Flex, Group, Paper, Pill, PillsInput, ScrollArea, Space, Stack, Table, Tabs, Text, TextInput, useCombobox } from "@mantine/core";
import { useableTags } from "../../libs/utils";
import { IconSearch } from "@tabler/icons-react";
import classes from './search.module.css'
import SearchAppshell from "../../components/appshell/SearchAppshell";
import z from "zod";
import { http } from "../../libs/http";

type TabValue = "subjectTitle" | "subjectDescription" | "lessonTitle"

const resultSchema = z.object({
  subjectTitle: z.array(z.object({ _id: z.string(), title: z.string() })),
  subjectDescription: z.array(z.object({ _id: z.string(), description: z.string() })),
  lessonTitle: z.array(z.object({ _id: z.string(), title: z.string(), subject: z.string() })),
})

const searchParamsSchema = z.object({
  keyword: z.string().max(20, "검색어 길이는 20자 이하여야 합니다!").default(""),
  tags: z.array(z.string()).default([]),
  subjectTitle: z.boolean().default(true),
  subjectDescription: z.boolean().default(true),
  or: z.boolean().default(false),
  lessonTitle: z.boolean().default(false),
})

type ResultType = z.infer<typeof resultSchema>

type SearchParamsType = z.infer<typeof searchParamsSchema>

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

    if (parsed.data.keyword.length > 20) throw new Response("Search Keyword is too long!", { status: 400 })

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
      <SearchContent key={location.search} searchResult={searchResult} searchParams={searchParams}/>
    </SearchAppshell>
  )
}

function SearchContent({ searchResult, searchParams }: { searchResult: ResultType, searchParams: SearchParamsType }) {
  const [activeTab, setActiveTab] = useState<TabValue>("subjectTitle")

  const [tags, setTags] = useState<string[]>(searchParams.tags.map((tag: string) => {
    return decodeURIComponent(tag).replace(/\+/g, ' ').trim();
  }) || []);

  // for tag selection
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })

  const navigate = useNavigate();

  const texthighlight = (text: string, keyword: string) => {
    if (!keyword) return text;
    const index = text.indexOf(keyword)
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
  const avaliableTabs = useMemo<TabValue[]>(() => {
    const arr: (TabValue | false)[] = [
      searchParams.subjectTitle && "subjectTitle",
      searchParams.subjectDescription && "subjectDescription",
      searchParams.lessonTitle && "lessonTitle"
    ]
    return arr.filter(Boolean) as TabValue[];
  }, [searchParams.subjectTitle, searchParams.subjectDescription, searchParams.lessonTitle])

  useEffect(() => {
    if (avaliableTabs.length === 0) return;
    if (!avaliableTabs.includes(activeTab)) {
      setActiveTab(avaliableTabs[0])
    }
  }, [avaliableTabs, activeTab])
  
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
              <Button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', 'padding': 0 }}>
                <IconSearch className={classes.searchIcon} color="black" />
              </Button>


            </Flex>

            <Group gap="md" w={'100%'} justify="center">
              <Tabs w={'80%'} value={activeTab} onChange={(v) => v && setActiveTab(v as TabValue)} keepMounted={false}>
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
                    <Flex>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Td w={200}>제목</Table.Td>
                            <Table.Td w={100}>링크</Table.Td>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.subjectTitle.map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td>{texthighlight(val.title, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                    </Flex>
                  </Tabs.Panel>
                )}

                {searchParams.subjectDescription && (
                  <Tabs.Panel value="subjectDescription">
                    <Flex>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Td w={200}>내용</Table.Td>
                            <Table.Td w={100}>링크</Table.Td>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.subjectDescription.map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td>{texthighlight(val.description, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                    </Flex>
                  </Tabs.Panel>
                )}

                {searchParams.lessonTitle && (
                  <Tabs.Panel value="lessonTitle">
                    <Flex>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Td w={200}>제목</Table.Td>
                            <Table.Td w={100}>링크</Table.Td>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.lessonTitle.map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td>{texthighlight(val.title, searchParams.keyword)}</Table.Td>
                              <Table.Td>
                                <Button type="button" onClick={() => navigate(`/lesson/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                    </Flex>
                  </Tabs.Panel>
                )}
              </Tabs>
            </Group>
          </Stack>

          <Stack w={'25%'} className={classes.GroupBox} align="center">
            <Flex w={'80%'} direction={'column'} justify={'center'} h={'300px'} gap={'xl'} align={'center'}>
              <Paper bg={'none'} w={'80%'}>
                <Checkbox name="subjectTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="과목 제목" defaultChecked={searchParams.subjectTitle} color="white" iconColor="black" />
                <Checkbox name="subjectDescription" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="과목 내용" defaultChecked={searchParams.subjectDescription} color="white" iconColor="black" />
                <Checkbox name="lessonTitle" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="강의 제목" defaultChecked={searchParams.lessonTitle} color="white" iconColor="black" />
                <Checkbox name="or" classNames={{ label: classes.CheckBoxLabel, body: classes.CheckBox }}
                  label="태그 or로 검색" defaultChecked={searchParams.or} color="white" iconColor="black" />
              </Paper>

              <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
                <Combobox.DropdownTarget>
                  <PillsInput onClick={() => combobox.openDropdown()}>
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


        </Flex>
      </Form>
    </ScrollArea>
  )
}