// ============================================================================
// Biomedical Distributor Roles (Admin & Sales)
// ============================================================================

export const USER_ROLES = [
  {
    id: 'admin',
    name: 'Administrator (HQ)',
    shortTitle: 'Admin',
    badge: 'HQ Admin',
    color: 'purple',
    icon: 'ShieldCheck',
    avatarBg: 'bg-purple-100 text-purple-700 border-purple-200',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Central Administrator for Biomedical Distribution Network, Hospital Quotations, Product Catalog, and Sales Team.',
    defaultState: 'All India (HQ)',
    permissions: {
      leads: 'full',
      quotations: 'full',
      customers: 'full',
      products: 'full',
      website: 'full',
      vps: 'full',
      users: 'full'
    }
  },
  {
    id: 'sales',
    name: 'Biomedical Sales Representative',
    shortTitle: 'Sales',
    badge: 'Sales Team',
    color: 'sky',
    icon: 'UserCheck',
    avatarBg: 'bg-sky-100 text-sky-700 border-sky-200',
    tagColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Hospital & Clinic Field Sales Rep. Handles ICU equipment RFQs, commercial quotation PDFs, and doctor customer accounts in assigned state.',
    defaultState: 'Rajasthan',
    permissions: {
      leads: 'state',
      quotations: 'create',
      customers: 'manage',
      products: 'read',
      website: 'none',
      vps: 'none',
      users: 'none'
    }
  }
];

export function getRoleById(roleId) {
  if (!roleId) return USER_ROLES[0];
  const r = roleId.toLowerCase();
  if (r === 'admin' || r === 'super_admin') return USER_ROLES[0];
  if (r === 'sales' || r === 'sales_executive' || r === 'district_manager' || r === 'hospital_rep') return USER_ROLES[1];
  return USER_ROLES[0];
}

// Pre-seeded demo user credentials for instant testing
export const DEMO_USERS = [
  {
    id: 'usr_admin',
    fullName: 'Rajesh Sharma (Admin)',
    email: 'admin@rajbiosis.com',
    phone: '9876543210',
    password: 'admin@rajbiosis',
    role: 'admin',
    state: 'All India (HQ)',
    organization: 'Raj Biosis Biomedical Division',
    designation: 'Central Biomedical Administrator',
    avatar: '👑'
  },
  {
    id: 'usr_sales_rj',
    fullName: 'Vikram Rathore (Sales Rep)',
    email: 'sales.rj@rajbiosis.com',
    phone: '9829012345',
    password: 'sales@rajbiosis',
    role: 'sales',
    state: 'Rajasthan',
    organization: 'Raj Biosis Rajasthan Distribution',
    designation: 'State Sales Executive',
    avatar: '💼'
  },
  {
    id: 'usr_sales_br',
    fullName: 'Amit Kumar Verma (Sales Rep)',
    email: 'sales.br@rajbiosis.com',
    phone: '9431098765',
    password: 'sales@rajbiosis',
    role: 'sales',
    state: 'Bihar',
    organization: 'Raj Biosis Eastern Sales Division',
    designation: 'State Sales Executive',
    avatar: '💼'
  }
];
