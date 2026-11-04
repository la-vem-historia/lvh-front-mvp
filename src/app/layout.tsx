import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Tipografia inspirada na Aesop: Suisse Int'l (texto) e Zapf Humanist (títulos) são
// fontes licenciadas, então usamos Inter e Optima, com Belleza onde não há Optima
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Teste: Fraunces nos títulos no lugar da Optima/Belleza
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lá Vem História",
  description: "Conte a sua história e transforme suas memórias em livro.",
  // Fora dos buscadores até o lançamento
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Blocks do shadcn/studio usam Tooltip e quebram sem o provider */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
