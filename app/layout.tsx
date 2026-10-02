import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Mona_Sans } from "next/font/google";
import "./globals.css";

// One variable file does headline and paragraph; its width axis is the motion system.
const mona = Mona_Sans({ subsets: ["latin"], axes: ["wdth"], display: "block", variable: "--font-mona" });
const mono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", display: "swap", variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Ayush Gade — engineer",
  description:
    "Ayush Gade builds the unglamorous half of AI products: state, retries, guards, and the hand-off to a human. Founding engineering intern at Pluvus; third-year at PICT Pune.",
  openGraph: {
    title: "Ayush Gade — engineer",
    description: "The unglamorous half of AI products: state, retries, guards, and the hand-off to a human.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0c0c0c", colorScheme: "dark" };

// Marks that scripts are running (so entrance states apply) and guarantees the page settles even if they fail later.
const boot = `document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('ready')},4000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mona.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body data-theme="dark">{children}</body>
    </html>
  );
}
