/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        config.module.rules.push({
            test: /\.(png|jpg|gif)$/i,
            type: 'asset/resource',
        });
        return config;
    },
};

module.exports = nextConfig;