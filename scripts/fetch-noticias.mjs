#!/usr/bin/env node
/**
 * Popula src/data/noticias.json com manchetes recentes de cada candidato.
 *
 * Guarda apenas título, veículo, data e link — nunca o corpo da matéria.
 * Rodado semanalmente por .github/workflows/atualizar-noticias.yml; o commit
 * resultante dispara o redeploy na Vercel.
 *
 * Sem dependências de npm: usa fetch e o parser de XML por regex abaixo, o que
 * mantém o job de CI sem etapa de instalação.
 *
 * Variáveis de ambiente (todas opcionais):
 *   FONTE_NOTICIAS   "rss" (padrão) ou "newsapi"
 *   RSS_TEMPLATE     URL do feed com o marcador {consulta}
 *   NEWSAPI_URL      endpoint do NewsAPI (padrão: /v2/everything)
 *   NEWSAPI_KEY      chave; obrigatória quando FONTE_NOTICIAS=newsapi
 *   MAX_POR_CANDIDATO  máximo de manchetes por candidato (padrão 6)
 *   JANELA_DIAS      idade máxima de uma notícia em dias (padrão 45)
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const CANDIDATOS_JSON = join(RAIZ, "src/data/candidatos.json");
const NOTICIAS_JSON = join(RAIZ, "src/data/noticias.json");

// O workflow sempre define estas envs a partir de `vars.*`; quando a variável
// não está configurada no repositório, o GitHub Actions injeta string vazia
// (não omite a env), então `??` sozinho não aplicaria o padrão. Por isso
// tratamos "" como "não configurado" também.
function envOuPadrao(nome, padrao) {
  const valor = process.env[nome];
  return valor ? valor : padrao;
}

const FONTE = envOuPadrao("FONTE_NOTICIAS", "rss");
const RSS_TEMPLATE = envOuPadrao(
  "RSS_TEMPLATE",
  "https://news.google.com/rss/search?q={consulta}&hl=pt-BR&gl=BR&ceid=BR:pt-419",
);
const NEWSAPI_URL = envOuPadrao("NEWSAPI_URL", "https://newsapi.org/v2/everything");
const NEWSAPI_KEY = envOuPadrao("NEWSAPI_KEY", "");
const MAX_POR_CANDIDATO = Number(envOuPadrao("MAX_POR_CANDIDATO", "6"));
const JANELA_DIAS = Number(envOuPadrao("JANELA_DIAS", "45"));

const PAUSA_MS = 1200;
const TIMEOUT_MS = 15000;

/** Prefixos de nome de urna que atrapalham a busca ("Escritor Augusto Cury"). */
const PREFIXOS = /^(escritor|escritora|veterin[áa]rio|veterin[áa]ria|doutor|doutora|dr|dra|professor|professora|coronel|delegado|delegada|pastor|pastora|sargento|capit[ãa]o)\s+/i;

function consultaDe(candidato) {
  const base = (candidato.nomeCompleto ?? candidato.nome).replace(PREFIXOS, "");
  // Aspas prendem o nome completo; o contexto evita homônimos fora da eleição.
  return `"${base}" (presidência OR eleições OR candidato)`;
}

function urlDaConsulta(consulta) {
  if (FONTE === "newsapi") {
    const url = new URL(NEWSAPI_URL);
    url.searchParams.set("q", consulta);
    url.searchParams.set("language", "pt");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", String(MAX_POR_CANDIDATO * 3));
    return url.toString();
  }
  return RSS_TEMPLATE.replace("{consulta}", encodeURIComponent(consulta));
}

