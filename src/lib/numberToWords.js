/**
 * Converts a numeric amount into Indian English Words
 * Example: 150000 => "One lakh fifty thousand"
 * Example: 485000 => "Four lakh eighty five thousand"
 */
export function numberToWordsIndian(num) {
  if (num === 0) return 'Zero';
  if (!num || isNaN(num)) return '';

  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const b = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
  ];

  function convertTwoDigits(n) {
    if (n === 0) return '';
    if (n < 20) return a[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return b[tens] + (ones ? ' ' + a[ones] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred) str += a[hundred] + ' hundred';
    if (hundred && rest) str += ' and ';
    if (rest) str += convertTwoDigits(rest);
    return str;
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let n = integerPart;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remaining = n;

  const parts = [];
  if (crore) parts.push(convertThreeDigits(crore) + ' crore');
  if (lakh) parts.push(convertTwoDigits(lakh) + ' lakh');
  if (thousand) parts.push(convertTwoDigits(thousand) + ' thousand');
  if (remaining) parts.push(convertThreeDigits(remaining));

  let words = parts.filter(Boolean).join(' ');
  if (decimalPart > 0) {
    words += ' and ' + convertTwoDigits(decimalPart) + ' paise';
  }

  if (!words) return 'Zero';

  // Capitalize first letter of whole sentence: "One lakh fifty thousand"
  return words.charAt(0).toUpperCase() + words.slice(1);
}
