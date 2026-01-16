import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Turbopack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    },
  },
  
  // Fallback para webpack si se usa explícitamente
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
  
  // Configuración de imágenes para Mapbox
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
