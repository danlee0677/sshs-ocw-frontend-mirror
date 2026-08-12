import { Box, Button, Container, Group, Stack, Text, Title, useComputedColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import classes from './Errorpage.module.css'

const particles = Array.from({ length: 18 }, () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${4 + Math.random() * 4}s`,
  transform: `scale(${0.5 + Math.random() * 1.5})`,
}));


function ErrorPage() {
  const navigate = useNavigate();

  const error = useRouteError();
  console.log(error)
  
  const [visible, setVisible] = useState(false);
  // `useComputedColorScheme`, NEVER `useMantineColorScheme().colorScheme`. The
  // latter returns the LITERAL STRING 'auto' when the user picks 자동 — so
  // `colorScheme === "light"` was false and this page rendered its DARK palette
  // on a light OS. Only the computed hook resolves 'auto' to light | dark.
  //
  // This is load-bearing for the defaultColorScheme='auto' flip: with 'auto' as
  // the default, EVERY user has colorScheme === 'auto' until they touch the
  // toggle, so the bug would have gone from an edge case to the common path.
  //
  // Same trap as ColorSchemeToggle, getStreakColors and useAppLogo.
  // `getInitialValueInEffect: false` is safe: this is a SPA and ErrorPage is
  // not in the prerendered shell, so a synchronous first read has nothing to
  // mismatch against and avoids a one-frame palette flip.
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: false });

  const isLight = computed === "light";
  const pageClass = `${classes.page} ${isLight ? classes.light : ""}`

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  let title = "Something went wrong!"
  let description = "We encountered an unexpected error while processing your request. Our team has been notified and is working on a fix. Please try again in a few moments, or contact support if the issue persists."
  let code = "500"

  if (isRouteErrorResponse(error)) {
    code = error.status.toString();
    title = error.statusText || "Oops!"
    if (typeof error.data === "string") 
      description = error.data;
    else if (error.data?.message)
      description = error.data.message;
    else if (error.status === 404)
      description = "The page you are looking for doesn't exist or has been moved.";
  } else if (error instanceof Error) {
    code = "Oops!"
    title = "Application Error!"
    description = error.message;
  }

  const onRetry = () => window.location.reload();
  const onGoHome = () => navigate("/");

  return (
    <Box className={pageClass}>

      {/* Background decorations */}
      <Box className={classes.glow} />
      <Box className={classes.pulseRing} />

      <Box className={classes.lines}>
        <Box className={`${classes.line} ${classes.linePrimary}`} />
        <Box className={`${classes.line} ${classes.lineSecondary}`} />
      </Box>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Box key={i} className={classes.particle} style={p} />
      ))}

      {/* Main content */}
      {/* `size="sm"` (640) is DELIBERATE and is the one sanctioned exception to
          the never-pass-a-Container-size rule. That rule exists because
          `size="lg"` is 1140 and silently disagrees with CONTENT_MAX_WIDTH's
          1200 — it polices values that are TRYING to be the content cap. This
          one is not: it is a narrow measure for a centred error message, and
          removing it would run the copy to 1200px. Do not "fix" it. */}
      <Container size="sm" className={classes.content}>
        <Stack gap={0} align="center">

          {visible && (
            <Box className={`${classes.errorContainer} ${classes.d1}`}>
              <Text className={classes.code}>{code}</Text>
            </Box>
          )}

          {visible && (
            <Box className={`${classes.errorContainer} ${classes.d2} ${classes.dividerWrap}`}>
              <Box className={classes.divider} />
            </Box>
          )}

          {visible && (
            <Box className={`${classes.errorContainer} ${classes.d2}`}>
              <Title order={1} className={classes.title}>{title}</Title>
            </Box>
          )}

          {visible && (
            <Box className={`${classes.errorContainer} ${classes.d3} ${classes.descriptionWrap}`}>
              <Text className={classes.description}>{description}</Text>
            </Box>
          )}

          {visible && (
            <Box className={`${classes.errorContainer} ${classes.d4}`}>
              <Group gap="md" justify="center">
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="md"
                  className={classes.btnRetry}
                >
                  Try Again
                </Button>
                <Button
                  onClick={onGoHome}
                  variant="subtle"
                  size="md"
                  className={classes.btnHome}
                >
                  Go Home
                </Button>
              </Group>
            </Box>
          )}

        </Stack>
      </Container>

      {/* Footer */}
      <Box className={classes.footer}>
        <Text className={classes.footerText}>
          Error Reference · {new Date().toISOString().split("T")[0]}
        </Text>
      </Box>

    </Box>
  )
}


export default ErrorPage;