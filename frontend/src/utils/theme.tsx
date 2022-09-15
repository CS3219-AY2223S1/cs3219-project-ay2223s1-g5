import { Color } from "@mui/material";
import { blueGrey, green, grey, red, teal, yellow } from "@mui/material/colors";
import { createTheme, PaletteColorOptions } from "@mui/material/styles";
declare module "@mui/material/styles" {
  export interface Palette {
    green: Partial<Color>;
    yellow: Partial<Color>;
    red: Partial<Color>;
    teal: Partial<Color>;
    blueGrey: Partial<Color>;
  }

  export interface PaletteOptions {
    green: PaletteColorOptions;
    yellow: PaletteColorOptions;
    red: PaletteColorOptions;
    teal: PaletteColorOptions;
    blueGrey: PaletteColorOptions;
  }
}

const colors = {
  primary: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#8fcaf9",
    300: "#62b5f7",
    400: "#3fa5f6",
    500: "#1996f4",
    600: "#1788e6",
    700: "#1276d3",
    800: "#0e65c1",
    900: "#0647a2",
    A100: "#ffffff",
    A200: "#e1ecff",
    A400: "#aeccff",
    A700: "#95bcff",
  },
  secondary: {
    50: "#fbf2e1",
    100: "#f5deb4",
    200: "#f0ca84",
    300: "#eab455",
    400: "#e7a534",
    500: "#e4971e",
    600: "#e08c1a",
    700: "#da7d16",
    800: "#d36f12",
    900: "#c8590e",
    A100: "#fffdfc",
    A200: "#ffe0c9",
    A400: "#ffc396",
    A700: "ffb47c",
  },
  white: "#FFFFFF",
};

const theme = createTheme({
  typography: {
    fontSize: 16,
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    blueGrey,
    green,
    grey,
    red,
    teal,
    yellow,
    background: { default: grey[50] },
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
