const fs = require('fs');
let code = fs.readFileSync('src/components/admin/DistrictExpansion.tsx', 'utf8');
code = code.replace(
  /"overview" \| "launches" \| "areas" \| "readiness" \| "assignments" \| "reports" \| "incidents" \| "review"/,
  '"overview" | "launches" | "areas" | "readiness" | "assignments" | "reports" | "incidents" | "review" | "ajmer_pilot"'
);

const menuPattern = /{ id: "review", label: "Exit Review", icon: Sliders }/;
code = code.replace(menuPattern, '{ id: "review", label: "Exit Review", icon: Sliders },\n          { id: "ajmer_pilot", label: "Ajmer Pilot Execution", icon: Play }');

fs.writeFileSync('src/components/admin/DistrictExpansion.tsx', code);
console.log('Patched');
