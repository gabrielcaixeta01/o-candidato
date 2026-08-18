import Image from "next/image";
import { iniciaisDe } from "@/lib/candidatos";
import { cn } from "@/lib/utils";
import type { Candidato } from "@/lib/types";

/**
 * Retrato em 3:4. Preto-e-branco por padrão, colorido no hover do card.
 *
 * O preto-e-branco não é enfeite: as fotos vêm de fontes diferentes, com
 * iluminação e fundos muito distintos, e a dessaturação as coloca no mesmo
 * registro visual. Sem isso, um retrato de estúdio saltaria sobre um registro
 * de evento — uma hierarquia que o projeto não pode produzir.
 *
 * Sem foto, cai num placeholder de iniciais com a mesma proporção e o mesmo
 * peso visual, para que a diagramação não mude.
 */
export function Retrato({
  candidato,
  className,
  sizes = "(min-width: 1024px) 21rem, (min-width: 640px) 45vw, 92vw",
  prioridade = false,
}: {
  candidato: Candidato;
  className?: string;
  sizes?: string;
  prioridade?: boolean;
}) {
  const { foto, nome } = candidato;

  return (
    <div
      className={cn(
        "relative aspect-3/4 w-full overflow-hidden bg-papel-300",
        className,
      )}
    >
      {foto ? (
        <Image
          src={foto.url}
          alt={`Retrato de ${nome}`}
          fill
          sizes={sizes}
          // `preload` substitui `priority`, depreciado no Next 16.
          preload={prioridade}
          /*
            object-position um pouco acima do centro: enquadra o rosto tanto em
            retratos verticais quanto nas fotos horizontais do acervo, que numa
            máscara 3:4 seriam cortadas no lugar errado com `object-top`.
          */
          className={cn(
            "object-cover object-[50%_22%]",
            "grayscale transition-[filter,transform] duration-500 ease-out",
            "group-hover:scale-[1.03] group-hover:grayscale-0",
            "group-focus-within:grayscale-0",
          )}
        />
      ) : (
        <PlaceholderIniciais nome={nome} />
      )}
    </div>
  );
}

function PlaceholderIniciais({ nome }: { nome: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 grid place-items-center bg-linear-to-br from-papel-200 to-papel-400"
    >
      <span className="font-serif text-5xl text-bronze-500/30 select-none sm:text-6xl">
        {iniciaisDe(nome)}
      </span>
    </div>
  );
}

/** Crédito da foto. Obrigatório quando há imagem — exigência de licença. */
export function CreditoFotoLinha({ candidato }: { candidato: Candidato }) {
  if (!candidato.foto) return null;

  const { credito, licenca, origem } = candidato.foto;
  const texto = `Foto: ${credito} · ${licenca}`;

  return (
    <p className="text-xs text-tinta-500">
      {origem ? (
        <a
          href={origem}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 hover:text-bronze-500"
        >
          {texto}
        </a>
      ) : (
        texto
      )}
    </p>
  );
}
