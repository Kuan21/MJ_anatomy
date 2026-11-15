// Internal jugular vein (IJV) alignment in the carotid sheath. In the carotid sheath the common carotid artery (CCA) lies medial, the IJV lateral (a little anterior in the lower neck),
// and the vagus nerve behind and between them, the three touching (Gray's Anatomy 1918; OpenStax Anatomy and Physiology: please verify the position). In the source meshes the IJV centre line
// sits 13-16 mm in front of the CCA (left; 6-9 mm on the right) with a wall gap of 3-9 mm, so the vagus could not touch both vessels. This moves the IJV middle section toward the artery
// (wall gap about 1 mm, direction 10 degrees posterior of pure lateral, which brings the vein's back wall closer to the vagus (alternative: 20 degrees, branch mj-ijv-align-b20)); above the CCA the same rule follows the internal carotid artery
// and keeps clear of the external carotid. The two ends of the vein (the confluence at 1.416 m and the jugular foramen at 1.586 m) do not move: the shifts fade to zero there.
// The rows were derived by `node scripts/derive-jugular-shift.mjs derive` from the meshes themselves (see docs/jugular-alignment.md); each row is [height mm, outward mm, forward mm] (outward =
// away from the midline, so the right side is mirrored), moved horizontally only, smooth between rows, none outside them. Radii are not changed.
export const JUGULAR_SHIFTS:Record<'Internal jugular vein.l'|'Internal jugular vein.r',number[][]>={
 'Internal jugular vein.l':[[1416,0,0],[1421,0.4,-2.3],[1426,0.9,-5.9],[1431,1.2,-10.4],[1436,0.7,-14.3],[1441,-0.1,-16.5],[1446,-0.3,-17.6],[1451,0.9,-17.6],[1456,2.9,-16.6],[1461,4,-15.7],[1466,5,-14.6],[1471,6.7,-12.9],[1476,8.8,-11.6],[1481,11.2,-10.6],[1486,12.7,-9.9],[1491,13.1,-9.2],[1496,15.1,-8.7],[1501,15.2,-8.4],[1506,14.8,-9.6],[1511,15.4,-9.5],[1516,14,-8.6],[1521,12.4,-7.3],[1526,10.8,-6.9],[1531,9.1,-5.6],[1536,7.7,-4.5],[1541,6,-3.8],[1546,3.6,-3.1],[1551,1.9,-2],[1556,-0.2,0],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
 'Internal jugular vein.r':[[1416,0,0],[1421,0.1,-1.2],[1426,0.4,-3.2],[1431,0.5,-5.8],[1436,0.4,-8],[1441,0,-9.1],[1446,-0.4,-9.5],[1451,0.1,-9.9],[1456,1.9,-10.2],[1461,4,-10.6],[1466,5.9,-11.1],[1471,8.3,-11.3],[1476,10.5,-11.4],[1481,12.2,-11.2],[1486,13.2,-11],[1491,13.5,-10.6],[1496,14.7,-11],[1501,13.8,-10.3],[1506,14.2,-10.9],[1511,14.7,-10.6],[1516,14,-8.8],[1521,12.4,-7.5],[1526,10.7,-6.9],[1531,9.1,-5.6],[1536,7.6,-4.4],[1541,6,-3.9],[1546,3.6,-3.1],[1551,1.9,-2.1],[1556,-0.1,-0.1],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
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
