const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '..', 'src', 'app', 'page.jsx');
let content = fs.readFileSync(pageFile, 'utf-8');

// 1. Add lucide icons
if (!content.includes('LogOut,')) {
  content = content.replace(
    'MessageCircle\n} from \'lucide-react\';',
    'MessageCircle,\n  LogOut,\n  MapPin,\n  UserCheck\n} from \'lucide-react\';'
  ).replace(
    'MessageCircle\r\n} from \'lucide-react\';',
    'MessageCircle,\r\n  LogOut,\r\n  MapPin,\r\n  UserCheck\r\n} from \'lucide-react\';'
  );
}

// 2. Add component imports
if (!content.includes('UserRoleManager')) {
  content = content.replace(
    'import CustomerProfilesManager from \'./components/CustomerProfilesManager\';',
    `import CustomerProfilesManager from './components/CustomerProfilesManager';
import UserRoleManager from './components/UserRoleManager';
import AuthScreen from './components/AuthScreen';
import { useAuth } from '../lib/AuthContext';
import { POPULAR_DISTRICT_HUBS } from '../data/indianDistricts';`
  );
}

// 3. Tab array inclusion for 'users'
content = content.replace(
  /'marketing'\]\.includes\(searchParams\.tab\)/g,
  `'marketing', 'users'].includes(searchParams.tab)`
);
content = content.replace(
  /'marketing'\]\.includes\(chosen\)/g,
  `'marketing', 'users'].includes(chosen)`
);
content = content.replace(
  /'marketing'\]\.includes\(urlTab\)/g,
  `'marketing', 'users'].includes(urlTab)`
);

// 4. In AdminDashboardPage, inject useAuth hook
if (!content.includes('const { user, loading: authLoading')) {
  content = content.replace(
    'const [leadFilterDomain, setLeadFilterDomain] = useState(\'all\');',
    `const [leadFilterDomain, setLeadFilterDomain] = useState('all');
  const {
    user,
    loading: authLoading,
    logout,
    activeDistrictFilter,
    setDistrictFilter,
    isSuperAdmin,
    isDistrictManager,
    isSalesExecutive,
    isHospitalRep,
    canAccessTab
  } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);`
  );
}

// 5. In filteredLeads, filter by activeDistrictFilter
const oldFilteredLeads = `  const filteredLeads = [...leads]
    .filter(l => {
      if (leadFilterDomain !== 'all') {
        return l.siteDomain === leadFilterDomain;
      }
      return true;
    })`;

const newFilteredLeads = `  const filteredLeads = [...leads]
    .filter(l => {
      if (leadFilterDomain !== 'all' && l.siteDomain !== leadFilterDomain) {
        return false;
      }
      if (activeDistrictFilter && activeDistrictFilter !== 'all' && activeDistrictFilter !== 'All Districts / Pan-India HQ') {
        const d = activeDistrictFilter.toLowerCase();
        const loc = \`\${l.district || ''} \${l.city || ''} \${l.hospital || ''} \${l.address || ''}\`.toLowerCase();
        if (!loc.includes(d)) return false;
      }
      return true;
    })`;

if (content.includes(oldFilteredLeads)) {
  content = content.replace(oldFilteredLeads, newFilteredLeads);
} else {
  // Try CRLF variant
  const oldFilteredLeadsCRLF = oldFilteredLeads.replace(/\n/g, '\r\n');
  const newFilteredLeadsCRLF = newFilteredLeads.replace(/\n/g, '\r\n');
  content = content.replace(oldFilteredLeadsCRLF, newFilteredLeadsCRLF);
}

// 6. Before return in AdminDashboardPage, check authLoading & !user
const returnMarker = '  return (\n    <div className="flex h-screen overflow-hidden';
const returnMarkerCRLF = '  return (\r\n    <div className="flex h-screen overflow-hidden';

const authCheckCode = `  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">Authenticating Raj Biosis Portal...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen initialMode="login" redirectTo="/" />;
  }

`;

if (!content.includes('if (authLoading) {')) {
  if (content.includes(returnMarker)) {
    content = content.replace(returnMarker, authCheckCode + returnMarker);
  } else if (content.includes(returnMarkerCRLF)) {
    content = content.replace(returnMarkerCRLF, authCheckCode.replace(/\n/g, '\r\n') + returnMarkerCRLF);
  }
}

// 7. Add Team & Roles button in sidebar
const vpsNavButton = `<button
              onClick={() => setActiveTab('vps')}`;

