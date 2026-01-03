module.exports = {
  apps: [{
    name: 'turan-erp-frontend',
    script: 'npm',
    args: 'start -- -p 3001',
    cwd: '/home/user/turan_erp/frontend',
    env: {
      NODE_ENV: 'production'
    },
    interpreter: '/root/.nvm/versions/node/v20.19.6/bin/node',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
