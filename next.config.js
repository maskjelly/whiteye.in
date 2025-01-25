module.exports = {
    webpack: (config) => {
        ignoreDuringBuilds: true,
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
    },
  }