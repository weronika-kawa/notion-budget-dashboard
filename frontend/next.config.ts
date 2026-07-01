import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurujemy wewnętrzne proxy (Reverse Proxy) do naszego backendu w sieci Dockera
  async rewrites() {
    return [
      {
        source: '/dashboard/:path*',
        destination: 'http://backend:3000/dashboard/:path*',
      },
      {
        source: '/sync/:path*',
        destination: 'http://backend:3000/sync/:path*',
      },
    ];
  },
};

export default nextConfig;