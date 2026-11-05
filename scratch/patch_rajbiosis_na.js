const fs = require('fs');
const path = require('path');

const rajbiosisDir = path.resolve(process.cwd(), '../../rajbiosis.com');

// 1. ProductEnquiryModal.jsx
const pemPath = path.join(rajbiosisDir, 'src', 'components', 'ProductEnquiryModal.jsx');
if (fs.existsSync(pemPath)) {
  let c = fs.readFileSync(pemPath, 'utf8');
  c = c.replace(/cleanHospital \|\| ''/g, "cleanHospital || 'NA'");
  c = c.replace(/updatedProfile\.hospitalName \|\| ''/g, "updatedProfile.hospitalName || 'NA'");
  c = c.replace(/'Medical Client'/g, "'NA'");
  fs.writeFileSync(pemPath, c, 'utf8');
  console.log('Updated ProductEnquiryModal.jsx');
}

// 2. CartDrawer.jsx
const cdPath = path.join(rajbiosisDir, 'src', 'components', 'CartDrawer.jsx');
if (fs.existsSync(cdPath)) {
  let c = fs.readFileSync(cdPath, 'utf8');
  c = c.replace(/prof\.hospitalName \|\| ''/g, "prof.hospitalName || 'NA'");
  c = c.replace(/'Hospital Procurement Officer'/g, "'NA'");
  c = c.replace(/'Medical Client'/g, "'NA'");
  fs.writeFileSync(cdPath, c, 'utf8');
  console.log('Updated CartDrawer.jsx');
}

// 3. cart-wishlist/route.js
const cwPath = path.join(rajbiosisDir, 'src', 'app', 'api', 'cart-wishlist', 'route.js');
if (fs.existsSync(cwPath)) {
  let c = fs.readFileSync(cwPath, 'utf8');
  c = c.replace(/rec\.hospitalName \|\| ''/g, "rec.hospitalName || 'NA'");
  c = c.replace(/'Verified Medical Client'/g, "'NA'");
  c = c.replace(/'Medical Client'/g, "'NA'");
  fs.writeFileSync(cwPath, c, 'utf8');
  console.log('Updated cart-wishlist/route.js');
}

// 4. enquiry/route.js
const enqPath = path.join(rajbiosisDir, 'src', 'app', 'api', 'enquiry', 'route.js');
if (fs.existsSync(enqPath)) {
  let c = fs.readFileSync(enqPath, 'utf8');
  c = c.replace(/hospital: hosp \|\| ''/g, "hospital: hosp || 'NA'");
  c = c.replace(/'Medical Client'/g, "'NA'");
  fs.writeFileSync(enqPath, c, 'utf8');
  console.log('Updated enquiry/route.js');
}

