import type { Metadata } from "next";
import { Fraunces, IM_Fell_English, Inter } from "next/font/google";
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
  // Eixos extras: as perguntas do livro usam a versão "WONK", de traço mais irregular
  axes: ["SOFT", "WONK", "opsz"],
});

// Letra de livro antigo, para as respostas: no livro e no cartão onde a pessoa escreve
const fell = IM_Fell_English({
  variable: "--font-fell",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lá Vem História",
  description: "Responda perguntas sobre a sua vida e deixe um livro para seus filhos e netos, com fotos e a sua voz.",
  // Fora dos buscadores até o lançamento
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable} ${fell.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Blocks do shadcn/studio usam Tooltip e quebram sem o provider */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
