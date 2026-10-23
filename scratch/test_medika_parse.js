async function testParse() {
  const res = await fetch('https://www.medikabazaar.com/shop', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML size:', html.length);

  // 1. Logo
  const logoMatch = html.match(/<img[^>]+src=["']([^"']*(?:logo|Mb_logo)[^"']*)["']/i);
  console.log('Logo match:', logoMatch ? logoMatch[1] : 'None');

  // 2. Banner images
  const bannerMatches = [];
  const bannerRegex = /<img[^>]+src=["']([^"']*(?:banner|web|Dus|hero|slide)[^"']*)["']/gi;
  let bMatch;
  while ((bMatch = bannerRegex.exec(html)) !== null && bannerMatches.length < 5) {
    bannerMatches.push(bMatch[1]);
  }
  console.log('Banner matches:', bannerMatches);

  // 3. Category cards
  const catMatches = [];
  const catRegex = /<img[^>]+src=["']([^"']*(?:category|default_images|spec_image)[^"']*)["'][^>]*alt=["']?([^"'>]*)/gi;
  let cMatch;
  while ((cMatch = catRegex.exec(html)) !== null && catMatches.length < 10) {
    catMatches.push({ img: cMatch[1], title: cMatch[2] });
  }
  console.log('Categories:', catMatches);

  // 4. Products / Items
  const prodMatches = [];
  const prodRegex = /<img[^>]+src=["']([^"']*(?:product_images|media\/public)[^"']*)["'][^>]*alt=["']?([^"'>]*)/gi;
  let pMatch;
  while ((pMatch = prodRegex.exec(html)) !== null && prodMatches.length < 10) {
    prodMatches.push({ img: pMatch[1], name: pMatch[2] });
  }
  console.log('Products:', prodMatches);
}

testParse().catch(console.error);
