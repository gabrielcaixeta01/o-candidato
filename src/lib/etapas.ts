/**
 * As 4 etapas da jornada do eleitor do DF, na ordem em que aparecem.
 *
 * Fixas e conhecidas de propósito — não é uma lista genérica para outros
 * estados/cargos, então não há necessidade de configuração externa.
 */
export interface Etapa {
  slug: "presidente" | "governador" | "senador" | "resumo";
  href: string;
  rotulo: string;
}

export const ETAPAS: Etapa[] = [
  { slug: "presidente", href: "/", rotulo: "Presidente" },
  { slug: "governador", href: "/governador", rotulo: "Governador" },
  { slug: "senador", href: "/senador", rotulo: "Senador" },
  { slug: "resumo", href: "/resumo", rotulo: "Resumo" },
];
