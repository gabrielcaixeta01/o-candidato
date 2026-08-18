import candidatosData from "@/data/candidatos.json";
import noticiasData from "@/data/noticias.json";
import calendarioData from "@/data/calendario.json";
import type {
  ArquivoNoticias,
  Candidato,
  EventoEleitoral,
  Noticia,
} from "@/lib/types";

/**
 * Ordem alfabética pelo nome de urna registrado no TSE.
 *
 * Esta é a única ordenação que o site expõe. Não há ordenação por intenção de
 * voto, relevância ou qualquer critério que produza hierarquia entre chapas.
 */
export function listarCandidatos(): Candidato[] {
  return [...(candidatosData as Candidato[])].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

export function candidatoPorSlug(slug: string): Candidato | undefined {
  return (candidatosData as Candidato[]).find((c) => c.slug === slug);
}

/**
 * Vizinhos na ordem alfabética, para navegar entre fichas sem voltar à lista.
 * `null` nas pontas — a lista não circula, para não sugerir um ciclo ou uma
 * ordem de importância.
 */
export function vizinhosDe(candidato: Candidato): {
  anterior: Candidato | null;
  proximo: Candidato | null;
} {
  const lista = listarCandidatos();
  const i = lista.findIndex((c) => c.slug === candidato.slug);
  return {
    anterior: i > 0 ? lista[i - 1] : null,
    proximo: i >= 0 && i < lista.length - 1 ? lista[i + 1] : null,
  };
}

export function listarCalendario(): EventoEleitoral[] {
  return [...(calendarioData as EventoEleitoral[])].sort((a, b) =>
    a.data.localeCompare(b.data),
  );
}

export function lerNoticias(): ArquivoNoticias {
  return noticiasData as ArquivoNoticias;
}

/** Notícias de um candidato, da mais recente para a mais antiga. */
export function noticiasDo(candidato: Candidato): Noticia[] {
  const { porCandidato } = lerNoticias();
  const lista = porCandidato[candidato.nome] ?? [];
  return [...lista].sort((a, b) => b.data.localeCompare(a.data));
}

/**
 * Normaliza para busca: minúsculas e sem acentos, para que "flavio" encontre
 * "Flávio" — importante em português.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Busca por nome, partido, número ou tema declarado no plano de governo. */
export function filtrarCandidatos(
  candidatos: Candidato[],
  consulta: string,
): Candidato[] {
  const termo = normalizar(consulta);
  if (!termo) return candidatos;

  return candidatos.filter((c) => {
    const campos = [
      c.nome,
      c.nomeCompleto ?? "",
      c.partido,
      String(c.numero),
      c.vice,
      c.bio,
      c.ocupacao,
      ...c.temas,
    ];
    return campos.some((campo) => normalizar(campo).includes(termo));
  });
}

/** Iniciais para o retrato-placeholder, ignorando preposições e prefixos. */
export function iniciaisDe(nome: string): string {
  const ignorar = new Set([
    "de",
    "da",
    "do",
    "das",
    "dos",
    "e",
    "escritor",
    "veterinario",
    "veterinário",
    "coronel",
  ]);

  const palavras = nome
    .split(/\s+/)
    .filter((p) => p && !ignorar.has(normalizar(p)));

  if (palavras.length === 0) return nome.slice(0, 2).toUpperCase();

  return palavras
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/**
 * Idade em anos completos, derivada da data de nascimento registrada no TSE.
 *
 * A idade não é armazenada de propósito: um número escrito à mão envelhece em
 * silêncio e passa a divergir do registro. O commit semanal do cron republica
 * o site, então o valor não fica defasado por muito tempo.
 */
export function idadeDe(nascimentoIso: string, referencia = new Date()): number {
  const [ano, mes, dia] = nascimentoIso.split("-").map(Number);
  let idade = referencia.getUTCFullYear() - ano;
  const mesAtual = referencia.getUTCMonth() + 1;
  const diaAtual = referencia.getUTCDate();
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) idade -= 1;
  return idade;
}

/** "4 de outubro de 2026" a partir de "2026-10-04". */
export function formatarData(iso: string): string {
  // Constrói em UTC para que a data não recue um dia em fusos negativos.
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "4 out" — versão compacta para o calendário. */
export function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia))
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })
    .replace(".", "");
}
