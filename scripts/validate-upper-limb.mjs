import fs from 'node:fs';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const terms=['clavicle','scapula','humerus','radius','ulna','carpal','metacarp','phalan'];
const rows=terms.map(term=>({term,matches:atlas.parts.filter(p=>p.name.toLowerCase().includes(term)).map(p=>p.name)}));
for(const row of rows){console.log('\n'+row.term+': '+row.matches.length);console.log(row.matches.slice(0,30).join('\n'));}
const missing=rows.filter(r=>!r.matches.length);
if(missing.length){console.error('Missing required catalogue groups: '+missing.map(x=>x.term).join(', '));process.exitCode=1;}
