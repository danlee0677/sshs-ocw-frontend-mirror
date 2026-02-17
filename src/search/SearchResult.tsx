import axios from "axios";
import { useEffect, useState, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import MainPageAppshell from "../main/MainPageAppshell";
import type { User } from "../libs/types";
import { Button, Checkbox, CheckIcon, Combobox, Flex, Group, Paper, Pill, PillsInput, ScrollArea, Stack, Table, Text, TextInput, Title, useCombobox } from "@mantine/core";
import { useableTags } from "../libs/utils";
import { IconSearch } from "@tabler/icons-react";
import classes from './search.module.css'

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

  const initalLocationState = location.state || {};

  const [subjectTitle, setSubjectTitle] = useState<boolean>(true);
  const [subjectDescription, setSubjectDescription] = useState<boolean>(true);
  const [lessonTitle, setLessonTitle] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>(initalLocationState.keyword || '');
  const [error, setError] = useState<string>("")
  const [isOr, setIsOr] = useState<boolean>(false);

  const [value, setValue] = useState<string>(initalLocationState.keyword || '');
  const [tags, setTags] = useState<string[]>(initalLocationState.tags || []);

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

  return (
    <MainPageAppshell navigate={navigate} setUser={setUser} user={user}>
      <ScrollArea h="100%" w="100%" scrollbarSize={10}>
        <Stack w="100%" h="100%" p="md">
          <Group w='100%' justify="center">
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
                      placeholder="태그를 선택하세요"
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

          <Paper>
            <Checkbox label="과목 제목" checked={subjectTitle}
              onChange={(e) => (setSubjectTitle(e.currentTarget.checked))} />
            <Checkbox label="과목 내용" checked={subjectDescription}
              onChange={(e) => (setSubjectDescription(e.currentTarget.checked))} />
            <Checkbox label="강의 제목" checked={lessonTitle}
              onChange={(e) => (setLessonTitle(e.currentTarget.checked))} />
            <Checkbox label="태그 or로 검색" checked={isOr}
              onChange={(e) => setIsOr(e.currentTarget.checked)} />
          </Paper>
          <Group gap="md">
            {subjectTitle && (
              <Flex>
                <Stack>
                  <Title order={3}>과목 제목</Title>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th w={300}>제목</Table.Th>
                        <Table.Th w={100}>링크</Table.Th>
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
                </Stack>
              </Flex>)
            }
            {subjectDescription && (
              <Flex>
                <Stack>
                  <Title order={3}>과목 설명</Title>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Td w={200}>설명</Table.Td>
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
                </Stack>
              </Flex>)
            }
            {lessonTitle && (
              <Flex>
                <Stack>
                  <Title order={3}>강의 제목</Title>
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
                </Stack>
              </Flex>)
            }
          </Group>
        </Stack>
      </ScrollArea>
    </MainPageAppshell>
  )
}

export default SearchResult;