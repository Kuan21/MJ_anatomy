// Right lymphatic duct (neck root). Added to the late specs of scripts/lib/paokao-build.mjs so that no earlier structure changes its id.
import {add, mul} from '../lib/paokao-util.mjs';

export default function neckLymphatics(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  // ---- Right lymphatic duct: a short trunk (about 15 mm) formed by the right jugular, subclavian and bronchomediastinal trunks, opening into the right venous angle (the trunks themselves are not modelled).
  {
    const angle = mul(add(U.extreme('Right internal jugular vein', P(0, -1, 0)), U.extreme('Right subclavian vein', P(1, 0, 0))), .5), start = add(angle, P(0, .012, -.008));   // behind the vein, between the internal jugular vein and the common carotid artery, 3.5 mm or more from both
    out.push({
      name: 'Right lymphatic duct', zh: '右淋巴管', system: 'lymphatic', kind: 'vessel',
      tubes: [{pts: [start, add(angle, P(0, .006, -.004)), add(angle, P(0, .002, 0))], r: [.0013, .0011], samples: 16}],
      card: {origin: ['Right jugular, subclavian and bronchomediastinal lymphatic trunks', '右頸淋巴幹、右鎖骨下淋巴幹與右支氣管縱隔淋巴幹'],
        course: ['A short trunk of about 1 cm at the root of the neck that opens into the right venous angle, where the right internal jugular vein meets the right subclavian vein', '頸根部約 1 cm 的短幹，注入右靜脈角（右頸內靜脈與右鎖骨下靜脈會合處）'],
        supply: ['Returns lymph from the right side of the head and neck, the right upper limb and the right side of the thorax to the venous system', '收集右側頭頸、右上肢與右側胸部的淋巴，注入靜脈系統']}, refs: [],
    });
  }
  return out;
}
