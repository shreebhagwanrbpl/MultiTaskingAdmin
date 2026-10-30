const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '..', 'src', 'app', 'page.jsx');
let content = fs.readFileSync(pageFile, 'utf-8');

// 1. Ensure ALL_INDIAN_STATES is imported
if (!content.includes('ALL_INDIAN_STATES')) {
  content = content.replace(
    'import { POPULAR_DISTRICT_HUBS } from \'../data/indianDistricts\';',
    'import { ALL_INDIAN_STATES, POPULAR_DISTRICT_HUBS } from \'../data/indianDistricts\';'
  );
}

// 2. Remove misplaced UserRoleManager from inside <h1>
const badInsideH1 = `              {/* =========================================================================
              TAB: TEAM ROLES & DISTRICT ALLOCATION (RBAC)
              ========================================================================= */}
          {activeTab === 'users' && (
            <UserRoleManager />
          )}`;

const badInsideH1CRLF = badInsideH1.replace(/\n/g, '\r\n');

if (content.includes(badInsideH1)) {
  content = content.replace(badInsideH1, '');
} else if (content.includes(badInsideH1CRLF)) {
  content = content.replace(badInsideH1CRLF, '');
}

// 3. Ensure UserRoleManager is rendered in main workspace area before customers tab
const customerTabMarker = `{activeTab === 'customers' && (\n            <CustomerProfilesManager`;
const customerTabMarkerCRLF = `{activeTab === 'customers' && (\r\n            <CustomerProfilesManager`;

const userTabSection = `{/* =========================================================================
              TAB: TEAM & SALES TERRITORY ROLES (RBAC)
              ========================================================================= */}
          {activeTab === 'users' && (
            <UserRoleManager />
          )}

          `;

if (!content.includes('<UserRoleManager />')) {
  if (content.includes(customerTabMarker)) {
    content = content.replace(customerTabMarker, userTabSection + customerTabMarker);
  } else if (content.includes(customerTabMarkerCRLF)) {
    content = content.replace(customerTabMarkerCRLF, userTabSection.replace(/\n/g, '\r\n') + customerTabMarkerCRLF);
  }
}

// 4. Update Header Title for users tab
content = content.replace(
  'Team Roles & District Territory Management (RBAC)',
  'Biomedical Team & Sales Territory Roles'
);

// 5. Update header territory dropdown to use States
const oldTerritoryDropdown = `<div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-xl shadow-2xs">
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
            </div>`;

const newTerritoryDropdown = `<div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-xl shadow-2xs">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500">State:</span>
              <select
                value={activeDistrictFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All India (National HQ)</option>
                {user?.state && user.state !== 'All India (HQ)' && user.state !== 'All India (Pan-India HQ)' && (
                  <option value={user.state}>⭐ My State ({user.state})</option>
                )}
                <option disabled>──────────</option>
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>`;

if (content.includes(oldTerritoryDropdown)) {
  content = content.replace(oldTerritoryDropdown, newTerritoryDropdown);
} else {
  content = content.replace(oldTerritoryDropdown.replace(/\n/g, '\r\n'), newTerritoryDropdown.replace(/\n/g, '\r\n'));
}

// 6. Update user menu "Assigned District" to "Assigned State"
content = content.replace(/Assigned District:/g, 'Assigned State:');
content = content.replace(/{user\?\.district}/g, '{user?.state || user?.district || "Rajasthan"}');
content = content.replace(/{user\.district}/g, '{user.state || user.district || "Rajasthan"}');

// 7. Update filteredLeads to check state
content = content.replace(
  `const d = activeDistrictFilter.toLowerCase();
        const loc = \`\${l.district || ''} \${l.city || ''} \${l.hospital || ''} \${l.address || ''}\`.toLowerCase();
        if (!loc.includes(d)) return false;`,
  `const st = activeDistrictFilter.toLowerCase();
        const loc = \`\${l.state || ''} \${l.district || ''} \${l.city || ''} \${l.hospital || ''} \${l.address || ''}\`.toLowerCase();
        if (!loc.includes(st)) return false;`
);

fs.writeFileSync(pageFile, content, 'utf-8');
console.log('Successfully updated src/app/page.jsx for State-only & 2 roles!');

