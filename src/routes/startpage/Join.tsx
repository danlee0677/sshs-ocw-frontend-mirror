/* Two bindings, deliberately NOT merged into one `classes` object. Only one rule
   is needed from the shared module, so a separate binding states the coupling at
   the import (the pattern Profile.tsx settled on for streakClasses) and leaves no
   room for a name in one file to silently shadow the other.

   The import is also what keeps shared.module.css ALIVE on this route: a CSS
   module import with no used bindings is tree-shaken, unlike a plain .css import.
   `shared.JalnanGothic` below is a used binding, which is what delivers the
   @font-face this page's heading needs — join.module.css no longer declares its
   own copy. Remove the usage and the font silently stops loading here. */
import shared from '../../styles/shared.module.css'
import classes from './join.module.css'
import { ActionIcon, Button, Flex, Loader, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconArrowBack } from '@tabler/icons-react'
import { useState } from 'react';
import { useFetcher } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import { TAP_TARGET, TOUCH_QUERY } from '../../libs/styles';

interface JoinProps {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  errorMessage: string | null;
}

export default function Join({ setStep, errorMessage }: JoinProps) {
  const [username, setUsername] = useState<string>("");
  const fetcher = useFetcher();

  const isChecking = fetcher.state !== "idle";
  const isTaken = fetcher.data?.available === false && fetcher.data?.username === username;
  const localError = (isTaken ? fetcher.data.message : "");

  // `undefined` on a mouse, 44 on a finger — see TOUCH_QUERY. The width fix in
  // the comment below still stands; only the unconditional HEIGHT is gated.
  const tapMin = useMediaQuery(TOUCH_QUERY, false, { getInitialValueInEffect: false })
    ? TAP_TARGET
    : undefined;

  const handleCheckAndSubmit = () => {
    if (username.length > 0) {
      fetcher.submit({ username: username }, { method: "post", action: "/action/auth/check-username" });
    }
  }

  return (
    /* mih, NOT h. With a fixed height plus align/justify center, anything taller
       than the viewport overflows ABOVE the container's top edge, into coordinates
       body scroll cannot reach — the error message plus a wrapped Korean heading
       gets there on a short landscape phone. `mih` lets the page grow and scroll.
       100vw also included the desktop scrollbar width, which guaranteed the
       horizontal scrollbar the definition of done forbids.

       py: the back ActionIcon below is `position: fixed` at top/left 20px while
       this Flex vertically centres the form, so on a short viewport the two
       collide. The top padding reserves the icon's band without moving it. */
    <Flex
      w="100%"
      mih="100dvh"
      align={'center'}
      justify={'center'}
      py={{ base: 72, sm: 'xl' }}
      px="md"
    >
      <ActionIcon onClick={() => { setStep((st) => (st - 1)) }} size={42} variant={'default'} className={classes.IconContainer}>
        <IconArrowBack size={30}></IconArrowBack>
      </ActionIcon>


      <Stack w={{ base: '100%', xs: '70%', sm: '50%', md: '40%' }} maw={480}>
        { errorMessage && (
          <Text c="red" fw={500} ta="center">
            { errorMessage === "NoUsername" ? "존재하지 않는 유저입니다. 회원가입을 해주세요." : 
              (errorMessage === "DuplicateUsername" ? "중복 닉네임입니다. 다른 닉네임을 사용해주세요." :
               "로그인 중 오류가 발생했습니다. 다시 시도해주세요.")}
          </Text>
        )}
        {/* Was `classes.Title` — a local rule that was font-family plus
            text-align. shared.module.css has no `.Title` (only `.JalnanGothic`),
            so the font-family half comes from there and the centring is a prop.
            Reaching for `shared.Title` would have been `undefined`: CSS Modules
            are per-file scoped and a missing key fails silently. */}
        <Title className={shared.JalnanGothic} ta="center">사용할 닉네임을 입력해 주세요</Title>
        {/* aria-label 추가: 접근 가능한 이름이 placeholder뿐이었습니다.
            placeholder는 글자를 입력하는 순간 사라지므로, 스크린리더는 이
            칸을 그냥 "편집창"이라고만 읽게 됩니다. 바로 위 Title이 같은
            내용을 이미 보여주고 있어 시각적 label 대신 aria-label을 씁니다. */}
        <TextInput placeholder='닉네임 입력' aria-label='닉네임'
          value={username} error={localError}
          onChange={(e) => setUsername(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckAndSubmit()}
          rightSection={isChecking ? <Loader size="xs" /> : null}
        />

        {/* Was w='20%' — ~58px inside the 100%-wide mobile stack at 320px, under
            the 44px tap minimum and far narrower than its own label. */}
        <Button w={{ base: '100%', sm: '40%' }} mih={tapMin}
          disabled={username.length === 0 || isTaken || isChecking}
          onClick={handleCheckAndSubmit}
        >다음</Button>
      </Stack>
    </Flex>
  )
}