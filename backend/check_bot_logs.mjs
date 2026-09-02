import { Client } from 'ssh2';

const conn = new Client();

console.log('🔍 Checking bot update logs on VPS...');

conn.on('ready', () => {
  const cmd = `
    echo "=== PM2 RECENT LOGS ==="
    pm2 logs channel-graph-backend --lines 40 --nostream
    echo "=== CHANNELS.JSON CURRENT CONTENT ==="
    cat /var/www/channel-graph/backend/data/channels.json
  `;

  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log(output);
      conn.end();
    }).on('data', d => output += d.toString());
  });
}).connect({
  host: '2.27.9.160',
  port: 22,
  username: 'root',
  password: 'pVpW4Ez28Y5O'
});
