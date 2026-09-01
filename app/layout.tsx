import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Gastos Tarjetas",
  description: "Control de gastos de tarjetas, ingresos y varios",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${firaSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
