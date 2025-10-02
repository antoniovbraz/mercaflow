/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ML_CLIENT_ID: process.env.ML_CLIENT_ID,
    ML_CLIENT_SECRET: process.env.ML_CLIENT_SECRET,
    ML_REDIRECT_URI: process.env.ML_REDIRECT_URI,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig