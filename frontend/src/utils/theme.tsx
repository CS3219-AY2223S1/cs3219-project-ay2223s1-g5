import { createTheme, PaletteColorOptions } from "@mui/material/styles";

const colors = {
  blue: "#1472D3",
  orange: "#EF7C00",
  white: "#FFFFFF",
  grey: "#FAFAFA",
  green: "#91CC75",
  yellow: "#FAC858",
  red: "#EE6666",
};

declare module "@mui/material/styles" {
  interface Palette {
    chart: PaletteColor;
  }

  interface PaletteOptions {
    chart: PaletteColorOptions;
  }

  interface SimplePaletteColorOptions {
    green?: string;
    yellow?: string;
    red?: string;
  }

  interface PaletteColor {
    green?: string;
    yellow?: string;
    red?: string;
  }
}

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
      light: colors.grey,
    },
    chart: {
      main: colors.white,
      green: colors.green,
      yellow: colors.yellow,
      red: colors.red,
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
