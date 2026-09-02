import { Client } from 'ssh2';

const conn = new Client();

console.log('🧹 Auditing and fixing channels.json on VPS...');

conn.on('ready', () => {
  const cmd = `
    node -e '
      const fs = require("fs");
      const p = "/var/www/channel-graph/backend/data/channels.json";
      if (fs.existsSync(p)) {
        const list = JSON.parse(fs.readFileSync(p, "utf-8"));
        const updated = list.map(c => {
          // Only true if actual bot admin channel with numeric negative channel ID
          const isRealAdmin = c.isAdmin && (c.id.startsWith("-100") || c.id.startsWith("-"));
          return {
            ...c,
            isAdmin: Boolean(isRealAdmin)
          };
        });
        fs.writeFileSync(p, JSON.stringify(updated, null, 2), "utf-8");
        console.log("✅ Fixed channels.json:", updated);
      }
    '
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
