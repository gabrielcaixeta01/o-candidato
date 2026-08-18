import { formatarData } from "@/lib/candidatos";

/**
 * Rodapé com os avisos legais e metodológicos exigidos pelo projeto:
 * origem dos dados, critério de ordenação, tratamento das notícias e das
 * fotos, e ressalva sobre registros ainda em análise na Justiça Eleitoral.
 */
export function Rodape({ atualizadoEm }: { atualizadoEm: string | null }) {
  return (
    <footer className="acima-do-grao mt-auto border-t border-border bg-papel-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-bronze-500/50 sm:w-12" />
          <p className="rotulo text-bronze-500">O Candidato</p>
        </div>

        <div className="grid gap-x-10 gap-y-6 text-sm leading-relaxed text-tinta-500 sm:grid-cols-2 lg:grid-cols-3">
          <p>
            Os dados de cada candidatura vêm de fontes públicas — registros do{" "}
            <LinkRodape href="https://www.tse.jus.br/">
              Tribunal Superior Eleitoral
            </LinkRodape>{" "}
            e cobertura da imprensa.
          </p>

          <p>
            Os candidatos aparecem sempre em ordem alfabética, com diagramação
            idêntica. O site não publica ranking, pesquisa de intenção de voto
            nem qualquer avaliação das candidaturas.
          </p>

          <p>
            O protocolo do pedido de registro não significa candidatura
            autorizada: algumas candidaturas podem seguir em análise da Justiça
            Eleitoral, e a lista pode mudar até a data da eleição.
          </p>

          <p>
            As notícias aparecem apenas como manchete, veículo, data e link. O
            texto das matérias não é reproduzido — a leitura acontece no site do
            veículo original.
          </p>

          <p>
            As fotos vêm do{" "}
            <LinkRodape href="https://commons.wikimedia.org/">
              Wikimedia Commons
            </LinkRodape>{" "}
            sob licenças livres, com crédito e licença informados no perfil de
            cada candidato.
          </p>

          {atualizadoEm && (
            <p>
              Notícias atualizadas automaticamente em{" "}
              <time dateTime={atualizadoEm}>
                {formatarData(atualizadoEm.slice(0, 10))}
              </time>
              .
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

function LinkRodape({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-tinta-700 underline decoration-dotted underline-offset-2 transition hover:text-bronze-500"
    >
      {children}
    </a>
  );
}
