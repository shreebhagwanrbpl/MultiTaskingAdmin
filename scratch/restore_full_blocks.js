const http = require('http');

async function restore() {
  const getRes = await new Promise(resolve => {
    http.get('http://localhost:3001/api/sites', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const rajbiosis = getRes.sites.find(s => s.domain === 'rajbiosis.com');
  if (!rajbiosis) {
    console.log('rajbiosis.com not found');
    return;
  }

  const { getDefaultBlocksForSite } = require('./src/data/pageBlocks.js');
  const blocks = getDefaultBlocksForSite(rajbiosis);

  const payload = JSON.stringify({
    ...rajbiosis,
    layoutBlocks: blocks
  });

  const postReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/sites',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, res => {
    let out = '';
    res.on('data', c => out += c);
    res.on('end', () => console.log('Updated rajbiosis with all 10 blocks:', JSON.parse(out).success));
  });
  postReq.write(payload);
  postReq.end();
}

restore();
