const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./containers/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    screens: {
      xs: "400px",
      // => @media (min-"440px) { ... }

      sm: "640px",
      // => @media (min-"640px) { ... }

      smmd: "700px",

      md: "1024px",
      // => @media (min-"1024px) { ... }

      lg: "1200px",
      // => @media (min-"1440px) { ... }

      laptop: "1440px",
      // => @media (min-"1440px) { ... }

      lglaptop: "1680px",
      // => @media (min-"1440px) { ... }

      xl: "1920px",
      // => @media (min-"1920px) { ... }

      "2xl": "2560px",
      // => @media (min-"2560px) { ... }
    },
    extend: {
      boxShadow: {
        customLight: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        custom: "0 4px 14px rgba(101, 135, 169, 0.16)",
        "custom-2": "0px -20px 25px -5px rgba(0, 0, 0, 0.05)",
        scrollableSelect: "inset 0px -4px 11px rgba(0, 0, 0, 0.1), inset 0px 4px 11px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      borderWidth: {
        3: "3px",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      spacing: {
        18: "4.5rem",
        72: "18rem",
        76: "19rem",
        84: "21rem",
        88: "22rem",
        92: "23rem",
        96: "24rem",
        100: "25rem",
        104: "27rem",
        108: "28rem",
        110: "29.5rem",
        112: "30rem",
        114: "30.5rem",
        116: "31rem",
        120: "32rem",
        124: "33rem",
        128: "34rem",
        132: "38rem",
        136: "42rem",
        138: "44rem",
        142: "47rem",
        150: "53rem",
        156: "61rem",
        160: "65rem",
        200: "70rem",
        384: "102rem",
        386: "110rem",
      },
      height: {
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
      },
      minHeight: { 128: "34rem", 256: "68rem" },
      lineHeight: {
        button: "32px",
        10.5: "2.75rem",
        11: "3rem",
        12: "3.5rem",
        13: "4rem",
        14: "4.5rem",
        15: "6rem",
      },
      scale: {
        101: "1.01",
        102: "1.02",
        103: "1.03",
      },
      colors: {
        // New Design Colors
        primary: "#645F4B",
        primaryLight: "#A5A08C",
        primaryDark: "#555555",

        secondary: "#B72E73",
        secondaryLight: "#AFAFAF",
        secondaryDark: "#55503D",

        papyrus: "#d7d5bc0d",
        warmGray: "#EBE7D4",
        customPaleGray: "#e5e7eb",
        customPeach: "#FFF8EE",
        customYellow: "#FEE25D",
        customLightYellow: "#FFE650",
        customPale: "#DFDAC7",
        customRed: "#FA5A6E",
        customGreen: "#05BE64",
        customLightGreen: "#78E69B",
        customPurple: "#9B55FF",
        customLightPurple: "#C68AFC",
        customDarkPurple: "#644A94",
        customDarkGray: "#1F2937",
        customLightGray: "#D7D7D7",
        customBrown: "#827D69",
        rewardsGreen: "#1FBC67",
        rewardsLightGreen: "#7CE59D",

        tokenTextGray: "#969696",
      },
      fontSize: {
        zero: "0rem",
        xs: ".75rem",
        sm: ".875rem",
        tiny: ".875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3rem",
        "6xl": "3.5rem",
        "7xl": "4rem",
        "8xl": "4.5rem",
        "9xl": "6rem",
        "10xl": "8rem",
      },
      animation: { "spin-slow": "spin 3s linear infinite" },
      fontFamily: {
        khTeka: ["'KH Teka'", "sans-serif"],
      },
      width: {
        "fit-content": "fit-content",
      },
      rotate: {
        "-30": "-30deg",
      },
      letterSpacing: {
        1: "1px",
      },
      backgroundImage: (theme) => ({
        "bg-gradient": "url('/images/bgGradient.svg')",
        "header-team": "url('/images/bgHeaderTeam.svg')",
        "hero-pattern": "url('/images/bgHero.svg')",
        "impact-pattern": "url('/images/bgImpact.svg')",
        "countdown-pattern": "url('/images/bgCountdown.svg')",
        "countdown-pattern-mobile": "url('/images/bgFooterMobile.svg')",
        "popcorn1-pattern": "url('/images/bgPopcorn1.svg')",
        "popcorn2-pattern": "url('/images/bgPopcorn2.svg')",
        "popcorn3-pattern": "url('/images/bgPopcorn3.svg')",
        "our-partners": "url('/images/ourpartnersbg.svg')",
        "as-seen-in": "url('/images/asseeninbg.svg')",
      }),
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar-hide")],
};
