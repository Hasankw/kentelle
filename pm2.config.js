module.exports = {
  apps: [
    {
      name: "kentelle",
      script: "start.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