async function buscar(url) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TIMEOUT_MS);
  try {
    const resposta = await fetch(url, {
      signal: controle.signal,
      headers: {
        "user-agent": "o-candidato/1.0 (+https://github.com/) atualizacao-semanal",
        ...(FONTE === "newsapi" && NEWSAPI_KEY
          ? { "x-api-key": NEWSAPI_KEY }
          : {}),
      },
    });
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} ${resposta.statusText}`);
    }
    return await resposta.text();
  } finally {
    clearTimeout(timer);
  }
}

const ENTIDADES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  nbsp: " ",
};

function limparTexto(bruto) {
  return bruto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (inteiro, nome) => {
      if (ENTIDADES[nome]) return ENTIDADES[nome];
      if (nome.startsWith("#x")) {
        return String.fromCodePoint(parseInt(nome.slice(2), 16));
      }
      if (nome.startsWith("#")) {
        return String.fromCodePoint(Number(nome.slice(1)));
      }
      return inteiro;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function extrair(bloco, tag) {
  const encontrado = bloco.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return encontrado ? limparTexto(encontrado[1]) : "";
}

/** Parser mínimo de RSS 2.0 — o suficiente para os campos que guardamos. */
function lerRss(xml) {
  const itens = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];

  return itens.map((bloco) => {
    const titulo = extrair(bloco, "title");
    const veiculo = extrair(bloco, "source");

    return {
      // O Google News anexa " - Veículo" ao título; removemos para não duplicar.
      titulo: veiculo ? titulo.replace(new RegExp(`\\s*-\\s*${escaparRegex(veiculo)}\\s*$`), "") : titulo,
      url: extrair(bloco, "link"),
      fonte: veiculo || "Fonte não identificada",
      data: normalizarData(extrair(bloco, "pubDate")),
    };
  });
}

function lerNewsapi(corpo) {
  const dados = JSON.parse(corpo);
  if (dados.status !== "ok") {
    throw new Error(dados.message ?? "resposta inesperada do NewsAPI");
  }
  return (dados.articles ?? []).map((artigo) => ({
    titulo: limparTexto(artigo.title ?? ""),
    url: artigo.url ?? "",
    fonte: artigo.source?.name ?? "Fonte não identificada",
    data: normalizarData(artigo.publishedAt ?? ""),
  }));
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Converte qualquer data reconhecida pelo Date para "YYYY-MM-DD". */
function normalizarData(bruta) {
  const data = new Date(bruta);
  return Number.isNaN(data.getTime()) ? "" : data.toISOString().slice(0, 10);
}

function normalizarTitulo(titulo) {
  return titulo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function selecionar(brutas, limiteData) {
  const vistos = new Set();
  const resultado = [];

  for (const noticia of brutas) {
    if (!noticia.titulo || !noticia.url || !noticia.data) continue;
    if (noticia.data < limiteData) continue;

    // Deduplica por URL e por título normalizado: a mesma manchete costuma
    // aparecer replicada em vários portais.
    const chaveUrl = noticia.url;
    const chaveTitulo = normalizarTitulo(noticia.titulo);
    if (vistos.has(chaveUrl) || vistos.has(chaveTitulo)) continue;
    vistos.add(chaveUrl);
    vistos.add(chaveTitulo);

    resultado.push(noticia);
  }

  return resultado
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, MAX_POR_CANDIDATO);
}

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function principal() {
  if (FONTE === "newsapi" && !NEWSAPI_KEY) {
    throw new Error("FONTE_NOTICIAS=newsapi exige NEWSAPI_KEY.");
  }

  const candidatos = JSON.parse(await readFile(CANDIDATOS_JSON, "utf8"));
  const anterior = JSON.parse(await readFile(NOTICIAS_JSON, "utf8"));

  const limiteData = new Date(Date.now() - JANELA_DIAS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const porCandidato = {};
  const falhas = [];

  for (const [indice, candidato] of candidatos.entries()) {
    const consulta = consultaDe(candidato);

    try {
      const corpo = await buscar(urlDaConsulta(consulta));
      const brutas = FONTE === "newsapi" ? lerNewsapi(corpo) : lerRss(corpo);
      porCandidato[candidato.nome] = selecionar(brutas, limiteData);
      console.log(
        `✓ ${candidato.nome}: ${porCandidato[candidato.nome].length} manchetes`,
      );
    } catch (erro) {
      // Uma fonte fora do ar não pode zerar o histórico de um candidato:
      // preserva o que já estava commitado e segue.
      porCandidato[candidato.nome] = anterior.porCandidato?.[candidato.nome] ?? [];
      falhas.push(`${candidato.nome}: ${erro.message}`);
      console.warn(`✗ ${candidato.nome}: ${erro.message} (mantendo anterior)`);
    }

    if (indice < candidatos.length - 1) await dormir(PAUSA_MS);
  }

  const saida = {
    atualizadoEm: new Date().toISOString(),
    porCandidato,
  };

  await writeFile(NOTICIAS_JSON, `${JSON.stringify(saida, null, 2)}\n`, "utf8");

  const total = Object.values(porCandidato).reduce((n, l) => n + l.length, 0);
  console.log(`\nnoticias.json atualizado — ${total} manchetes no total.`);

  if (falhas.length === candidatos.length) {
    throw new Error(
      `Todas as buscas falharam; noticias.json ficou com os dados anteriores.\n${falhas.join("\n")}`,
    );
  }
}

principal().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});
