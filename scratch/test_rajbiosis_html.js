const fs = require('fs');

async function checkRajbiosis() {
  try {
    const res = await fetch('https://www.rajbiosis.org/biochemistry-reagents.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    console.log('HTML total length:', html.length);

    // Let's search for truechemie-calcium-test-kit-2x50ml in HTML
    const needle = 'truechemie-calcium-test-kit-2x50ml';
    let pos = 0;
    while ((pos = html.indexOf(needle, pos + 1)) !== -1) {
      console.log('Found needle at pos:', pos);
      console.log(html.slice(Math.max(0, pos - 150), pos + 350));
      console.log('---------------------------');
    }
  } catch (err) {
    console.error(err);
  }
}

checkRajbiosis();

