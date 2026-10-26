import * as XLSX from 'xlsx';

// The exact 18 columns required
export const EXCEL_COLUMNS = [
  'title',
  'price',
  'desc',
  'capacity',
  'throughput',
  'instrument',
  'model',
  'usage',
  'brand',
  'parameters',
  'automation',
  'availability',
  'size',
  'images',
  'video',
  'pdf',
  'category',
  'sub category'
];

// Sample demo rows demonstrating both Normal Products and Categorized (Category -> Subcategory) Products
export const SAMPLE_PRODUCTS = [
  {
    title: 'RajBiosis-Vent Pro-X9 Mechanical Ventilator',
    price: 485000,
    desc: 'Turbine-driven critical care ICU ventilator for adult, pediatric, and neonatal patients with invasive and non-invasive ventilation.',
    capacity: '20 ml to 2000 ml Tidal Volume',
    throughput: 'Continuous 24/7 ICU life support',
    instrument: 'Central Gas / High Pressure Cylinder / Internal Turbine',
    model: 'PRO-X9-TURBINE',
    usage: 'ICU Critical Care & Emergency Resuscitation',
    brand: 'Raj Biosis',
    parameters: 'VCV, PCV, SIMV, CPAP/PSV, PRVC, DuoLevel, APRV, HFNC',
    automation: 'Fully Automated with AI Auto-PEEP',
    availability: 'In Stock',
    size: '1420 x 580 x 640 mm (Cart Mounted)',
    images: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    video: 'https://www.youtube.com/watch?v=sample-ventilator',
    pdf: 'https://rajbiosis.com/docs/pro-x9-datasheet.pdf',
    category: 'ICU & Critical Care',
    'sub category': 'Mechanical Ventilators'
  },
  {
    title: 'CardioPulse 12-Channel Multi-Para Monitor',
    price: 68500,
    desc: 'Modular 12.1 inch touchscreen patient monitor with telemetry, arrhythmia detection, and ST segment analysis.',
    capacity: '12-lead simultaneous ECG monitoring',
    throughput: 'Real-time 120-hour trend storage',
    instrument: 'Central Telemetry Station & Bedside',
    model: 'CP-12X-MODULAR',
    usage: 'Cardiac Care Unit (CCU) & General Ward',
    brand: 'Raj Biosis',
    parameters: 'ECG, SpO2, NIBP, Respiration, Temp (Dual), IBP, EtCO2',
    automation: 'Microprocessor Controlled with Auto-Alarms',
    availability: 'In Stock',
    size: '320 x 280 x 160 mm (3.6 kg)',
    images: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    video: '',
    pdf: 'https://rajbiosis.com/docs/cardiopulse-12x.pdf',
    category: 'Patient Monitoring',
    'sub category': 'Multi-Parameter Monitors'
  },
  {
    title: 'DefiQuick Biphasic Defibrillator Monitor',
    price: 185000,
    desc: 'Rugged portable biphasic defibrillator with external paddles, AED voice coaching, and built-in thermal recorder.',
    capacity: 'Up to 360 Joules Biphasic Energy',
    throughput: 'Charges to 200J in less than 3 seconds',
    instrument: 'Rechargeable Li-ion battery + AC Mains',
    model: 'DQ-360-BIPHASIC',
    usage: 'Emergency Room, Ambulance & Crash Cart',
    brand: 'Human Biomedicals',
    parameters: 'Manual Defib, AED Mode, 3-Lead ECG, Pacing Mode',
    automation: 'Semi-Automated AED + Manual Override',
    availability: 'In Stock',
    size: '310 x 240 x 290 mm (5.5 kg with battery)',
    images: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    video: 'https://www.youtube.com/watch?v=sample-defib',
    pdf: 'https://humanbiomedicals.in/docs/defiquick-manual.pdf',
    category: 'Cardiology & Resuscitation',
    'sub category': 'Defibrillators & AED'
  },
  {
    title: 'HemoPure Multi-Flow Hemodialysis Station',
    price: 740000,
    desc: 'High-flux dialysis machine with integrated endotoxin filter, dialysate heating, and heparin infusion pump.',
    capacity: 'Blood flow 30 - 600 mL/min, Dialysate 300 - 800 mL/min',
    throughput: 'Continuous treatment up to 10 hours',
    instrument: 'Central RO Water Plant + Bicarbonate Concentrate',
    model: 'HP-8000-HEMO',
    usage: 'Nephrology & Renal Dialysis Centers',
    brand: 'Human Biomedicals',
    parameters: 'Kt/V calculation, Blood Volume Monitor, Ultrafiltration',
    automation: 'Fully Automated Disinfection & Priming',
    availability: 'Made to Order',
    size: '1480 x 510 x 600 mm (85 kg)',
    images: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
    video: '',
    pdf: 'https://humanbiomedicals.in/docs/hemopure-spec.pdf',
    category: 'Dialysis & Nephrology',
    'sub category': 'Hemodialysis Machines'
  },
  {
    title: 'RayMaster 500mA High-Frequency Fixed X-Ray',
    price: 1250000,
    desc: 'Heavy-duty 50kW high frequency radiography suite with motorized 4-way floating tabletop and vertical bucky stand.',
    capacity: '50 kW Generator / 500 mA Output',
    throughput: 'Up to 120 exposures per hour',
    instrument: '3-Phase 415V AC Power Supply',
    model: 'RM-500-HF-RAD',
    usage: 'Diagnostic Radiology & Hospital Imaging Suite',
    brand: 'Global Biomedical',
    parameters: 'kVp range 40-150 kV, mAs 0.5 - 630 mAs',
    automation: 'Anatomical Programmed Radiography (APR) Touchscreen',
    availability: 'In Stock',
    size: 'Table 2100 x 750 mm / Floor to Ceiling Tube Stand',
    images: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    video: '',
    pdf: 'https://globalbiomedical.com/docs/raymaster-500.pdf',
    category: 'Radiology & Imaging',
    'sub category': 'Fixed X-Ray Systems'
  },
  {
    title: 'AuraSurg 4K Ultra HD Laparoscopy Tower',
    price: 1450000,
    desc: 'Complete turnkey surgical video endoscopy tower with 4K camera console, 32-inch medical grade monitor, LED light source, and 40L CO2 insufflator.',
    capacity: '3840 x 2160 Resolution @ 60 FPS',
    throughput: 'Simultaneous USB recording & live HDMI 2.0 streaming',
    instrument: 'Standard 10mm & 5mm rigid laparoscopes',
    model: 'AS-4K-SURG-PRO',
    usage: 'General Surgery, Gynecology & Urology OT',
    brand: 'Global Biomedical',
    parameters: 'Auto White Balance, Edge Enhancement, Color Matrix',
    automation: 'Smart Light Output Sensing & Auto-Flow Insufflation',
    availability: 'In Stock',
    size: 'Surgical Trolley: 1550 x 680 x 650 mm',
    images: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    video: 'https://www.youtube.com/watch?v=sample-laparoscopy',
    pdf: 'https://globalbiomedical.com/docs/aurasurg-4k.pdf',
    category: 'Surgical & OT Equipment',
    'sub category': 'Laparoscopy Systems'
  },
  // Normal Product Sample (no subcategory)
  {
    title: 'Biomedical Digital Infrared Forehead Thermometer',
    price: 1850,
    desc: 'Medical non-contact forehead thermometer with 1-second instant reading and color fever alarm.',
    capacity: '32.0°C to 42.9°C range',
    throughput: '1 second response time, 32 memory recalls',
    instrument: '2x AAA Alkaline Batteries',
    model: 'BIO-IR-01',
    usage: 'Hospital Triage & Clinical Examination',
    brand: 'Raj Biosis',
    parameters: '±0.2°C High Accuracy Sensor',
    automation: 'Auto-Shutoff in 15 seconds',
    availability: 'In Stock',
    size: '150 x 95 x 44 mm (110g)',
    images: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    video: '',
    pdf: '',
    category: 'Diagnostic & General Instruments',
    'sub category': '' // Normal product: no subcategory
  }
];

