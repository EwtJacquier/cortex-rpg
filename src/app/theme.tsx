import { createTheme } from '@mui/material/styles';
import "@mui/material/styles/createPalette";

declare module "@mui/material/styles" {
  interface PaletteColor {
    "25"?: string;
    "50"?: string;
    "100"?: string;
    "200"?: string;
    "300"?: string;
    "400"?: string;
    "500"?: string;
    "600"?: string;
    "700"?: string;
    "800"?: string;
    "900"?: string;
  }
}

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-montserrat), sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: '2.2rem'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.0rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.8rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.6rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.4rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.2rem'
    }
  },
  palette: {
    mode: 'light',
    divider: '#D0D5DD',
    text: {
      primary: '#202225',
      secondary: '#878787'
    },
    primary: {
      "50": "#202225",
      "100": "#202225",
      "200": "#202225",
      "300": "#202225",
      "400": "#202225",
      "500": "#202225",
      "600": "#202225",
      "700": "#202225",
      "800": "#202225",
      "900": "#202225",
      main: '#202225', // Same as 600
    },
    secondary: {
      "50": "#F9FAFB",
      "100": "#F2F4F7",
      "200": "#EAECF0",
      "300": "#D0D5DD",
      "400": "#98A2B3",
      "500": "#667085",
      "600": "#475467",
      "700": "#344054",
      "800": "#1D2939",
      "900": "#101828",
      main: "#475467" // Same as 600
    },
    background: {
      paper: '#ffffff',
      default: '#f2f3f7',
    },
    error: {
      "50": "#FEF3F2",
      "100": "#FEE4E2",
      "200": "#FECDCA",
      "300": "#FDA29B",
      "400": "#F97066",
      "500": "#F04438",
      "600": "#D92D20",
      "700": "#B42318",
      "800": "#912018",
      "900": "#7A271A",
      main: '#D92D20' // Same as 600
    },
    warning: {
      "50": "#FFFAEB",
      "100": "#FEF0C7",
      "200": "#FEDF89",
      "300": "#FEC84B",
      "400": "#FDB022",
      "500": "#F79009",
      "600": "#DC6803",
      "700": "#B54708",
      "800": "#93370D",
      "900": "#7A2E0E",
      main: "#DC6803" // Same as 600
    },
    success: {
      "50": "#ECFDF3",
      "100": "#D1FADF",
      "200": "#A6F4C5",
      "300": "#6CE9A6",
      "400": "#32D583",
      "500": "#12B76A",
      "600": "#039855",
      "700": "#027A48",
      "800": "#05603A",
      "900": "#054F31",
      main: "#039855" // Same as 600
    }
  }
});

export default theme;