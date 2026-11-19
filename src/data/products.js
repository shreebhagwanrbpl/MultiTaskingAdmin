import productsData from './products.json';

export const PRODUCTS = Array.isArray(productsData) ? productsData : [];
export default PRODUCTS;
