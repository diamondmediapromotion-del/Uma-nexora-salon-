const fs = require('fs');
let code = fs.readFileSync('src/components/admin/SuperAdminDashboard.tsx', 'utf8');

const tabRegex = /\{ id: "district_expansion", label: "District Expansion", icon: MapPin \}/;
code = code.replace(
  tabRegex,
  '{ id: "district_expansion", label: "District Expansion", icon: MapPin },\n            { id: "ajmer_pilot", label: "Ajmer Pilot Execution", icon: Globe }'
);

fs.writeFileSync('src/components/admin/SuperAdminDashboard.tsx', code);
console.log('Patched array');
