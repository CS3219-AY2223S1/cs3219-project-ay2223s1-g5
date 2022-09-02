import { createTheme } from "@mui/material/styles";

const colors = {
  blue: "#1472D3", // Blue
};

const theme = createTheme({
  typography: {
    fontSize: 14,
  },
  palette: {
    primary: {
      main: colors.blue,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export default theme;
