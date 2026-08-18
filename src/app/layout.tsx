import type { Metadata, Viewport } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";

// Sans limpa no corpo.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Serifa editorial nos títulos.
const spectral = Spectral({
  variable: "--font-spectral",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "O Candidato — quem disputa a Presidência em 2026",
  description:
    "Perfis factuais dos candidatos à Presidência da República em 2026, em ordem alfabética e com diagramação idêntica. Dados de fontes públicas (TSE e imprensa).",
  applicationName: "O Candidato",
  authors: [{ name: "O Candidato" }],
  openGraph: {
    title: "O Candidato — quem disputa a Presidência em 2026",
    description:
      "Perfis factuais dos candidatos à Presidência da República em 2026. Ordem alfabética, sem ranking e sem opinião.",
    locale: "pt_BR",
    type: "website",
  },
};

// themeColor vive em `viewport`, não em `metadata` (depreciado desde o Next 14).
export const viewport: Viewport = {
  themeColor: "#0e1524",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
