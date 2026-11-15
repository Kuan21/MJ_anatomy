// Internal jugular vein (IJV) alignment in the carotid sheath. In the carotid sheath the common carotid artery (CCA) lies medial, the IJV lateral (a little anterior in the lower neck),
// and the vagus nerve behind and between them, the three touching (Gray's Anatomy 1918; OpenStax Anatomy and Physiology: please verify the position). In the source meshes the IJV centre line
// sits 13-16 mm in front of the CCA (left; 6-9 mm on the right) with a wall gap of 3-9 mm, so the vagus could not touch both vessels. This moves the IJV middle section toward the artery
// (wall gap about 1 mm, direction 20 degrees posterior of pure lateral, which brings the vein's back wall close to the vagus); above the CCA the same rule follows the internal carotid artery
// and keeps clear of the external carotid. The two ends of the vein (the confluence at 1.416 m and the jugular foramen at 1.586 m) do not move: the shifts fade to zero there.
// The rows were derived by `node scripts/derive-jugular-shift.mjs derive` from the meshes themselves (see docs/jugular-alignment.md); each row is [height mm, outward mm, forward mm] (outward =
// away from the midline, so the right side is mirrored), moved horizontally only, smooth between rows, none outside them. Radii are not changed.
export const JUGULAR_SHIFTS:Record<'Internal jugular vein.l'|'Internal jugular vein.r',number[][]>={
 'Internal jugular vein.l':[[1416,0,0],[1421,0.3,-2.5],[1426,0.7,-6.5],[1431,0.9,-11.5],[1436,0.4,-15.7],[1441,-0.3,-18],[1446,-1,-18.8],[1451,0,-18.1],[1456,2.5,-16.7],[1461,4.1,-16.3],[1466,5.2,-16.1],[1471,7.2,-14.8],[1476,9.4,-13.3],[1481,11.2,-12],[1486,11.9,-11.2],[1491,11,-11.4],[1496,12.5,-12.3],[1501,12.3,-11.9],[1506,12.7,-10.8],[1511,12.5,-9],[1516,12.1,-7.7],[1521,11.5,-6.9],[1526,10.7,-6.4],[1531,9.4,-5.2],[1536,7.6,-4.7],[1541,5.8,-4],[1546,3.5,-3.2],[1551,1.9,-2],[1556,-0.2,0],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
 'Internal jugular vein.r':[[1416,0,0],[1421,0,-1.5],[1426,0.2,-4],[1431,0.2,-7.1],[1436,-0.1,-9.6],[1441,-0.4,-10.8],[1446,-0.3,-11.5],[1451,1.1,-12.3],[1456,3.5,-12.7],[1461,5.1,-13],[1466,6.3,-13.2],[1471,8.1,-13],[1476,9.8,-12.6],[1481,11.4,-12.1],[1486,12.3,-11.8],[1491,12.1,-11.9],[1496,12.6,-12.5],[1501,12.8,-12],[1506,12.5,-10.8],[1511,12.6,-9],[1516,12.3,-7.8],[1521,11.1,-6.8],[1526,10.6,-6.4],[1531,9.3,-5.3],[1536,7.5,-4.7],[1541,5.8,-4.1],[1546,3.5,-3.1],[1551,1.9,-2.1],[1556,-0.1,-0.1],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
};
const smooth=(t:number)=>t*t*(3-2*t);
export function alignJugulars(vessels:{name:string;positions:number[]}[]){
 for(const v of vessels){
  const rows=(JUGULAR_SHIFTS as Record<string,number[][]|undefined>)[v.name];if(!rows)continue;
  const sx=v.name.endsWith('.r')?-1:1,pos=v.positions.slice();
  for(let i=0;i<pos.length;i+=3){
   const y=pos[i+1]*1000;if(y<=rows[0][0]||y>=rows[rows.length-1][0])continue;
   let k=1;while(rows[k][0]<y)k++;
   const a=rows[k-1],b=rows[k],t=smooth((y-a[0])/(b[0]-a[0]));
   pos[i]+=sx*(a[1]+(b[1]-a[1])*t)/1000;pos[i+2]+=(a[2]+(b[2]-a[2])*t)/1000;
  }
  v.positions=pos;
 }
}
