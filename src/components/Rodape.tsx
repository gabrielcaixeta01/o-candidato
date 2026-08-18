import { formatarData } from "@/lib/candidatos";

/**
 * Rodapé com os avisos legais e metodológicos exigidos pelo projeto:
 * origem dos dados, critério de ordenação e ressalva sobre registros
 * ainda em análise na Justiça Eleitoral.
 */
export function Rodape({ atualizadoEm }: { atualizadoEm: string | null }) {
  return (
    <footer className="acima-do-grao mt-auto border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <p className="rotulo text-latao-500">O Candidato</p>

        <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          <p>
            Os dados de cada candidatura vêm de fontes públicas — registros do{" "}
            <a
              href="https://www.tse.jus.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 underline decoration-dotted underline-offset-2 hover:text-latao-400"
            >
              Tribunal Superior Eleitoral
            </a>{" "}
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
            As notícias são exibidas apenas como manchete, veículo, data e link.
            O texto das matérias não é reproduzido — a leitura acontece no site
            do veículo original.
          </p>

          <p>
            As fotos são oficiais e trazem o crédito e a licença de cada fonte
            junto ao perfil do candidato.
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
