import { createTheme } from "@mui/material/styles";

const colors = {
  primary: "#1472D3", // Blue
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
  },
});

export default theme;
