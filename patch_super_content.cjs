const fs = require('fs');
let code = fs.readFileSync('src/components/admin/SuperAdminDashboard.tsx', 'utf8');

const contentRegex = /        \{activeTab === "district_expansion" && \(\n            <DistrictExpansion \/>\n        \)\}/;
code = code.replace(
  contentRegex,
  `        {activeTab === "district_expansion" && (
            <DistrictExpansion />
        )}
        {activeTab === "ajmer_pilot" && (
            <AjmerPilotExecution />
        )}`
);

fs.writeFileSync('src/components/admin/SuperAdminDashboard.tsx', code);
console.log('Patched content');
