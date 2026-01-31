import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: { // Ignore this red line, React is tripping
    themes: ["light", "dark"],
  },
}

export default config