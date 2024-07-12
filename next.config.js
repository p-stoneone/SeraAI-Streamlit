/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bit.ly/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.seraphicadvisors.com/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'seraphicadvisors.s3.eu-north-1.amazonaws.com/**',
        port: '',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/industries.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable',
          },
        ],
      },
      {
        source: '/practices.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable',
          },
        ],
      }
    ];
  },
}

module.exports = nextConfig
