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

/**
 * Plano de governo registrado no TSE.
 *
 * O PDF é o arquivo que o próprio candidato protocolou, servido do repositório
 * para que o link não dependa da disponibilidade do CDN do TSE — que só publica
 * os planos num pacote .zip por unidade eleitoral, sem URL por candidato.
 */
export interface PlanoGoverno {
  /** Caminho do PDF em `public/planos/`. */
  arquivo: string;
  /**
   * Título do documento, transcrito literalmente.
   * `null` quando a capa é só imagem e o PDF não traz título — a ausência é
   * do documento, e inventar um rótulo seria descrever o plano por nós.
   */
  titulo: string | null;
  /** Número de páginas do PDF. */
  paginas: number;
}

export interface Candidato {
  /** Identificador na URL: `/candidato/{slug}`. Estável entre publicações. */
  slug: string;
  /** Nome de urna, exatamente como registrado no TSE. Chave de ordenação. */
  nome: string;
  /** Nome civil completo, quando difere do nome de urna. */
  nomeCompleto?: string;
  /** Sigla do partido. */
  partido: string;
  /** Número de urna. */
  numero: number;
  /** Nome de urna do candidato a vice, com sigla: "Geraldo Alckmin (PSB)". */
  vice: string;
  /**
   * `SQ_CANDIDATO` do TSE. É a chave que liga esta ficha ao registro oficial
   * e permite auditar cada campo no DivulgaCandContas.
   */
  sqCandidato: string;
  /** Data de nascimento em ISO 8601. A idade é derivada, nunca armazenada. */
  nascimento: string;
  /** Município e UF de nascimento: "Garanhuns, PE". */
  naturalidade: string;
  /** Grau de instrução declarado no registro, na redação do TSE. */
  escolaridade: string;
  /** Ocupação declarada no registro, na redação do TSE. */
  ocupacao: string;
  /** Foto oficial creditada. `null` renderiza o retrato de iniciais. */
  foto: CreditoFoto | null;
  /** Biografia factual curta (2 linhas no card). */
  bio: string;
  /**
   * Resumo factual em parágrafos, para a página do candidato.
   *
   * Só trajetória verificável: cargos ocupados com período, formação, eleições
   * disputadas. Sem adjetivação, sem avaliação de desempenho e sem menção a
   * posicionamento político — o que o candidato defende está em `temas`, dito
   * com as palavras dele.
   */
  resumo: string[];
  /** Plano registrado no TSE. `null` quando não consta do pacote oficial. */
  planoGoverno: PlanoGoverno | null;
  /**
   * Situação do registro na Justiça Eleitoral, na redação do TSE.
   * Em agosto de 2026 é idêntica para as 13 chapas.
   */
  situacaoRegistro: string;
  /**
   * Observação processual objetiva (ex.: registro sub judice).
   * Descreve o andamento no tribunal, nunca o mérito da candidatura.
   */
  observacao?: string;
}

/**
 * Um capítulo do plano de governo registrado no TSE.
 *
 * `titulo` é transcrito do sumário do PDF, só com a capitalização normalizada.
 * `resumo` é redigido por este projeto a partir do texto do capítulo, sempre
 * descrevendo o que o plano propõe — nunca avaliando se é bom, viável ou caro.
 * Verbos de atribuição ("propõe", "prevê") deixam explícito de quem é a
 * afirmação. Quem quiser o teor exato lê o PDF, linkado na mesma seção.
 */
export interface Proposta {
  titulo: string;
  resumo: string;
}

/** Mapa `slug do candidato` → capítulos do plano. */
export type ArquivoPropostas = Record<string, Proposta[]>;

/**
 * Classificação do PARTIDO no espectro esquerda-direita, atribuída a uma fonte.
 *
 * Não existe classificação oficial: o TSE não registra posicionamento
 * ideológico. Por isso o site nunca afirma onde uma candidatura está — mostra o
 * que fontes identificadas publicaram sobre o partido, com o ano de cada
 * levantamento, e deixa as divergências entre elas à vista.
 */
export interface FonteEspectro {
  id: string;
  nome: string;
  ano: number;
  descricao: string;
  url: string;
}

export interface ClassificacaoEspectro {
  /** `id` de uma entrada de `fontes`. */
  fonte: string;
  /** Rótulo exatamente como a fonte publicou. */
  rotulo: string;
}

export interface ArquivoEspectro {
  fontes: FonteEspectro[];
  /** Link para a compilação que reúne as fontes. */
  compilacao: string;
  porPartido: Record<string, ClassificacaoEspectro[]>;
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