/**
 * Generates an Excel workbook file (as Blob/Buffer) matching the exact sheet name "Products"
 * and 18 columns specified by user.
 */
export function generateDemoExcelFile() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_PRODUCTS, { header: EXCEL_COLUMNS });
  
  // Set column widths for readability
  ws['!cols'] = [
    { wch: 35 }, // title
    { wch: 12 }, // price
    { wch: 45 }, // desc
    { wch: 25 }, // capacity
    { wch: 25 }, // throughput
    { wch: 25 }, // instrument
    { wch: 18 }, // model
    { wch: 30 }, // usage
    { wch: 20 }, // brand
    { wch: 35 }, // parameters
    { wch: 25 }, // automation
    { wch: 15 }, // availability
    { wch: 25 }, // size
    { wch: 35 }, // images
    { wch: 25 }, // video
    { wch: 25 }, // pdf
    { wch: 22 }, // category
    { wch: 22 }  // sub category
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Generate binary array
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Exports any given array of products to a real .xlsx file matching the Products sheet & 18 columns.
 */
export function exportProductsToExcelFile(products, sheetName = 'Products') {
  const rows = products.map(p => {
    return {
      title: p.title || p.name || '',
      sku: p.sku || p.model || '',
      price: p.price || 0,
      mrp: p.mrp || (p.price ? Math.round(p.price * 1.25) : 0),
      offer: p.offer !== undefined ? p.offer : 15,
      gstRate: p.gstRate !== undefined ? p.gstRate : 18,
      hsnCode: p.hsnCode || '9018',
      quantity: p.quantity !== undefined ? p.quantity : 25,
      expiryDate: p.expiryDate || '2028-06-30',
      desc: p.desc || p.shortDesc || p.description || '',
      capacity: p.capacity || '',
      throughput: p.throughput || '',
      instrument: p.instrument || '',
      model: p.model || p.sku || '',
      usage: p.usage || '',
      brand: p.brand || '',
      parameters: p.parameters || '',
      automation: p.automation || '',
      availability: p.availability || p.stockStatus || 'In Stock',
      size: p.size || '',
      images: p.images || p.image || '',
      video: p.video || '',
      pdf: p.pdf || '',
      category: p.category || '',
      'sub category': p['sub category'] || p.subCategory || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 40 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 25 },
    { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
    { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Parses one or multiple Excel / CSV files and normalizes rows into products.
 */
export async function parseExcelFilesList(files) {
  const allParsedProducts = [];
  const errors = [];

  for (const file of files) {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Look for sheet named "Products" (case-insensitive) or pick first sheet
      const sheetName = workbook.SheetNames.find(
        name => name.trim().toLowerCase() === 'products'
      ) || workbook.SheetNames[0];

      if (!sheetName) {
        errors.push(`File "${file.name}" has no readable worksheets.`);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        errors.push(`File "${file.name}" sheet "${sheetName}" is empty.`);
        continue;
      }

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];

        // Flexible key matching for each of the 18 columns
        const getVal = (keyNames) => {
          for (const k of Object.keys(row)) {
            const cleanK = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
            for (const target of keyNames) {
              if (cleanK === target.toLowerCase().replace(/[\s_-]+/g, '')) {
                return String(row[k] || '').trim();
              }
            }
          }
          return '';
        };

        const title = getVal(['title', 'name', 'productname', 'product']);
        if (!title) continue; // Skip completely empty rows

        const priceRaw = getVal(['price', 'rate', 'cost', 'sellingprice']);
        const numericPrice = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

        const subCategory = getVal(['sub category', 'subcategory', 'sub_category', 'sub-cat']);
        const category = getVal(['category', 'cat', 'department']);

        const skuRaw = getVal(['sku', 'code', 'model', 'itemcode']);
        const mrpRaw = getVal(['mrp', 'listprice', 'maxretailprice']);
        const offerRaw = getVal(['offer', 'discount', 'discountpercentage', 'offer%']);
        const gstRaw = getVal(['gstrate', 'gst', 'tax', 'taxrate', 'gst%']);
        const hsnRaw = getVal(['hsncode', 'hsn', 'sac', 'hs_code']);
        const qtyRaw = getVal(['quantity', 'qty', 'stock', 'stockcount', 'units']);
        const expRaw = getVal(['expirydate', 'expiry', 'exp', 'shelflife', 'validuntil']);

        const mrpNumeric = parseFloat(mrpRaw.replace(/[^0-9.]/g, '')) || (numericPrice ? Math.round(numericPrice * 1.25) : 0);
        const offerNumeric = offerRaw ? parseFloat(offerRaw.replace(/[^0-9.]/g, '')) : (mrpNumeric > numericPrice ? Math.round(((mrpNumeric - numericPrice) / mrpNumeric) * 100) : 15);
        const gstNumeric = gstRaw ? parseFloat(gstRaw.replace(/[^0-9.]/g, '')) : 18;
        const qtyNumeric = qtyRaw ? parseInt(qtyRaw.replace(/[^0-9]/g, ''), 10) : 25;

        allParsedProducts.push({
          sourceFile: file.name,
          title,
          sku: skuRaw || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
          price: numericPrice,
          mrp: mrpNumeric,
          offer: offerNumeric,
          discount: offerNumeric,
          gstRate: gstNumeric,
          hsnCode: hsnRaw || '9018',
          quantity: qtyNumeric,
          stockCount: qtyNumeric,
          expiryDate: expRaw || '2028-06-30',
          desc: getVal(['desc', 'description', 'shortdesc', 'details']),
          capacity: getVal(['capacity', 'volume']),
          throughput: getVal(['throughput', 'speed', 'performance']),
          instrument: getVal(['instrument', 'compatibleinstrument']),
          model: getVal(['model', 'sku', 'productmodel', 'code']),
          usage: getVal(['usage', 'intendedusage', 'application']),
          brand: getVal(['brand', 'manufacturer', 'company']),
          parameters: getVal(['parameters', 'tests', 'measurements']),
          automation: getVal(['automation', 'automationtype', 'type']),
          availability: getVal(['availability', 'stock', 'stockstatus']) || (qtyNumeric > 0 ? 'In Stock' : 'Out of Stock'),
          size: getVal(['size', 'dimensions', 'weight']),
          images: getVal(['images', 'image', 'img', 'photo', 'picture']),
          video: getVal(['video', 'videourl', 'youtube']),
          pdf: getVal(['pdf', 'brochure', 'datasheet', 'manual']),
          category: category || 'General Medical',
          'sub category': subCategory,
          subCategory: subCategory,
          productType: subCategory ? 'hierarchical' : 'normal'
        });
      }
    } catch (err) {
      errors.push(`Failed to parse file "${file.name}": ${err.message}`);
    }
  }

  return { products: allParsedProducts, errors };
}
