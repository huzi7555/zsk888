/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置服务器绑定到所有网络接口
  experimental: {
    serverComponents: true,
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
