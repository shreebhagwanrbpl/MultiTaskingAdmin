const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Admin\\Documents\\GitHub\\rajbiosis.com\\src\\components\\ProductEnquiryModal.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Tag to imports from lucide-react
if (!content.includes('Tag,')) {
  content = content.replace(
    "  PhoneCall\n} from 'lucide-react';",
    "  PhoneCall,\n  Tag\n} from 'lucide-react';"
  ).replace(
    "  PhoneCall\r\n} from 'lucide-react';",
    "  PhoneCall,\r\n  Tag\r\n} from 'lucide-react';"
  );
  console.log('1. Added Tag to imports');
}

// 2. Add expectedPrice state
const oldStateTarget = `  const [district, setDistrict] = useState('Jaipur');
  const [address, setAddress] = useState('');`;
const newStateCode = `  const [district, setDistrict] = useState('Jaipur');
  const [address, setAddress] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');`;

if (!content.includes('const [expectedPrice, setExpectedPrice]')) {
  content = content.replace(oldStateTarget, newStateCode)
    .replace(oldStateTarget.replace(/\n/g, '\r\n'), newStateCode.replace(/\n/g, '\r\n'));
  console.log('2. Added expectedPrice state');
}

// 3. Handle suppressLeadSync in handleOpenEnquiry
const oldHandleOpenPattern = /const handleOpenEnquiry = \(event\) => \{\s*const prod = event\.detail;\s*if \(prod\) \{\s*setProduct\(prod\);/;
const newHandleOpenCode = `const handleOpenEnquiry = (event) => {
      const prod = event.detail;
      if (prod) {
        setProduct(prod);

        // If returning from profile completion, only display success dialog without generating duplicate lead!
        if (prod.initialStep === 'success' || prod.suppressLeadSync) {
          setStep('success');
          setIsOpen(true);
          return;
        }

        if (prod.price) {
          setExpectedPrice(prod.expectedPrice ? String(prod.expectedPrice) : '');
        }`;

if (oldHandleOpenPattern.test(content)) {
  content = content.replace(oldHandleOpenPattern, newHandleOpenCode);
  console.log('3. Updated handleOpenEnquiry');
}

// 4. Validate negotiable price in validateForm
const oldValidatePattern = /if \(!phone \|\| !phone\.trim\(\)\) \{\s*return 'Mobile number is required for quote verification';\s*\}/;
const newValidateCode = `if (product?.isNegotiable) {
      const numExpected = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
      if (!numExpected || numExpected <= 0) {
        return 'Yeh product Negotiable hai! Kripya submit karne se pehle apna Target / Expected Offer Price (₹) daalein.';
      }
    }

    if (!phone || !phone.trim()) {
      return 'Mobile number is required for quote verification';
    }`;

if (oldValidatePattern.test(content) && !content.includes('Yeh product Negotiable hai!')) {
  content = content.replace(oldValidatePattern, newValidateCode);
  console.log('4. Added negotiable price validation to validateForm');
}

// 5. Save expectedPrice and isPriceNegotiated in handleVerifyOtpAndSubmit
const oldVerifyEnquiryPattern = /const enquiryData = \{\s*\.\.\.\(existingEnq \|\| \{\}\),\s*id: activeId,[\s\S]*?unitPrice: unitPrice,\s*totalAmount: unitPrice,/;
const newVerifyEnquiryCode = `const parsedOffer = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
    const isPriceNegotiated = Boolean(product?.isNegotiable && parsedOffer && parsedOffer < unitPrice);

    const enquiryData = {
      ...(existingEnq || {}),
      id: activeId,
      quoteNumber: quoteNumber,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      productCategory: product?.category,
      productBrand: product?.brand || 'Raj Biosis OEM',
      productImage: product?.image,
      quantity: 1,
      unitPrice: isPriceNegotiated ? parsedOffer : unitPrice,
      actualPrice: unitPrice,
      expectedPrice: parsedOffer || null,
      isNegotiable: Boolean(product?.isNegotiable),
      isPriceNegotiated: isPriceNegotiated,
      negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
      approvedPrice: isPriceNegotiated ? null : unitPrice,
      totalAmount: (isPriceNegotiated ? parsedOffer : unitPrice),`;

if (oldVerifyEnquiryPattern.test(content)) {
  content = content.replace(oldVerifyEnquiryPattern, newVerifyEnquiryCode);
  console.log('5. Added negotiable fields to enquiryData');
}

// 6. Pass negotiable fields in recordCustomerLead
const oldRecordCustomerPattern = /recordCustomerLead\(\{\s*\.\.\.enquiryData,\s*customerName: updatedProfile\.fullName,[\s\S]*?isNegotiable: Boolean\(product\.isNegotiable\)\s*\}\);/;
const newRecordCustomerCode = `recordCustomerLead({
        ...enquiryData,
        customerName: updatedProfile.fullName,
        hospitalName: updatedProfile.hospitalName || \`\${district.trim()} Healthcare Institution\`,
        customerPhone: enquiryData.customerPhone,
        customerEmail: enquiryData.customerEmail,
        district: district.trim(),
        productName: product.name,
        productSku: product.sku,
        qty: 1,
        unitPrice: isPriceNegotiated ? parsedOffer : product.price,
        actualPrice: product.price,
        expectedPrice: parsedOffer || null,
        isNegotiable: Boolean(product.isNegotiable),
        isPriceNegotiated: isPriceNegotiated,
        negotiationStatus: isPriceNegotiated ? 'pending_approval' : 'none',
        gstRate: gstRate,
        gstAmount: gstAmount
      });`;

if (oldRecordCustomerPattern.test(content)) {
  content = content.replace(oldRecordCustomerPattern, newRecordCustomerCode);
  console.log('6. Updated recordCustomerLead with negotiable fields');
}

// 7. Insert Negotiable Price Input Field in Step 1 Form JSX right above District or Submit button
const districtSelectorTarget = `<div>
                          <DistrictSelector
                            value={district}
                            onChange={setDistrict}
                            required={true}
                            label="Delivery District"
                          />
                        </div>`;

const negotiableSectionHtml = `<div>
                          <DistrictSelector
                            value={district}
                            onChange={setDistrict}
                            required={true}
                            label="Delivery District"
                          />
                        </div>

                        {/* Price Negotiation Section (Mandatory if Product is Negotiable) */}
                        {product?.isNegotiable && (
                          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl space-y-2 animate-fade-in shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                <Tag size={13} className="text-amber-600" />
                                <span>Price Negotiable Equipment &bull; Target Offer</span>
                              </span>
                              {expectedPrice && parseFloat(expectedPrice) < (product.price || 0) && (
                                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-mono">
                                  -{Math.round((((product.price || 0) - parseFloat(expectedPrice)) / (product.price || 1)) * 100)}% B2B Offer
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                              <span>Official GeM / Catalog MRP:</span>
                              <span className="font-mono font-bold text-slate-800 line-through">
                                ₹{(product.mrp || product.price || 485000).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                Your Target / Negotiable Offer Price (₹ per unit) <span className="text-red-600 font-bold">* Mandatory</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  required
                                  value={expectedPrice}
                                  onChange={(e) => setExpectedPrice(e.target.value)}
                                  placeholder={\`Enter your target price (e.g. \${Math.round((product.price || 485000) * 0.85)})\`}
                                  className="w-full pl-7 pr-3 py-2 bg-white text-slate-900 text-xs sm:text-sm font-bold border-2 border-amber-400 focus:border-red-500 rounded-xl outline-none"
                                />
                              </div>
                              <span className="text-[10px] text-amber-800 mt-1 block font-medium">
                                ⚡ Submit se pehle target price daalna zaroori hai. Company Admin is rate ko review karke quotation approve karenge.
                              </span>
                            </div>
                          </div>
                        )}`;

if (content.includes(districtSelectorTarget) && !content.includes('Price Negotiable Equipment &bull; Target Offer')) {
  content = content.replace(districtSelectorTarget, negotiableSectionHtml);
  console.log('7. Inserted Negotiable Price input field in Step 1 Form JSX');
} else {
  // Try CRLF
  const districtSelectorTargetCRLF = districtSelectorTarget.replace(/\n/g, '\r\n');
  if (content.includes(districtSelectorTargetCRLF) && !content.includes('Price Negotiable Equipment &bull; Target Offer')) {
    content = content.replace(districtSelectorTargetCRLF, negotiableSectionHtml.replace(/\n/g, '\r\n'));
    console.log('7. Inserted Negotiable Price input field in Step 1 Form JSX (CRLF)');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ProductEnquiryModal.jsx in rajbiosis.com');

