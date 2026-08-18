/**
 * Tipos de dados de "O Candidato".
 *
 * Regra do projeto: todo campo aqui representa um FATO verificável de fonte
 * pública (TSE ou imprensa). Não há campos de opinião, nota, ranking ou
 * classificação ideológica — por decisão editorial, não por limitação técnica.
 */

/** Crédito de imagem. Obrigatório sempre que houver `url` (exigência legal). */
export interface CreditoFoto {
  /**
   * Caminho da imagem em `public/candidatos/`.
   *
   * As fotos são versionadas no repositório em vez de carregadas do acervo de
   * origem: hotlinkar o Wikimedia pelo otimizador do Next leva a HTTP 429 em
   * cache frio, e uma foto que some é pior que uma foto pesada.
   */
  url: string;
  /** Autoria/veículo, ex.: "Ricardo Stuckert/PR". */
  credito: string;
  /** Licença, ex.: "CC BY 2.0". */
  licenca: string;
  /** Link para a página original da foto, para auditoria e atribuição. */
  origem?: string;
}

export interface Candidato {
  /** Nome de urna, exatamente como registrado no TSE. Chave de ordenação. */
  nome: string;
  /** Nome civil completo, quando difere do nome de urna. */
  nomeCompleto?: string;
  /** Sigla do partido. */
  partido: string;
  /** Número de urna. */
  numero: number;
  /** Candidato a vice-presidente, com sigla: "Geraldo Alckmin (PSB)". */
  vice: string;
  /** Idade em anos na data do registro. `null` quando não confirmada em fonte. */
  idade: number | null;
  /** Foto oficial creditada. `null` renderiza o retrato de iniciais. */
  foto: CreditoFoto | null;
  /** Biografia factual curta (2 linhas no card). */
  bio: string;
  /**
   * Temas centrais declarados pelo próprio candidato.
   * Vazio enquanto não extraídos do plano de governo registrado no TSE —
   * preencher com invenção violaria o princípio de factualidade.
   */
  temas: string[];
  /** URL do plano de governo no DivulgaCandContas, quando disponível. */
  planoGoverno: string | null;
  /**
   * Observação processual objetiva (ex.: registro sub judice).
   * Descreve o andamento no tribunal, nunca o mérito da candidatura.
   */
  observacao?: string;
}

export interface Noticia {
  /** Veículo, ex.: "Agência Brasil". */
  fonte: string;
  /** Data de publicação em ISO 8601 (YYYY-MM-DD). */
  data: string;
  /** Manchete original. Nunca o corpo da matéria — só título, fonte e link. */
  titulo: string;
  /** Link para a matéria no veículo original. */
  url: string;
}

/** Mapa `nome do candidato` → notícias, gerado por scripts/fetch-noticias.mjs. */
export interface ArquivoNoticias {
  /** ISO 8601 do momento em que o cron rodou. `null` antes da primeira execução. */
  atualizadoEm: string | null;
  porCandidato: Record<string, Noticia[]>;
}

export interface EventoEleitoral {
  /** ISO 8601 (YYYY-MM-DD). */
  data: string;
  rotulo: string;
  /** Detalhe factual curto, quando a data sozinha não se explica. */
  detalhe?: string;
}
