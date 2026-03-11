import { Box, Image, Loader, Stack, Text } from "@mantine/core";
import appLogo from "@/assets/app-logo.png";
import classes from "./Loading.module.css";

export default function LoadingPage() {
  return (
    <Box className={classes.page}>
      <Box className={classes.glow} />

      <Stack align="center" gap={0} style={{ position: "relative", zIndex: 1 }}>
        <Box className={`${classes.entry} ${classes.d1}`}>
          <Image src={appLogo} className={classes.logo} />
        </Box>

        <Box className={`${classes.entry} ${classes.d2}`}>
          <Text className={classes.title}>SSHS TIPS</Text>
        </Box>

        <Box className={`${classes.entry} ${classes.d3}`} mt={20}>
          <Loader type="oval" color="blue" size="md" />
        </Box>
      </Stack>
    </Box>
  );
}
