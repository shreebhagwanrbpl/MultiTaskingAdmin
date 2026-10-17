export const PRODUCTS = [
  {
    id: "prod-vent-x9",
    sku: "RAJ-ICU-8801",
    name: "RajBiosis-Vent Pro-X9 Turbine Mechanical Ventilator",
    category: "icu-critical-care",
    brand: "Raj Biosis OEM",
    price: 485000,
    mrp: 650000,
    rating: 4.9,
    reviewsCount: 42,
    stockStatus: "In Stock (Dispatch in 24h)",
    stockCount: 14,
    badge: "Bestseller",
    certifications: ["CE Certified", "US-FDA", "ISO 13485"],
    warranty: "2 Years Comprehensive + 3 Years AMC Support",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    shortDesc: "High-end turbine driven critical care ventilator for adult, pediatric, and neonatal non-invasive & invasive ventilation.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 485000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 445000 },
      { minQty: 6, maxQty: 20, pricePerUnit: 410000 }
    ],
    specs: {
      "Ventilation Modes": "VCV, PCV, SIMV-V, SIMV-P, CPAP/PSV, PRVC, Bi-Level, APRV, HFNC",
      "Tidal Volume Range": "20 ml to 2000 ml (Neonatal mode down to 2 ml)",
      "Display Screen": "15.6-inch Touch TFT Color Screen with 360° Alarm Light",
      "Battery Backup": "Integrated Li-ion battery with 4.5 hours continuous runtime",
      "Gas Supply": "Built-in ultra-quiet turbine (no central compressor required)",
      "O2 Therapy Range": "High Flow Oxygen Therapy (HFNC) up to 80 L/min"
    },
    features: [
      "Ultra-quiet high performance turbine generator with 30,000 hour MTBF",
      "Comprehensive lung mechanics monitoring (Auto-PEEP, P0.1, NIF, Compliance)",
      "Standard Ethernet, USB, HDMI & HL7 export for hospital HIS integration",
      "Detachable autoclavable exhalation valve for infection control"
    ]
  },
  {
    id: "prod-mon-12x",
    sku: "RAJ-ICU-604",
    name: "CardioPulse Multi-Para Patient Monitor 12.1\"",
    category: "icu-critical-care",
    brand: "Mindray",
    price: 68500,
    mrp: 92000,
    rating: 4.8,
    reviewsCount: 88,
    stockStatus: "In Stock (Dispatch in 24h)",
    stockCount: 35,
    badge: "NABH Standard",
    certifications: ["CE Certified", "ISO 13485", "CDSCO Registered"],
    warranty: "2 Years Replacement Warranty",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    shortDesc: "6-Parameter modular ICU vital signs monitor with 12.1\" anti-glare TFT display and arrhythmia analysis.",
    bulkPricing: [
      { minQty: 1, maxQty: 3, pricePerUnit: 68500 },
      { minQty: 4, maxQty: 9, pricePerUnit: 62000 },
      { minQty: 10, maxQty: 50, pricePerUnit: 57500 }
    ],
    specs: {
      "Standard Parameters": "ECG (3/5 Lead), SpO2 (Nellcor compatible), NIBP, Dual Temp, Respiration, Pulse Rate",
      "Optional Upgrades": "Dual IBP, Microstream EtCO2, Cardiac Output, Thermal Recorder",
      "Display": "12.1-inch color TFT LCD with up to 8 waveforms simultaneous display",
      "Alarm History": "168 hours trend review & 1000 NIBP measurement storage",
      "Power": "Dual AC & internal rechargeable lithium battery (4 hours)"
    },
    features: [
      "Waterproof IPX1 enclosure designed for sterile ICU / OT environment",
      "Pacemaker detection & 23-type arrhythmia and ST-segment analysis",
      "VGA/Ethernet port for Central Monitoring Station (CMS) network hookup"
    ]
  },
  {
    id: "prod-defi-360",
    sku: "RAJ-ICU-360B",
    name: "DefiQuick Biphasic Defibrillator with Monitor & Pacer",
    category: "icu-critical-care",
    brand: "Philips Healthcare",
    price: 195000,
    mrp: 245000,
    rating: 4.9,
    reviewsCount: 31,
    stockStatus: "In Stock (Dispatch in 48h)",
    stockCount: 12,
    badge: "Emergency Essential",
    certifications: ["US-FDA", "CE Certified", "ISO 13485"],
    warranty: "3 Years Manufacturer Warranty",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Manual, AED, and non-invasive transcutaneous pacing modes with fast 5-second 360 Joules shock delivery.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 195000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 182000 },
      { minQty: 6, maxQty: 15, pricePerUnit: 172000 }
    ],
    specs: {
      "Defibrillator Technology": "Biphasic Truncated Exponential (BTE) waveform up to 360J",
      "Operating Modes": "Manual Defibrillation, Synchronized Cardioversion, AED mode, Non-Invasive Pacer",
      "Charge Time": "Less than 5 seconds to 200 Joules, less than 8 seconds to 360 Joules",
      "Display Screen": "7-inch High Contrast Color TFT with ECG / SPO2 readout",
      "Paddles": "Multi-function external adult paddles with snap-on pediatric electrodes"
    },
    features: [
      "Built-in 50mm thermal strip recorder with auto-event printout",
      "Daily automated self-test with battery and capacitor health reporting",
      "Voice & visual prompts for AED resuscitation guidance"
    ]
  },
  {
    id: "prod-syr-pump",
    sku: "RAJ-ICU-SP20",
    name: "PrecisionFlow Dual Syringe Infusion Pump",
    category: "icu-critical-care",
    brand: "B. Braun",
    price: 34500,
    mrp: 46000,
    rating: 4.7,
    reviewsCount: 54,
    stockStatus: "In Stock",
    stockCount: 60,
    badge: "High Precision",
    certifications: ["CE Certified", "ISO 13485", "CDSCO Registered"],
    warranty: "2 Years Replacement Warranty",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Micro-infusion syringe driver supporting 5ml to 60ml all-brand syringes with anti-bolus detection.",
    bulkPricing: [
      { minQty: 1, maxQty: 4, pricePerUnit: 34500 },
      { minQty: 5, maxQty: 10, pricePerUnit: 31000 },
      { minQty: 11, maxQty: 50, pricePerUnit: 28500 }
    ],
    specs: {
      "Syringe Compatibility": "5ml, 10ml, 20ml, 30ml, 50/60ml automatic syringe size identification",
      "Flow Rate Range": "0.1 ml/h to 1500 ml/h with 0.01 ml/h micro-increments",
      "Accuracy": "±2% mechanical & volumetric precision",
      "Occlusion Levels": "12 levels dynamic pressure monitoring (Anti-bolus release system)",
      "Drug Library": "Customizable 200+ ICU drug database with dose limit safety"
    },
    features: [
      "Stackable modular design with central power rack compatibility",
      "Audible & visual multi-color alarm system",
      "Internal battery backup of over 6 hours continuous infusion"
    ]
  },
  {
    id: "prod-xray-dr",
    sku: "RAJ-RAD-500D",
    name: "RajScan Elite High-Frequency 500mA Digital X-Ray System",
    category: "radiology-imaging",
    brand: "Raj Biosis OEM",
    price: 1250000,
    mrp: 1680000,
    rating: 5.0,
    reviewsCount: 19,
    stockStatus: "Available on Order (5-7 Days)",
    stockCount: 6,
    badge: "AERB Approved",
    certifications: ["AERB Approved", "CE Certified", "ISO 13485", "US-FDA"],
    warranty: "3 Years Comprehensive + Full AERB Site Layout Clearance Assistance",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Complete digital radiography suite with 17x17 Wireless Cesium Iodide (CsI) Flat Panel Detector and 50KW generator.",
    bulkPricing: [
      { minQty: 1, maxQty: 1, pricePerUnit: 1250000 },
      { minQty: 2, maxQty: 3, pricePerUnit: 1180000 },
      { minQty: 4, maxQty: 10, pricePerUnit: 1120000 }
    ],
    specs: {
      "Generator Output": "50 kW High Frequency Inverter Generator (up to 500mA, 150kV)",
      "Digital Detector": "17\" x 17\" Wireless Cesium Iodide (CsI) Flat Panel Detector",
      "Pixel Pitch": "100 micron high resolution matrix (3072 x 3072 pixels)",
      "X-Ray Tube": "Rotating Anode Dual Focus X-Ray tube with thermal protection",
      "Table & Stand": "4-Way floating tabletop with heavy-duty Bucky mechanism and vertical chest stand"
    },
    features: [
      "AERB compliant radiation safety interlocks with dose area product (DAP) meter",
      "Medical DICOM 3.0 station with PACS, RIS, and cloud telemedicine export",
      "Includes engineer installation, turnkey lead-sheet layout consultation, and radiation survey test"
    ]
  },
  {
    id: "prod-ultra-4d",
    sku: "RAJ-RAD-4DU",
    name: "SonoVision Ultra-4D Color Doppler Ultrasound Scanner",
    category: "radiology-imaging",
    brand: "GE Healthcare",
    price: 890000,
    mrp: 1200000,
    rating: 4.9,
    reviewsCount: 28,
    stockStatus: "In Stock",
    stockCount: 8,
    badge: "Top Rated",
    certifications: ["CE Certified", "US-FDA", "ISO 13485"],
    warranty: "2 Years Warranty + 3 Probes Included (Convex, Linear, TVS)",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Full-body clinical diagnostic color doppler ultrasound with AI Auto-OB, elastography, and cardiac packages.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 890000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 830000 }
    ],
    specs: {
      "Display Screen": "21.5-inch Medical Grade High-Definition LED Monitor with Articulating Arm",
      "Touch Screen": "13.3-inch responsive anti-glare touch command panel",
      "Transducer Ports": "4 active probe connectors with electronic switching",
      "Imaging Modes": "B, 2B, 4B, M, Color Doppler (CFM), Power Doppler (PDI), Pulsed Wave (PW), Real-time 3D/4D",
      "Storage": "1TB SSD with DICOM 3.0 PACS connectivity and quick cloud backup"
    },
    features: [
      "Advanced speckle reduction & spatial compound imaging technology",
      "One-touch automated vascular flow calculation and OB/GYN biometry report",
      "Bundled with 3 Multi-Frequency Wideband Transducers"
    ]
  },
  {
    id: "prod-carm-hf",
    sku: "RAJ-RAD-CARM",
    name: "ApexMobile 9-Inch High Frequency Surgical C-Arm System",
    category: "radiology-imaging",
    brand: "Siemens Healthineers",
    price: 1540000,
    mrp: 1950000,
    rating: 4.9,
    reviewsCount: 15,
    stockStatus: "Available on Order (7-10 Days)",
    stockCount: 4,
    badge: "OT Ready",
    certifications: ["AERB Approved", "CE Certified", "ISO 13485"],
    warranty: "3 Years Comprehensive Warranty",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    shortDesc: "High-definition mobile fluoroscopy unit with 9-inch triple-field image intensifier for orthopedics and neuro-surgery.",
    bulkPricing: [
      { minQty: 1, maxQty: 1, pricePerUnit: 1540000 },
      { minQty: 2, maxQty: 3, pricePerUnit: 1460000 }
    ],
    specs: {
      "Generator": "3.5 kW High Frequency Pulsed Fluoroscopy Generator",
      "Image Intensifier": "9-inch triple-field high contrast Image Intensifier Tube",
      "Camera": "1K x 1K High Resolution CCD/CMOS medical camera with 16-bit image processing",
      "Monitor Cart": "Dual 19-inch high-resolution medical monochrome/color monitors",
      "C-Arm Movement": "Orbital rotation 130°, Panning ±12.5°, Horizontal travel 200mm"
    },
    features: [
      "Pulsed fluoroscopy modes with up to 70% patient and surgeon dose reduction",
      "Integrated laser centering device for accurate targeting without radiation",
      "Full digital memory with 100,000 image storage and USB/DICOM export"
    ]
  },
  {
    id: "prod-cautery-400",
    sku: "RAJ-SURG-ES400",
    name: "ElectroSurg Max 400W Vessel Sealer & Bipolar Cautery",
    category: "surgical-ot",
    brand: "Erbe Medical",
    price: 165000,
    mrp: 220000,
    rating: 4.8,
    reviewsCount: 39,
    stockStatus: "In Stock (Dispatch in 24h)",
    stockCount: 18,
    badge: "Surgical Grade",
    certifications: ["CE Certified", "ISO 13485", "CDSCO Registered"],
    warranty: "2 Years Replacement Warranty",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Microcontroller based 400W electrosurgical unit with auto vessel sealing up to 7mm and cut/coag modes.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 165000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 152000 },
      { minQty: 6, maxQty: 15, pricePerUnit: 142000 }
    ],
    specs: {
      "Max Power Output": "400 Watts Monopolar Cut, 120W Coagulation, 100W Bipolar, 150W Vessel Sealing",
      "Operating Frequency": "450 kHz to 500 kHz low-leakage RF output",
      "Vessel Sealing": "Real-time impedance sensing tissue response up to 7mm lumen vessels",
      "Safety Monitoring": "Patient Plate Return Electrode Monitoring (REM / CQM) circuit",
      "Programs": "99 user-programmable surgical specialty presets"
    },
    features: [
      "Independent activation of Monopolar 1, Monopolar 2 and Bipolar channels",
      "Includes reusable bipolar forceps, monopolar pencil with smoke evacuation adapter, and silicone patient plate",
      "Waterproof footswitch and emergency cutoff system"
    ]
  },
  {
    id: "prod-ot-light",
    sku: "RAJ-SURG-LED2",
    name: "LumiLux Duo Dual-Dome LED Shadowless OT Light",
    category: "surgical-ot",
    brand: "Raj Biosis OEM",
    price: 185000,
    mrp: 260000,
    rating: 4.9,
    reviewsCount: 46,
    stockStatus: "In Stock (Dispatch in 48h)",
    stockCount: 15,
    badge: "German LED Tech",
    certifications: ["CE Certified", "ISO 13485"],
    warranty: "3 Years Comprehensive Warranty (50,000 Hours LED Life)",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Ceiling-mounted dual dome shadowless surgical lighting with 160,000 + 120,000 Lux and endoscopic green light.",
    bulkPricing: [
      { minQty: 1, maxQty: 1, pricePerUnit: 185000 },
      { minQty: 2, maxQty: 4, pricePerUnit: 172000 },
      { minQty: 5, maxQty: 10, pricePerUnit: 160000 }
    ],
    specs: {
      "Illuminance": "Main Dome: 160,000 Lux | Satellite Dome: 120,000 Lux at 1 meter distance",
      "Color Temperature": "Adjustable from 3800K to 5000K in 5 stages",
      "Color Rendering Index (CRI)": "Ra ≥ 96, R9 ≥ 97 for vivid anatomical tissue distinction",
      "LED Service Life": "Over 50,000 hours with low thermal radiation (< 2°C temperature rise at surgeon head)",
      "Focus Field Diameter": "160mm to 300mm continuous motorized adjustment"
    },
    features: [
      "Autoclavable detachable central handle for sterile surgeon control",
      "Specialized green Endo-light mode for minimally invasive laparoscopic surgery",
      "Aerodynamic streamlined dome designed for laminar airflow OT ceilings"
    ]
  },
  {
    id: "prod-ot-table",
    sku: "RAJ-SURG-HYDT",
    name: "OmniFlex Electric-Hydraulic Universal Operating Table",
    category: "surgical-ot",
    brand: "Raj Biosis OEM",
    price: 245000,
    mrp: 340000,
    rating: 4.8,
    reviewsCount: 22,
    stockStatus: "In Stock",
    stockCount: 9,
    badge: "Heavy Duty 300kg",
    certifications: ["CE Certified", "ISO 13485"],
    warranty: "2 Years Warranty + Installation Support",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Electro-hydraulic surgical table with longitudinal sliding top for 100% C-arm fluoroscopy access.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 245000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 228000 }
    ],
    specs: {
      "Maximum Weight Capacity": "300 kg safe surgical workload",
      "Height Adjustment": "680mm to 980mm motorized smooth elevation",
      "Tabletop Slide": "320mm motorized longitudinal shift for full-body C-arm imaging",
      "Tilt Angles": "Trendelenburg: 25° | Reverse Trendelenburg: 25° | Lateral Tilt: ±20°",
      "Kidney Bridge Elevation": "120mm mechanical integrated elevator",
      "Material": "SS 304 Grade Stainless Steel column, base, and side rails with memory foam antistatic mattress"
    },
    features: [
      "Dual control interface: Handheld corded remote + auxiliary override panel on base column",
      "Emergency floor-lock release mechanism and built-in emergency backup battery"
    ]
  },
  {
    id: "prod-lap-4k",
    sku: "RAJ-SURG-LAP4K",
    name: "UltraLap 4K Ultra-HD Laparoscopy Surgical Tower System",
    category: "surgical-ot",
    brand: "Raj Biosis OEM",
    price: 980000,
    mrp: 1350000,
    rating: 4.9,
    reviewsCount: 17,
    stockStatus: "In Stock (Dispatch in 3-5 Days)",
    stockCount: 7,
    badge: "Flagship OT",
    certifications: ["CE Certified", "ISO 13485", "US-FDA"],
    warranty: "2 Years Full System Replacement Warranty",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Complete 4K UHD minimally invasive surgery suite: 4K Camera Console, 32\" Medical Monitor, 300W LED Light & 45L Insufflator.",
    bulkPricing: [
      { minQty: 1, maxQty: 1, pricePerUnit: 980000 },
      { minQty: 2, maxQty: 3, pricePerUnit: 920000 }
    ],
    specs: {
      "Camera Sensor": "Sony 1/1.8\" 4K CMOS sensor with 3840 x 2160 native resolution",
      "Medical Display": "32-inch 4K HDR Medical Monitor with optically bonded glass",
      "Light Source": "High efficiency 300W Medical LED (60,000 hours life, 5700K sunlight color temp)",
      "CO2 Insufflator": "45 Liters/min high flow insufflator with gas heating and smoke evacuation",
      "Rigid Laparoscope": "10mm 0° & 30° autoclavable sapphire tip endoscopes included"
    },
    features: [
      "One-touch real-time 4K video recording to external USB storage drive",
      "Digital blood vessel and tissue enhancement filter algorithm (WLI / FICE modes)",
      "Includes deluxe wheeled instrument trolley with isolation transformer"
    ]
  },
  {
    id: "prod-hema-5part",
    sku: "RAJ-LAB-H500",
    name: "CellQuant 5-Part Differential Auto Hematology Analyzer",
    category: "diagnostic-lab",
    brand: "Mindray",
    price: 360000,
    mrp: 490000,
    rating: 4.8,
    reviewsCount: 35,
    stockStatus: "In Stock (Dispatch in 24h)",
    stockCount: 16,
    badge: "High Throughput",
    certifications: ["CE Certified", "ISO 13485", "CDSCO Registered"],
    warranty: "2 Years Comprehensive + Reagent Starter Kit",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Automated 5-part differential blood cell counter processing 60 samples/hour with laser scatter and chemical dye method.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 360000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 335000 }
    ],
    specs: {
      "Throughput": "60 samples per hour in whole blood and pre-diluted modes",
      "Parameters": "28 reportable parameters including WBC, Neu#, Lym#, Mon#, Eos#, Bas#, plus 3 histograms & 1 3D scattergram",
      "Sample Volume": "Minimal aspiration volume: only 15 µL whole blood",
      "Screen": "10.4-inch color TFT touchscreen with intuitive GUI",
      "Data Storage": "Up to 50,000 patient test results with graphs"
    },
    features: [
      "Tri-angle laser scatter + chemical dye technology for precise eosinophil and basophil flagging",
      "Auto-cleaning of sample probe inside and outside prevents carry-over contamination",
      "Bi-directional LIS interface support via HL7 protocol"
    ]
  },
  {
    id: "prod-ecg-12ch",
    sku: "RAJ-LAB-ECG12",
    name: "CardioTrace 12-Channel Diagnostic Resting ECG Machine",
    category: "diagnostic-lab",
    brand: "Philips Healthcare",
    price: 52000,
    mrp: 72000,
    rating: 4.8,
    reviewsCount: 63,
    stockStatus: "In Stock",
    stockCount: 40,
    badge: "Clinic Favorite",
    certifications: ["CE Certified", "ISO 13485", "CDSCO Registered"],
    warranty: "2 Years Replacement Warranty",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    shortDesc: "12-lead simultaneous acquisition with Glasgow interpretation algorithm, 7\" touch display, and internal thermal printer.",
    bulkPricing: [
      { minQty: 1, maxQty: 3, pricePerUnit: 52000 },
      { minQty: 4, maxQty: 9, pricePerUnit: 47000 },
      { minQty: 10, maxQty: 30, pricePerUnit: 43500 }
    ],
    specs: {
      "Leads Acquisition": "12 leads simultaneous collection with 24-bit high dynamic A/D converter",
      "Interpretation": "Validated Glasgow Algorithm with pediatric and adult diagnostic interpretation",
      "Printer": "High resolution 216mm wide thermal array printer (A4 size roll/Z-fold)",
      "Connectivity": "USB, SD Card, Wi-Fi and LAN with PDF, XML, and DICOM format output",
      "Battery": "High capacity Li-ion battery providing over 300 ECG continuous recordings"
    },
    features: [
      "Pacemaker detection compliant with ANSI/AAMI EC11",
      "Alpha-numeric silicone keyboard for rapid patient demographic data entry",
      "Real-time ECG waveform preview before printing saves thermal paper"
    ]
  },
  {
    id: "prod-bio-chem",
    sku: "RAJ-LAB-BC300",
    name: "AutoChem 300 Fully Automated Clinical Biochemistry Analyzer",
    category: "diagnostic-lab",
    brand: "Raj Biosis OEM",
    price: 590000,
    mrp: 780000,
    rating: 4.9,
    reviewsCount: 19,
    stockStatus: "In Stock (Dispatch in 3 Days)",
    stockCount: 11,
    badge: "High Accuracy",
    certifications: ["CE Certified", "ISO 13485"],
    warranty: "2 Years Comprehensive Warranty + On-site Biochemist Setup",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Benchtop clinical chemistry system delivering 300 tests/hour constant throughput with refrigerated reagent carousel.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 590000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 550000 }
    ],
    specs: {
      "Constant Throughput": "300 photometric tests/hour (up to 450 tests/hour with optional ISE module)",
      "Reagent Positions": "60 refrigerated positions (2°C - 8°C) with 24-hour non-stop cooling",
      "Sample Positions": "71 positions for routine, stat, standard, and quality control tubes",
      "Reaction Cuvettes": "120 reusable optical plastic cuvettes with 8-step automatic washing station",
      "Wavelength Range": "Reversed optics grating with 12 wavelengths (340nm to 800nm)"
    },
    features: [
      "Liquid level detection, collision protection, and inventory checking probes",
      "Low water consumption (< 5 Liters per hour)",
      "Internal barcode reader for fast specimen and reagent tracking"
    ]
  },
  {
    id: "prod-icu-bed",
    sku: "RAJ-HOSP-BED5",
    name: "ComfortCare 5-Function Motorized Electric ICU Bed",
    category: "hospital-furniture",
    brand: "Raj Biosis OEM",
    price: 94000,
    mrp: 135000,
    rating: 4.9,
    reviewsCount: 78,
    stockStatus: "In Stock (Bulk Ready)",
    stockCount: 45,
    badge: "NABH Standard",
    certifications: ["CE Certified", "ISO 13485"],
    warranty: "3 Years Structural & Motor Warranty",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Heavy-duty 5-function ICU bed with Linak medical motors, central nurse control panel, CPR release and X-ray cassette holder.",
    bulkPricing: [
      { minQty: 1, maxQty: 4, pricePerUnit: 94000 },
      { minQty: 5, maxQty: 15, pricePerUnit: 84000 },
      { minQty: 16, maxQty: 100, pricePerUnit: 77000 }
    ],
    specs: {
      "Electric Actuators": "4 High-Grade Linak/T-Motion medical motors with backup battery",
      "Functions": "Backrest (0-75°), Knee-rest (0-45°), Height (450-800mm), Trendelenburg (16°), Reverse Trendelenburg (16°)",
      "Mattress Platform": "X-ray translucent perforated steel with dual-side CPR quick release lever",
      "Safe Working Load": "250 kg institutional heavy capacity",
      "Castors": "125mm Central Locking Castors with directional steering pedal"
    },
    features: [
      "Built-in angle indicators and Nurse Attendant lock-out panel at foot-board",
      "Includes 4-section waterproof antibacterial PU medical mattress and telescopic IV pole",
      "Tuck-away split ABS side rails with zero-transfer gap for patient safety"
    ]
  },
  {
    id: "prod-crash-cart",
    sku: "RAJ-HOSP-CC10",
    name: "RajEmergency Deluxe Hospital Emergency Crash Cart",
    category: "hospital-furniture",
    brand: "Raj Biosis OEM",
    price: 38000,
    mrp: 52000,
    rating: 4.8,
    reviewsCount: 52,
    stockStatus: "In Stock",
    stockCount: 30,
    badge: "Emergency Standard",
    certifications: ["ISO 13485", "CE Certified"],
    warranty: "2 Years Replacement Warranty",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Ergonomic 5-drawer ABS crash cart trolley with defibrillator shelf, oxygen cylinder cage, CPR board, and disposable seal locks.",
    bulkPricing: [
      { minQty: 1, maxQty: 3, pricePerUnit: 38000 },
      { minQty: 4, maxQty: 10, pricePerUnit: 34000 },
      { minQty: 11, maxQty: 40, pricePerUnit: 31000 }
    ],
    specs: {
      "Material": "High-strength ABS modular engineering plastic with aluminum alloy columns",
      "Drawers": "5 color-coded drawers with customizable modular internal dividers",
      "Accessories": "Swiveling Defibrillator Shelf, Stainless Steel IV Pole, Oxygen Cylinder Holder, Cardiac CPR Board",
      "Locking Mechanism": "Centralized breakaway seal lock mechanism with 50 numbered one-time security seals",
      "Wheels": "4 x 100mm ultra-silent medical castors with dual brakes"
    },
    features: [
      "Slide-out writing shelf on side for rapid nursing documentation",
      "Sharps disposal container bracket and power outlet strip with cord bracket included"
    ]
  },
  {
    id: "prod-autoclave-50",
    sku: "RAJ-STER-50L",
    name: "SteamSteril 50L Horizontal High-Pressure Class-B Autoclave",
    category: "sterilization-dental",
    brand: "Raj Biosis OEM",
    price: 118000,
    mrp: 165000,
    rating: 4.8,
    reviewsCount: 29,
    stockStatus: "In Stock",
    stockCount: 14,
    badge: "Class-B Pre-Vacuum",
    certifications: ["CE Certified", "ISO 13485"],
    warranty: "2 Years Warranty + Pressure Vessel Certificate",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Triple fractionated pre-vacuum sterilization unit with Bowie-Dick cycle, vacuum drying, and micro-printer.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 118000 },
      { minQty: 3, maxQty: 5, pricePerUnit: 108000 }
    ],
    specs: {
      "Chamber Capacity": "50 Liters (SUS 304 seamless robotic welded pressure chamber)",
      "Sterilization Temperature": "121°C & 134°C with adjustable exposure & vacuum dry times",
      "Vacuum System": "Triple fractionated pre-vacuum down to -0.85 bar",
      "Safety": "Dual electronic and mechanical door locks, safety overpressure relief valve",
      "Documentation": "Built-in micro thermal printer recording cycle pressure, temperature, time, and operator ID"
    },
    features: [
      "Suitable for hollow surgical instruments (Laparoscopy, Endoscopy, Dental handpieces) and porous linen packs",
      "Independent clean and wastewater double storage tanks prevent recontamination"
    ]
  },
  {
    id: "prod-laminar-flow",
    sku: "RAJ-STER-LAF4",
    name: "BioClean Air ISO-Class 5 Laminar Air Flow Clean Bench",
    category: "sterilization-dental",
    brand: "Raj Biosis OEM",
    price: 78000,
    mrp: 105000,
    rating: 4.7,
    reviewsCount: 21,
    stockStatus: "In Stock (Dispatch in 48h)",
    stockCount: 11,
    badge: "HEPA 99.99%",
    certifications: ["ISO 13485", "CE Certified"],
    warranty: "2 Years Warranty",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    shortDesc: "4-Feet Horizontal Laminar Flow Cabinet with 99.997% HEPA filter, UV sterilization, and digital airspeed controller.",
    bulkPricing: [
      { minQty: 1, maxQty: 2, pricePerUnit: 78000 },
      { minQty: 3, maxQty: 6, pricePerUnit: 71000 }
    ],
    specs: {
      "Cleanliness Class": "ISO 5 (Class 100) cleanroom standard",
      "Main Filter": "Mini-pleat HEPA filter with 99.997% efficiency at 0.3 µm particles",
      "Airflow Velocity": "0.30 m/s to 0.50 m/s continuous adjustable airflow speed",
      "Work Surface": "Grade 304 mirror finish stainless steel with spill-proof lip",
      "UV Lamp": "254nm germicidal UV decontamination lamp with programmable timer"
    },
    features: [
      "Front sliding counterbalanced toughened anti-UV glass sash",
      "Pre-filter washable non-woven fiber for extended HEPA lifetime",
      "Waterproof internal electrical sockets and gas tap cock"
    ]
  }
];
