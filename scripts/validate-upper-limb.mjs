import fs from 'node:fs';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const lower=s=>s.toLowerCase();
const skeletal=atlas.parts.filter(p=>p.system==='skeletal');
const exact=name=>skeletal.filter(p=>lower(p.name)===lower(name));
const required=['clavicle','scapula','humerus','radius','ulna'];
let failed=false;
for(const side of ['Left','Right']){
 for(const bone of required){
  const name=`${side} ${bone}`,matches=exact(name);
  console.log(`${name}: ${matches.length}`);
  if(matches.length!==1){console.error(`Expected exactly one skeletal "${name}", found ${matches.length}`);failed=true;}
 }
}
const handPatterns=/metacarpal bone|phalanx .* (finger|thumb)|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/;
for(const side of ['left','right']){
 const hand=skeletal.filter(p=>lower(p.name).includes(side)&&handPatterns.test(lower(p.name)));
 console.log(`${side} hand bones: ${hand.length}`);
 if(!hand.length){console.error(`No skeletal ${side} hand bones matched.`);failed=true;}
}
const contamination=required.flatMap(term=>atlas.parts.filter(p=>lower(p.name).includes(term)&&p.system!=='skeletal').map(p=>p.name));
console.log(`Non-skeletal substring matches deliberately excluded: ${contamination.length}`);
// Guard against regressions where fuzzy matching accidentally captures vessels or muscles.
if(!contamination.length){console.warn('No non-skeletal substring collisions found; catalogue may have changed.');}
if(failed)process.exitCode=1;
