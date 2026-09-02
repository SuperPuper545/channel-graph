module.exports = {
  apps: [
    {
      name: 'channel-graph-backend',
      script: 'dist/index.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      merge_logs: true
    }
  ]
};
