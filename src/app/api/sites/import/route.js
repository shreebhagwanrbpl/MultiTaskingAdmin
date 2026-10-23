import { NextResponse } from 'next/server';
import { getDefaultBlocksForSite, SITE_PAGES } from '../../../../data/pageBlocks';

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractMeta(html, name) {
  const regex = new RegExp(`<meta[^>]+(?:name|property)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  if (match) return cleanText(match[1]);

  const regexRev = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:og:)?${name}["']`, 'i');
  const matchRev = html.match(regexRev);
  return matchRev ? cleanText(matchRev[1]) : '';
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? cleanText(match[1]) : '';
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? cleanText(match[1]) : '';
}

function extractColors(html) {
  const themeColor = extractMeta(html, 'theme-color');
  if (themeColor && /^#[0-9a-fA-F]{6}$/i.test(themeColor)) {
    return themeColor;
  }

  const colorMatches = html.match(/#(0ea5e9|0284c7|059669|10b981|e11d48|dc2626|7c3aed|6366f1|d97706|2563eb|182a54|1e293b)/gi);
  if (colorMatches && colorMatches.length > 0) {
    return colorMatches[0].toLowerCase();
  }

  return '#0ea5e9';
}

function extractPhone(html) {
  const tollFree = html.match(/1800[ -]?\d{3}[ -]?\d{3,4}/);
  if (tollFree) return tollFree[0].replace(/\s+/g, '-');

  const indianMobile = html.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/);
  if (indianMobile) return indianMobile[0].trim();

  return '1800-419-BIOSIS';
}

function extractEmail(html) {
  const match = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (match) {
    const candidate = match[0].toLowerCase();
    if (!candidate.endsWith('.png') && !candidate.endsWith('.jpg') && !candidate.endsWith('.webp')) {
      return candidate;
    }
  }
  return 'sales@biomedical.in';
}

function resolveUrl(url, baseUrl) {
  if (!url) return '';
  const clean = url.replace(/&amp;/g, '&');
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.startsWith('//')) return `https:${clean}`;
  try {
    const base = new URL(baseUrl);
    return new URL(clean, base.origin).toString();
  } catch (e) {
    return clean;
  }
}

