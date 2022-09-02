import { createTheme } from "@mui/material/styles";

const colors = {
  blue: "#1472D3",
  orange: "#EF7C00",
};

const theme = createTheme({
  typography: {
    fontSize: 16,
  },
  palette: {
    primary: {
      main: colors.blue,
    },
    secondary: {
      main: colors.orange,
    },
  },
});

export default theme;
