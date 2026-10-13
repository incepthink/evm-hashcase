import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--hc-font-display",
  display: "swap",
});

export const sansFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--hc-font-sans",
  display: "swap",
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--hc-font-mono",
  display: "swap",
});

export const homeFontVariables = `${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`;
