async function inspect() {
  const res = await fetch('https://www.medikabazaar.com/shop', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML size:', html.length);

  // Find images (banners, logos, products)
  const imgMatches = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null && imgMatches.length < 20) {
    if (match[1].startsWith('http') || match[1].startsWith('//')) {
      imgMatches.push(match[1]);
    }
  }

  // Find sections or headings
  const headings = [];
  const hRegex = /<(?:h1|h2|h3)[^>]*>([\s\S]*?)<\/(?:h1|h2|h3)>/gi;
  while ((match = hRegex.exec(html)) !== null && headings.length < 15) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 3 && text.length < 80) headings.push(text);
  }

  console.log('Headings:', headings);
  console.log('Sample images:', imgMatches.slice(0, 8));
}

inspect().catch(console.error);
