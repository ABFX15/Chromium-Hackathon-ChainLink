import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", ...fontFamily.sans],
                heading: ["var(--font-orbitron)", ...fontFamily.sans],
            },
            colors: {
                background: "hsl(229, 84%, 5%)",
                foreground: "hsl(0, 0%, 98%)",
                card: {
                    DEFAULT: "hsl(217, 33%, 17%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                popover: {
                    DEFAULT: "hsl(217, 33%, 17%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                primary: {
                    DEFAULT: "hsl(217, 91%, 60%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                secondary: {
                    DEFAULT: "hsl(270, 91%, 65%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                muted: {
                    DEFAULT: "hsl(215, 25%, 27%)",
                    foreground: "hsl(215, 20%, 65%)",
                },
                accent: {
                    DEFAULT: "hsl(215, 25%, 27%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                destructive: {
                    DEFAULT: "hsl(0, 84%, 60%)",
                    foreground: "hsl(0, 0%, 98%)",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(217, 91%, 60%)",
            },
            borderRadius: {
                lg: "0.75rem",
                md: "calc(0.75rem - 2px)",
                sm: "calc(0.75rem - 4px)",
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                },
                glow: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '0.8' }
                }
            },
            animation: {
                shimmer: 'shimmer 2s infinite',
                pulse: 'pulse 2s infinite',
                glow: 'glow 3s infinite'
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
};

export default config; 