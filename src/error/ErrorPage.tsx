import { Box, Button, Container, Group, Stack, Text, Title, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import classes from './Errorpage.module.css'

const particles = Array.from({ length: 18 }, (_) => ({
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
  const { colorScheme } = useMantineColorScheme();

  const isLight = colorScheme === "light";
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