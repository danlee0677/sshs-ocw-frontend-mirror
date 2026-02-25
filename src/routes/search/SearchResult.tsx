import axios from "axios";
import { useEffect, useState, useMemo, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import MainPageAppshell from "../main/MainPageAppshell";
import type { User } from "../libs/types";
import { Button, Checkbox, CheckIcon, Combobox, Flex, Group, Paper, Pill, PillsInput, ScrollArea, Stack, Table, Tabs, Text, TextInput, Title, useCombobox } from "@mantine/core";
import { useableTags } from "../libs/utils";
import { IconSearch } from "@tabler/icons-react";
import classes from './search.module.css'

type TabValue = "subjectTitle" | "subjectDescription" | "lessonTitle"

interface ResultType {
  subjectTitle: { _id: string, title: string }[],
  subjectDescription: { _id: string, description: string }[],
  lessonTitle: { _id: string, title: string, subject: string }[],
}

const PLACEHOLDER_RESULT: ResultType = {
  subjectTitle: [],
  subjectDescription: [],
  lessonTitle: []
}

function SearchResult({ user, setUser }: { user: User | null, setUser: React.Dispatch<SetStateAction<User | null>> }) {
  const location = useLocation();

  const initalLocationState = location.state || { tags: [] };

  const [subjectTitle, setSubjectTitle] = useState<boolean>(true);
  const [subjectDescription, setSubjectDescription] = useState<boolean>(true);
  const [lessonTitle, setLessonTitle] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>(initalLocationState.keyword || '');
  const [error, setError] = useState<string>("")
  const [isOr, setIsOr] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabValue>("subjectTitle")

  const [value, setValue] = useState<string>(initalLocationState.keyword || '');
  const [tags, setTags] = useState<string[]>(initalLocationState.tags.map((tag: string) => {
    const temp = decodeURIComponent(tag).replace(/\+/g, ' ').trim();
    console.log(`Tag: "${temp}" | Codes: ${temp.split('').map(c => c.charCodeAt(0))}`);
    return temp;
  }) || []);

  const [searchResult, setSearchResult] = useState<ResultType>(PLACEHOLDER_RESULT);

  // for tag selection
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })


  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (keyword.length <= 20) {
      const fetchData = async () => {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/search`, {
            subjectTitle: subjectTitle,
            subjectDescription: subjectDescription,
            lessonTitle: lessonTitle,
            keyword: keyword,
            tags: tags,
            or: isOr,
          });
          setSearchResult(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [keyword, tags, subjectTitle, subjectDescription, lessonTitle, isOr]);

  const handleSearch = () => {
    if (value.length > 20) {
      setError("검색어 길이는 20자 이하여야 합니다!")
      return;
    }
    setKeyword(value);
  }

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
      subjectTitle && "subjectTitle",
      subjectDescription && "subjectDescription",
      lessonTitle && "lessonTitle"
    ]
    return arr.filter(Boolean) as TabValue[];
  }, [subjectTitle, subjectDescription, lessonTitle])

  useEffect(() => {
    if (avaliableTabs.length === 0) return;
    if (!avaliableTabs.includes(activeTab)) {
      setActiveTab(avaliableTabs[0])
    }
  }, [avaliableTabs, activeTab])

  return (
    <MainPageAppshell navigate={navigate} setUser={setUser} user={user}>
      <ScrollArea h="100%" w="100%" scrollbarSize={10}>
        <Flex w="90%" h="100%" p="md" justify="center">
          <Stack w='80%'>
            <Group w={'100%'} justify="center">
              <IconSearch onClick={handleSearch} className={classes.searchIcon} />
              {error.length === 0 ?
                <TextInput placeholder="검색어를 입력해 주세요."
                  value={value}
                  onChange={(e) => {
                    setValue(e.currentTarget.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleSearch();
                  }}
                  className={`${classes.searchBar}`} />
                :
                <TextInput placeholder="검색어를 입력해 주세요."
                  value={value} error={error}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (e.currentTarget.value.length < 20) setError("");
                  }}
                  className={`${classes.searchBar}`} />
              }
            </Group>

            <Group gap="md" w={'100%'} justify="center">
              <Tabs w={'80%'} value={activeTab} onChange={(v) => v && setActiveTab(v as TabValue)} keepMounted={false}>
                <Tabs.List>
                  {subjectTitle && (
                    <Tabs.Tab value="subjectTitle">과목 제목</Tabs.Tab>
                  )}
                  {subjectDescription && (
                    <Tabs.Tab value="subjectDescription">과목 내용</Tabs.Tab>
                  )}
                  {lessonTitle && (
                    <Tabs.Tab value="lessonTitle">강의 제목</Tabs.Tab>
                  )}
                </Tabs.List>

                {subjectTitle && (
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
                              <Table.Td>{texthighlight(val.title, keyword)}</Table.Td>
                              <Table.Td>
                                <Button onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                    </Flex>
                  </Tabs.Panel>
                )}

                {subjectDescription && (
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
                              <Table.Td>{texthighlight(val.description, keyword)}</Table.Td>
                              <Table.Td>
                                <Button onClick={() => navigate(`/subject/${val._id}`)}>바로가기</Button>
                              </Table.Td>
                            </Table.Tr>
                          })}
                        </Table.Tbody>
                      </Table>
                    </Flex>
                  </Tabs.Panel>
                )}

                {lessonTitle && (
                  <Tabs.Panel value="lessonTitle">
                    <Flex>
                      <Table>
                        <Table.Thead>
                          <Table.Td w={200}>제목</Table.Td>
                          <Table.Td w={100}>링크</Table.Td>
                        </Table.Thead>
                        <Table.Tbody>
                          {searchResult.lessonTitle.map((val) => {
                            return <Table.Tr key={val._id}>
                              <Table.Td>{texthighlight(val.title, keyword)}</Table.Td>
                              <Table.Td>
                                <Button onClick={() => navigate(`/lesson/${val._id}?subjectId=${val.subject}`)}>바로가기</Button>
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
                <Checkbox classNames={{label: classes.CheckBoxLabel, body: classes.CheckBox}}
                label="과목 제목" checked={subjectTitle} color="white" iconColor="black"
                  onChange={(e) => (setSubjectTitle(e.currentTarget.checked))} />
                <Checkbox classNames={{label: classes.CheckBoxLabel, body: classes.CheckBox}}
                label="과목 내용" checked={subjectDescription} color="white" iconColor="black"
                  onChange={(e) => (setSubjectDescription(e.currentTarget.checked))} />
                <Checkbox classNames={{label: classes.CheckBoxLabel, body: classes.CheckBox}}
                label="강의 제목" checked={lessonTitle} color="white" iconColor="black"
                  onChange={(e) => (setLessonTitle(e.currentTarget.checked))} />
                <Checkbox classNames={{label: classes.CheckBoxLabel, body: classes.CheckBox}}
                label="태그 or로 검색" checked={isOr}  color="white" iconColor="black"
                  onChange={(e) => setIsOr(e.currentTarget.checked)} />
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
      </ScrollArea>
    </MainPageAppshell>
  )
}

export default SearchResult;