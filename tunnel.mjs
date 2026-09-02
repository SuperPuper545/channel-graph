import localtunnel from 'localtunnel';

async function start() {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log('PUBLIC_HTTPS_URL:' + tunnel.url);
    
    tunnel.on('close', () => {
      console.log('Tunnel closed, restarting...');
      setTimeout(start, 2000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
    setTimeout(start, 3000);
  }
}

start();