function extractLogo(html, baseUrl) {
  const ogImg = extractMeta(html, 'image');
  if (ogImg && ogImg.toLowerCase().includes('logo')) {
    return resolveUrl(ogImg, baseUrl);
  }

  const logoMatch = html.match(/<img[^>]+src=["']([^"']*(?:logo|Mb_logo|brand)[^"']*\.(?:png|jpg|webp|svg)[^"']*)["']/i);
  if (logoMatch) return resolveUrl(logoMatch[1], baseUrl);

  const logoAltMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?[^"'>]*logo/i);
  if (logoAltMatch) return resolveUrl(logoAltMatch[1], baseUrl);

  return '';
}

function extractBanner(html, baseUrl) {
  const ogImg = extractMeta(html, 'image');
  if (ogImg && !ogImg.toLowerCase().includes('logo') && !ogImg.endsWith('.ico')) {
    return resolveUrl(ogImg, baseUrl);
  }

  const bannerMatch = html.match(/<img[^>]+src=["']([^"']*(?:Dus_web|banner|slider|hero|desktop|home)[^"']*\.(?:png|jpg|webp)[^"']*)["']/i);
  if (bannerMatch) return resolveUrl(bannerMatch[1], baseUrl);

  const bigImg = html.match(/<img[^>]+src=["']([^"']*(?:media\/public\/default_images|upload)[^"']*\.(?:png|jpg|webp)[^"']*)["']/i);
  if (bigImg) return resolveUrl(bigImg[1], baseUrl);

  return '';
}

const DEFAULT_12_CATEGORIES = [
  { id: 'cat-dental', name: 'Dental', icon: '🦷', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=140&q=80', desc: 'Chairs & Handpieces' },
  { id: 'cat-diagnostics', name: 'Diagnostics', icon: '🔬', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=140&q=80', desc: 'Analyzers & Pathology' },
  { id: 'cat-furniture', name: 'Hospital Furniture', icon: '🛏️', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=140&q=80', desc: 'ICU Beds & Trolleys' },
  { id: 'cat-imaging', name: 'Imaging & Radiology', icon: '📡', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=140&q=80', desc: 'CT, MRI, X-Ray & C-Arm' },
  { id: 'cat-critical', name: 'Critical Care & ICU', icon: '🫀', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=140&q=80', desc: 'Ventilators & Monitors' },
  { id: 'cat-consumables', name: 'Consumables', icon: '🧤', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=140&q=80', desc: 'Gloves, Syringes & Kits' },
  { id: 'cat-physio', name: 'Physiotherapy', icon: '♿', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=140&q=80', desc: 'Rehab & Mobility Units' },
  { id: 'cat-lab', name: 'Lab Supplies', icon: '🧪', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=140&q=80', desc: 'Reagents & Test Tubes' },
  { id: 'cat-surgical', name: 'Surgical Instruments', icon: '✂️', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=140&q=80', desc: 'OT Sets & Cautery' },
  { id: 'cat-patient-aid', name: 'Patient Aid', icon: '🩺', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=140&q=80', desc: 'Walkers & Home Care' },
  { id: 'cat-sanitization', name: 'Sanitization', icon: '🧴', image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=140&q=80', desc: 'Disinfectants & Sterilizers' },
  { id: 'cat-ortho', name: 'Orthopedic Implants', icon: '🦴', image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=140&q=80', desc: 'Plates, Screws & Drills' }
];

function extractCategories(html, baseUrl) {
  const categories = [];
  const catRegex = /<img[^>]+src=["']([^"']*(?:category|default_images|spec_image|product)[^"']*\.(?:png|jpg|webp)[^"']*)["'][^>]*alt=["']?([^"'>]*)/gi;
  let cm;
  while ((cm = catRegex.exec(html)) !== null && categories.length < 12) {
    const title = cm[2].replace(/<[^>]+>/g, '').trim();
    if (title && title.length > 2 && !title.toLowerCase().includes('logo') && !title.toLowerCase().includes('home') && !title.toLowerCase().includes('facebook')) {
      categories.push({
        id: `cat-${categories.length + 1}`,
        name: title,
        image: resolveUrl(cm[1], baseUrl)
      });
    }
  }

  // If fewer than 12 were found, merge with the standard 12 medical categories
  if (categories.length < 6) {
    return DEFAULT_12_CATEGORIES;
  }
  return categories;
}

function extractProducts(html, baseUrl) {
  const products = [];
  const prodRegex = /<img[^>]+src=["']([^"']*(?:product_images|spec_image|media\/public)[^"']*\.(?:png|jpg|webp)[^"']*)["'][^>]*alt=["']?([^"'>]*)/gi;
  let pm;
  while ((pm = prodRegex.exec(html)) !== null && products.length < 8) {
    const name = pm[2].replace(/<[^>]+>/g, '').trim();
    if (name && name.length > 3 && !name.toLowerCase().includes('logo') && !name.toLowerCase().includes('home') && !name.toLowerCase().includes('facebook')) {
      products.push({
        id: `imp-${products.length + 1}`,
        sku: `OEM-${100 + products.length}`,
        name: name,
        image: resolveUrl(pm[1], baseUrl),
        price: 32000 + (products.length * 18000),
        mrp: 48000 + (products.length * 25000),
        rating: 4.8,
        reviewsCount: 16 + (products.length * 4),
        shortDesc: `Hospital-grade certified ${name} with official warranty and direct institutional rate.`,
        badge: 'Verified OEM'
      });
    }
  }
  return products;
}

function detectCategoryFocus(html) {
  const lower = html.toLowerCase();
  if (lower.includes('respiratory') || lower.includes('ventilator') || lower.includes('critical care') || lower.includes('icu')) {
    return 'ICU & Critical Care';
  }
  if (lower.includes('surgery') || lower.includes('surgical') || lower.includes('operation theatre') || lower.includes('laparoscopy')) {
    return 'Surgical & OT Equipment';
  }
  if (lower.includes('x-ray') || lower.includes('radiology') || lower.includes('ultrasound') || lower.includes('imaging') || lower.includes('c-arm')) {
    return 'Radiology & Imaging';
  }
  if (lower.includes('cardio') || lower.includes('ecg') || lower.includes('defibrillator') || lower.includes('cardiac')) {
    return 'Cardiology & Resuscitation';
  }
  if (lower.includes('dialysis') || lower.includes('nephrology') || lower.includes('hemodialysis')) {
    return 'Dialysis & Nephrology';
  }
  return 'All Clinical Departments';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, url, rawHtml, targetSite } = body;

    let htmlContent = '';
    let parsedDomain = '';
    let baseUrl = 'https://biomedical-network.in';

    if (action === 'url_scrape') {
      if (!url || typeof url !== 'string') {
        return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
      }

      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }
      baseUrl = targetUrl;

      try {
        const urlObj = new URL(targetUrl);
        parsedDomain = urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        parsedDomain = 'imported-site.in';
      }

      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        htmlContent = await response.text();
      } catch (fetchErr) {
        return NextResponse.json({
          success: false,
          error: `Could not fetch live URL: ${fetchErr.message}. You can also paste the website's HTML code directly in the HTML Paste tab.`
        }, { status: 422 });
      }
    } else if (action === 'parse_html') {
      if (!rawHtml || typeof rawHtml !== 'string') {
        return NextResponse.json({ success: false, error: 'Raw HTML content is required' }, { status: 400 });
      }
      htmlContent = rawHtml;
      parsedDomain = targetSite?.domain || 'custom-import.in';
      baseUrl = `https://${parsedDomain}`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Parse elements
    const pageTitle = extractTitle(htmlContent);
    const metaDesc = extractMeta(htmlContent, 'description');
    const heroH1 = extractH1(htmlContent);
    const primaryColor = extractColors(htmlContent);
    const phone = extractPhone(htmlContent);
    const email = extractEmail(htmlContent);
    const categoryFocus = detectCategoryFocus(htmlContent);

    // Visual Elements: Real Logo, Real Hero Banner, Real Categories, Real Products
    const logoUrl = extractLogo(htmlContent, baseUrl);
    const bannerImage = extractBanner(htmlContent, baseUrl);
    const categories = extractCategories(htmlContent, baseUrl);
    const customProducts = extractProducts(htmlContent, baseUrl);

    // Clean brand name from title
    let brandName = pageTitle;
    if (brandName.includes('|')) {
      brandName = brandName.split('|')[0].trim();
    } else if (brandName.includes('-')) {
      brandName = brandName.split('-')[0].trim();
    } else if (brandName.includes('—')) {
      brandName = brandName.split('—')[0].trim();
    }
    if (!brandName || brandName.length > 50) {
      brandName = parsedDomain ? parsedDomain.split('.')[0].toUpperCase() + ' Biomedical' : 'Biomedical Systems';
    }

    const tagline = metaDesc || 'Advanced Biomedical Hospital Equipment & Critical Care Infrastructure';
    const heroTitle = heroH1 || `${brandName} High-Acuity Biomedical Systems`;

    // Generate custom layout blocks adapted to this extracted site
    const adaptedSite = {
      domain: parsedDomain || targetSite?.domain || 'imported-site.in',
      brandName,
      tagline,
      heroTitle,
      primaryColor,
      phone,
      email,
      categoryFocus,
      logo: logoUrl,
      bannerImage: bannerImage,
      city: 'Pan-India Distribution Hub'
    };

    const generatedBlocks = getDefaultBlocksForSite(adaptedSite);

    // Customize layout blocks with the REAL visual assets extracted
    const finalBlocks = generatedBlocks.map(b => {
      if (b.type === 'header') {
        return {
          ...b,
          data: {
            ...b.data,
            logoUrl: logoUrl || b.data.logoUrl || ''
          }
        };
      }
      if (b.type === 'hero') {
        return {
          ...b,
          data: {
            ...b.data,
            title: heroTitle,
            subtitle: tagline,
            bannerImage: bannerImage || b.data.bannerImage || '',
            showBannerImage: !!bannerImage
          }
        };
      }
      if (b.type === 'categories') {
        return {
          ...b,
          data: {
            ...b.data,
            heading: 'Shop by Clinical Category',
            subheading: `Browse verified medical equipment and supplies from ${brandName}.`,
            items: categories
          }
        };
      }
      if (b.type === 'products') {
        return {
          ...b,
          data: {
            ...b.data,
            heading: 'Featured Clinical Products & Supplies',
            subheading: `Direct institutional supply rate from ${brandName}.`,
            customProducts: customProducts && customProducts.length > 0 ? customProducts : undefined
          }
        };
      }
      if (b.type === 'announcement') {
        return {
          ...b,
          data: {
            ...b.data,
            bgColor: primaryColor,
            text: `Authorized OEM Hospital Supplier | Direct GeM & ISO 13485 Certified Hub`
          }
        };
      }
      return b;
    });

    return NextResponse.json({
      success: true,
      source: action,
      extractedData: {
        domain: parsedDomain,
        brandName,
        tagline,
        heroTitle,
        primaryColor,
        phone,
        email,
        categoryFocus,
        logo: logoUrl,
        bannerImage: bannerImage,
        categories: categories,
        customProducts: customProducts,
        pages: SITE_PAGES
      },
      pages: SITE_PAGES,
      layoutBlocks: finalBlocks
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
