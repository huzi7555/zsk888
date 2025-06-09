/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14已经默认启用React Server Components，无需配置
  experimental: {
    // serverComponents 配置项已被移除
  },
  // 允许跨域
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  }
};

export default nextConfig;
