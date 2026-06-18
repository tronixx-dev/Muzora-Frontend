/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'upload.wikimedia.org',
      'images.unsplash.com',
    ],
  },
};

module.exports = nextConfig;