const teamRolesNav = `            {/* Team Roles & District Allocation (RBAC) */}
            <button
              onClick={() => setActiveTab('users')}
              title="Team Roles & District Territory Allocation (RBAC)"
              className={\`w-full flex items-center \${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl transition cursor-pointer relative group \${activeTab === 'users'
                ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200/80 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }\`}
            >
              <span className={\`flex items-center \${isSidebarCollapsed ? 'justify-center' : 'gap-2.5'}\`}>
                <ShieldCheck size={isSidebarCollapsed ? 19 : 16} className={activeTab === 'users' ? 'text-purple-600' : 'text-slate-400'} />
                {!isSidebarCollapsed && <span>Team & Roles</span>}
              </span>
              {!isSidebarCollapsed && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                  RBAC
                </span>
              )}
            </button>

            `;

if (!content.includes(`setActiveTab('users')`)) {
  content = content.replace(vpsNavButton, teamRolesNav + vpsNavButton);
}

// 8. Add User Profile Card in bottom of sidebar
const bottomUserMarker = `<div className={\`p-3 border-t border-slate-100 \${isSidebarCollapsed ? 'flex flex-col items-center space-y-2' : 'space-y-3'}\`}>`;
const userProfileSidebarCard = `        {/* Active User Session Pill in Sidebar */}
        {user && (
          <div className="p-2.5 mx-2.5 mb-2 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
            <div className={\`flex items-center \${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2\`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs shrink-0">
                  {user.avatar || '👑'}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-sky-600 font-semibold truncate flex items-center gap-1">
                      <span>{user.roleBadge || user.role}</span>
                      <span>•</span>
                      <span className="text-slate-500 flex items-center gap-0.5"><MapPin size={9} />{user.district}</span>
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out of Portal"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          </div>
        )}

`;

if (!content.includes('Active User Session Pill in Sidebar')) {
  content = content.replace(bottomUserMarker, userProfileSidebarCard + bottomUserMarker);
}

// 9. Add Header Title for users tab
const headerTitleMarker = `{activeTab === 'leads' && (`;
const usersHeaderTitle = `{activeTab === 'users' && (
                <>
                  <span>Team Roles & District Territory Management (RBAC)</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    Active Directory
                  </span>
                </>
              )}
              `;

if (!content.includes(`activeTab === 'users' && (`)) {
  content = content.replace(headerTitleMarker, usersHeaderTitle + headerTitleMarker);
}

// 10. Add District Filter and User Menu to Top Header Right
const hostPillMarker = `<div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              Host: <span className="text-slate-700 font-semibold">rajbiosis.com</span>
            </div>`;
const hostPillMarkerCRLF = hostPillMarker.replace(/\n/g, '\r\n');

const headerControls = `{/* Global District & Territory Filter Selector */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-xl shadow-2xs">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500">Territory:</span>
              <select
                value={activeDistrictFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Pan-India (All Districts)</option>
                {user?.district && user.district !== 'All Districts / Pan-India HQ' && (
                  <option value={user.district}>⭐ My District ({user.district})</option>
                )}
                <option disabled>──────────</option>
                {POPULAR_DISTRICT_HUBS.map((hub) => (
                  <option key={hub.district} value={hub.district}>
                    {hub.district} ({hub.state})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition cursor-pointer shadow-2xs"
              >
                <span className="text-base w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {user?.avatar || '👑'}
                </span>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold leading-none truncate">
                    {user?.roleBadge || user?.role || 'Staff'}
                  </div>
                </div>
                <ChevronRight size={12} className={\`text-slate-400 transition-transform \${showUserDropdown ? 'rotate-90' : ''}\`} />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                    <span className="text-2xl p-1 bg-slate-100 rounded-2xl">{user?.avatar || '👑'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{user?.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        <ShieldCheck size={11} /> {user?.roleBadge || user?.role}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Assigned District:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin size={11} className="text-rose-500" /> {user?.district}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mobile:</span>
                      <span className="font-semibold text-slate-700">+91 {user?.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Organization:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{user?.organization}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('users');
                      }}
                      className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                    >
                      Manage Team Roles
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            `;

if (!content.includes('Global District & Territory Filter Selector')) {
  if (content.includes(hostPillMarker)) {
    content = content.replace(hostPillMarker, headerControls + hostPillMarker);
  } else if (content.includes(hostPillMarkerCRLF)) {
    content = content.replace(hostPillMarkerCRLF, headerControls.replace(/\n/g, '\r\n') + hostPillMarkerCRLF);
  }
}

// 11. Add UserRoleManager tab content rendering
const tabContentMarker = `{activeTab === 'customers' && (`;
const usersTabContent = `{/* =========================================================================
              TAB: TEAM ROLES & DISTRICT ALLOCATION (RBAC)
              ========================================================================= */}
          {activeTab === 'users' && (
            <UserRoleManager />
          )}

          `;

if (!content.includes('<UserRoleManager />')) {
  content = content.replace(tabContentMarker, usersTabContent + tabContentMarker);
}

fs.writeFileSync(pageFile, content, 'utf-8');
console.log('Successfully patched src/app/page.jsx!');

