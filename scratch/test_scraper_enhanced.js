async function test() {
  const res = await fetch('https://www.medikabazaar.com/shop', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();

  // Extract logo
  let logo = '';
  const logoM = html.match(/<img[^>]+src=["']([^"']*(?:logo|Mb_logo|brand)[^"']*\.(?:png|jpg|webp|svg)[^"']*)["']/i);
  if (logoM) logo = logoM[1];

  // Extract banner
  let banner = '';
  const bannerM = html.match(/<img[^>]+src=["']([^"']*(?:Dus_web|banner|slider|hero)[^"']*\.(?:png|jpg|webp)[^"']*)["']/i);
  if (bannerM) banner = bannerM[1];

  // Extract categories
  const categories = [];
  const catRegex = /<img[^>]+src=["']([^"']*(?:category|default_images|spec_image)[^"']*\.(?:png|jpg|webp)[^"']*)["'][^>]*alt=["']?([^"'>]*)/gi;
  let cm;
  while ((cm = catRegex.exec(html)) !== null && categories.length < 8) {
    const title = cm[2].trim();
    if (title && !title.toLowerCase().includes('logo') && !title.toLowerCase().includes('home')) {
      categories.push({ name: title, image: cm[1] });
    }
  }

  console.log('Logo:', logo);
  console.log('Banner:', banner);
  console.log('Categories:', categories);
}

test().catch(console.error);
