import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const conn = new Client();

console.log('📦 Packaging update files locally...');

const rootDir = path.resolve('..');
const tarFile = path.resolve('update.tar.gz');

try {
  execSync(`tar --exclude="node_modules" --exclude="dist" --exclude=".git" --exclude="cf.exe" -czf "${tarFile}" -C "${rootDir}" backend frontend ecosystem.config.js nginx.conf package.json`, { stdio: 'inherit' });
  console.log('✅ Archive created:', tarFile);
} catch (e) {
  console.error('Tar error:', e);
}

conn.on('ready', () => {
  console.log('✅ Connected to VPS via SSH');
  
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    console.log('📤 Uploading update.tar.gz to VPS...');
    const readStream = fs.createReadStream(tarFile);
    const writeStream = sftp.createWriteStream('/root/update.tar.gz');

    writeStream.on('close', () => {
      console.log('✅ Upload finished! Applying updates on VPS...');
      
      const remoteCmd = `
        set -e
        tar -xzf /root/update.tar.gz -C /var/www/channel-graph
        rm -f /root/update.tar.gz

        echo "🔨 Building Backend on VPS..."
        cd /var/www/channel-graph/backend
        npm run build

        echo "🔨 Building Frontend on VPS..."
        cd /var/www/channel-graph/frontend
        npm run build

        echo "🔄 Reloading PM2 backend daemon..."
        cd /var/www/channel-graph
        pm2 reload channel-graph-backend

        echo "✅ VPS UPDATE COMPLETE!"
        pm2 status
      `;

      conn.exec(remoteCmd, (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          conn.end();
          return;
        }

        stream.on('close', (code) => {
          console.log(`\n✅ Remote update finished with exit code: ${code}`);
          try { fs.unlinkSync(tarFile); } catch {}
          conn.end();
        }).on('data', (d) => process.stdout.write(d.toString()))
          .stderr.on('data', (d) => process.stderr.write(d.toString()));
      });
    });

    readStream.pipe(writeStream);
  });
}).on('error', (err) => {
  console.error('❌ SSH Connection failed:', err.message);
}).connect({
  host: '2.27.9.160',
  port: 22,
  username: 'root',
  password: 'pVpW4Ez28Y5O',
  readyTimeout: 20000
});
