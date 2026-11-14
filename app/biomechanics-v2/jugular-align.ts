// Internal jugular vein (IJV) alignment in the carotid sheath. In the carotid sheath the common carotid artery (CCA) lies medial, the IJV lateral (a little anterior in the lower neck),
// and the vagus nerve behind and between them, the three touching (Gray's Anatomy 1918; OpenStax Anatomy and Physiology: please verify the position). In the source meshes the IJV centre line
// sits 13-16 mm in front of the CCA (left; 6-9 mm on the right) with a wall gap of 3-9 mm, so the vagus could not touch both vessels. This moves the IJV middle section toward the artery
// (wall gap about 1 mm, direction 10 degrees anterior of pure lateral, which puts the vagus in the groove behind them); above the CCA the same rule follows the internal carotid artery
// and keeps clear of the external carotid. The two ends of the vein (the confluence at 1.416 m and the jugular foramen at 1.586 m) do not move: the shifts fade to zero there.
// The rows were derived by `node scripts/derive-jugular-shift.mjs derive` from the meshes themselves (see docs/jugular-alignment.md); each row is [height mm, outward mm, forward mm] (outward =
// away from the midline, so the right side is mirrored), moved horizontally only, smooth between rows, none outside them. Radii are not changed.
export const JUGULAR_SHIFTS:Record<'Internal jugular vein.l'|'Internal jugular vein.r',number[][]>={
 'Internal jugular vein.l':[[1416,0,0],[1421,0.4,-1.7],[1426,0.9,-4.5],[1431,1.2,-8.1],[1436,0.8,-11.3],[1441,-0.1,-13.2],[1446,-0.6,-13.9],[1451,-0.5,-14.1],[1456,0.6,-13.9],[1461,2.5,-12.9],[1466,5.1,-11.4],[1471,7.7,-9.8],[1476,9.8,-8.3],[1481,11.6,-7.1],[1486,12.3,-6.2],[1491,11.5,-5.8],[1496,11.4,-5.5],[1501,11.4,-5.3],[1506,12,-4.9],[1511,12.3,-4],[1516,12.4,-3.8],[1521,12,-3.5],[1526,11.9,-3.8],[1531,10.9,-4.6],[1536,8.3,-4.7],[1541,6.3,-3.5],[1546,3.8,-3],[1551,1.9,-2],[1556,-0.2,0],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
 'Internal jugular vein.r':[[1416,0,0],[1421,0.1,-0.6],[1426,0.4,-1.7],[1431,0.5,-3.3],[1436,0.4,-4.8],[1441,0.1,-5.7],[1446,0.1,-6.3],[1451,0.9,-7.6],[1456,2.2,-8.6],[1461,3.9,-8.6],[1466,6.3,-8.3],[1471,8.5,-7.9],[1476,10.3,-7.6],[1481,11.8,-7.2],[1486,12.7,-6.8],[1491,12.4,-6.3],[1496,12,-5.9],[1501,11.8,-5.4],[1506,11.9,-4.9],[1511,12.4,-3.8],[1516,12.6,-3.8],[1521,11.8,-3.3],[1526,11.8,-3.7],[1531,10.9,-4.5],[1536,8.3,-4.8],[1541,6.4,-3.6],[1546,3.7,-3],[1551,1.9,-2.1],[1556,-0.1,-0.1],[1561,-0.5,0.1],[1566,-0.4,0.1],[1571,-0.1,0],[1576,0,0]],
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
