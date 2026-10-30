const fs = require('fs');
const filePath = 'C:\\Users\\Admin\\Documents\\GitHub\\rajbiosis.com\\src\\app\\product\\[id]\\ProductDetailClient.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = /detail:\s*\{\s*\.\.\.product,\s*initialStep:\s*'success'\s*\}/;
const replacement = `detail: { ...product, initialStep: 'success', suppressLeadSync: true }`;

if (target.test(content)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added suppressLeadSync to ProductDetailClient.jsx');
} else {
  console.log('Already patched or not found');
}

