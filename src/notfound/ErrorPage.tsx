import { Box, Button, Container, Group, Stack, Text, Title, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import classes from './Errorpage.module.css'

const particles = Array.from({ length: 18 }, (_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${4 + Math.random() * 4}s`,
  transform: `scale(${0.5 + Math.random() * 1.5})`,
}));


function ErrorPage() {
  const navigate = useNavigate();
  
  const [visible, setVisible] = useState(false);
  const { colorScheme } = useMantineColorScheme();

  const isLight = colorScheme === "light";
  const pageClass = `${classes.page} ${isLight ? classes.light : ""}`

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const title = "Something went wrong!"
  const description = "We encountered an unexpected error while processing your request. Our team has been notified and is working on a fix. Please try again in a few moments, or contact support if the issue persists."
  const code = "500"
  const onRetry = () => navigate("/home");
  const onGoHome = () => navigate("/home");

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