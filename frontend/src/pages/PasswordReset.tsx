import { useParams } from "react-router-dom";
import { LockReset } from "@mui/icons-material";
import { Container, Grid, Stack } from "@mui/material";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";
import { InputWithIcon } from "../components/InputWithIcon";
import { StyledButton } from "../components/StyledButton";

export const PasswordReset = () => {
  // TODO: Implement form and logic
  const { userId, code } = useParams();

  return (
    <Grid container height="100vh">
      <Grid container item xs={8} alignItems="center" bgcolor="primary.main">
        <Container
          component="img"
          src={PairProgrammingImage}
          sx={{ width: "50%" }}
        />
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={4} width="100%" height="100%" justifyContent="center">
          <Container component="img" src={LogoImage} sx={{ width: "35%" }} />
          <Stack spacing={4} sx={{ px: "4%" }}>
            <Stack spacing={4} alignItems="center">
              <InputWithIcon
                type="password"
                label="New Password"
                Icon={LockReset}
              />
              <InputWithIcon
                type="password"
                label="Confirm New Password"
                Icon={LockReset}
              />
            </Stack>
            <Stack direction="row" justifyContent="space-around">
              <StyledButton label="Continue" />
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
