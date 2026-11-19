const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:/Users/Admin/.gemini/antigravity/brain/f5cd4f46-0b39-4658-80c8-55e04e051926/.user_uploaded/media_1794818695044_3ad581c6.xlsx');
const sheet = workbook.Sheets['All Product Listings'];
const rows = xlsx.utils.sheet_to_json(sheet);

const uniquePages = Array.from(new Set(rows.map(r => (r['Product URL'] || '').split('#')[0]).filter(Boolean)));
console.log('Total unique pages to fetch:', uniquePages.length);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchPageWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.status === 429) {
        console.warn(`[429 Rate limited] on ${url}, waiting ${attempt * 1500}ms...`);
        await sleep(attempt * 1500);
        continue;
      }
      if (!res.ok) {
        console.warn(`HTTP ${res.status} on ${url}`);
        return { url, items: [] };
      }
      const html = await res.text();
      const match = html.match(/var\s+dataref1\s*=\s*(?:new Object\(\);?\s*dataref1\s*=)?\s*eval\s*\(\s*(\[[\s\S]*?\])\s*\)/);
      if (!match) return { url, items: [] };
      try {
        const items = (new Function('return ' + match[1]))();
        return { url, items };
      } catch (e) {
        return { url, items: [] };
      }
    } catch (err) {
      if (attempt === retries) return { url, items: [] };
      await sleep(1000);
    }
  }
  return { url, items: [] };
}

(async () => {
  const imageMapByName = new Map();
  const imageMapByHash = new Map();

  function norm(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  console.log('Fetching pages with gentle pacing...');
  let completed = 0;
  for (const pageUrl of uniquePages) {
    const res = await fetchPageWithRetry(pageUrl);
    if (res.items && res.items.length > 0) {
      res.items.forEach(it => {
        const img = it.img_path || it.img_path1;
        if (img && it.prd_name) {
          imageMapByName.set(norm(it.prd_name), img);
          const slug = it.prd_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          imageMapByHash.set(norm(slug), img);
        }
      });
    }
    completed++;
    if (completed % 10 === 0 || completed === uniquePages.length) {
      console.log(`Progress: ${completed}/${uniquePages.length} pages done. Images collected: ${imageMapByName.size}`);
    }
    await sleep(200); // 200ms delay between requests to avoid 429
  }

  // Save the image map cache
  const objMap = Object.fromEntries(imageMapByName);
  fs.writeFileSync('src/data/productImageMap.json', JSON.stringify(objMap, null, 2));
  console.log('Saved src/data/productImageMap.json with', Object.keys(objMap).length, 'entries');

  // Now enrich all 1169 rows
  let matchedCount = 0;
  const enrichedRows = rows.map((r, i) => {
    const name = r['Product Name'];
    const url = r['Product URL'] || '';
    const hash = url.split('#')[1] || '';
    const nameNorm = norm(name);
    const hashNorm = norm(hash);

    let img = imageMapByName.get(nameNorm) || imageMapByHash.get(hashNorm) || '';

    if (!img) {
      // Try fuzzy search or partial match
      for (const [k, v] of imageMapByName.entries()) {
        if (k.includes(nameNorm) || nameNorm.includes(k)) {
          img = v;
          break;
        }
      }
    }

    if (img) matchedCount++;

    return {
      'Sr. No.': r['Sr. No.'] || (i + 1),
      'Product Name': name,
      'Category': r['Category'] || '',
      'Listed Price': r['Listed Price'] || '',
      'Image URL': img,
      'Product URL': url
    };
  });

  console.log(`Enrichment complete! Matched ${matchedCount}/${rows.length} products (${((matchedCount/rows.length)*100).toFixed(1)}%)`);

  // Write enriched Excel file
  const newWb = xlsx.utils.book_new();
  const newWs = xlsx.utils.json_to_sheet(enrichedRows);
  xlsx.utils.book_append_sheet(newWb, newWs, 'All Product Listings');
  const outPath = 'public/Raj_Biosis_Products_With_Images.xlsx';
  xlsx.writeFile(newWb, outPath);
  console.log('Created enriched Excel file at:', outPath);
})();

