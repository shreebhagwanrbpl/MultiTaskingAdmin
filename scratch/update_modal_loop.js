const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

const startMarker = '{pendingWebLeads.length === 0 ? (';
const endMarker = '{/* Modal Footer */}';

const startIndex = norm.indexOf(startMarker);
const endIndex = norm.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // Find the 'pendingWebLeads.map' inside this block
  const modalBlock = norm.substring(startIndex, endIndex);
  const mapIdx = modalBlock.indexOf('pendingWebLeads.map((lead, idx) => {');
  if (mapIdx !== -1) {
    const beforeMap = modalBlock.substring(0, mapIdx);
    const replacement = `${beforeMap}pendingWebLeads.map((lead, idx) => (
                  <LeadInquiryCard
                    key={lead.id || lead._id || idx}
                    lead={lead}
                    idx={idx}
                    isAdmin={isAdmin}
                    getMatchedCustomer={getMatchedCustomer}
                    cleanLeadHospital={cleanLeadHospital}
                    getLeadProducts={getLeadProducts}
                    isLeadNegotiablePending={isLeadNegotiablePending}
                    handleRequestAdminApproval={(l) => {
                      setIsLeadsModalOpen(false);
                      handleRequestAdminApproval(l);
                    }}
                    openNegotiationModal={(l) => {
                      setIsLeadsModalOpen(false);
                      openNegotiationModal(l);
                    }}
                    handleMakeQuotationFromLead={(l) => {
                      setIsLeadsModalOpen(false);
                      handleMakeQuotationFromLead(l);
                    }}
                    handleDeleteWebLead={handleDeleteWebLead}
                  />
                ))
              )}
            </div>

            `;
    norm = norm.substring(0, startIndex) + replacement + norm.substring(endIndex);
    console.log('Successfully updated modal loop with LeadInquiryCard');
    const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
    fs.writeFileSync(filePath, result, 'utf8');
  } else {
    console.log('Could not find map inside modal block');
  }
} else {
  console.log('Markers not found');
}

