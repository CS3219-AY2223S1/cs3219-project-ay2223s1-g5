import { createTheme } from "@mui/material/styles";

const colors = {
  blue: "#1472D3",
  orange: "#EF7C00",
  white: "#FFFFFF",
};

const theme = createTheme({
  typography: {
    fontSize: 16,
  },
  palette: {
    primary: {
      main: colors.blue,
      light: colors.white,
    },
    secondary: {
      main: colors.orange,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export default theme;
