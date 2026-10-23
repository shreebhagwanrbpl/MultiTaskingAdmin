const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 3001,
      path
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: resBody.length }));
    }).on('error', reject);
  });
}

async function testAll() {
  console.log('Testing 1: Test Theme Importer API with sample biomedical HTML...');
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Apollo BioSystems | Advanced ICU & Surgery</title>
        <meta name="description" content="Leading manufacturer of critical care ventilators and surgical laparoscopy towers.">
        <meta name="theme-color" content="#059669">
      </head>
      <body>
        <h1>Next-Gen Clinical ICU & Surgical Life Support</h1>
        <p>Contact: 1800-888-9999 or email care@apollobio.in</p>
      </body>
    </html>
  `;

  const importRes = await post('/api/sites/import', {
    action: 'parse_html',
    rawHtml: sampleHtml,
    targetSite: { domain: 'apollobio.in' }
  });

  console.log('Import Response Status:', importRes.status);
  console.log('Extracted Data:', importRes.body?.extractedData);
  console.log('Extracted Blocks Count:', importRes.body?.layoutBlocks?.length);

  if (importRes.body?.extractedData?.brandName?.includes('Apollo BioSystems') &&
      importRes.body?.layoutBlocks?.length > 0) {
    console.log('✅ PASS: Importer successfully parsed HTML, extracted brand, and generated layout blocks!');
  } else {
    console.log('❌ FAIL: Importer response not matching expectation');
  }

  console.log('\nTesting 2: Testing /preview/rajbiosis.com?sandbox=true...');
  const previewRes = await get('/preview/rajbiosis.com?sandbox=true');
  console.log('Preview HTTP Status:', previewRes.status, 'HTML length:', previewRes.length);

  console.log('\nTesting 3: Testing /admin...');
  const adminRes = await get('/admin');
  console.log('Admin HTTP Status:', adminRes.status, 'HTML length:', adminRes.length);

  console.log('\nAll automated API tests finished.');
}

testAll().catch(err => console.error('Test error:', err));
