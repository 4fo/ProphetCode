import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",

  // GitHub Pages serves from a subpath (https://4fo.github.io/ProphetCode/)
  basePath: "/ProphetCode",

  // Required for static export with trailing slashes on GitHub Pages
  trailingSlash: true,

  // Disable image optimization (requires a server)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
