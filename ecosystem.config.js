module.exports = {
  apps: [
    {
      name: 'tool-bcr-3d-g-be',
      cwd: '/var/www/gg88/tool-nohu/3d/tool-bcr-3d-g-be',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'production',
        PORT: 6100,
      },
    },
  ],
};
