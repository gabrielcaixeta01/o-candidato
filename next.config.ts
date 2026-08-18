import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
      Hosts permitidos para as fotos oficiais.
      `remotePatterns` (e não `domains`, depreciado desde o Next 14) porque
      restringe protocolo e caminho, não só o hostname.
    */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "agenciabrasil.ebc.com.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.tse.jus.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "divulgacandcontas.tse.jus.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
