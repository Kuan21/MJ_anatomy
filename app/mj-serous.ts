/** Serous membranes drawn around the lungs and heart (schematic shells). Layers can be switched one by one. */
export const SEROUS_LAYERS=[
 {key:'visceral pleura',zh:'臟層胸膜',en:'Visceral pleura'},
 {key:'parietal pleura',zh:'壁層胸膜',en:'Parietal pleura'},
 {key:'fibrous pericardium',zh:'纖維心包',en:'Fibrous pericardium'},
 {key:'parietal layer of serous pericardium',zh:'漿膜心包壁層',en:'Parietal layer of serous pericardium'},
 {key:'visceral layer of serous pericardium',zh:'漿膜心包臟層（心外膜）',en:'Visceral layer of serous pericardium (epicardium)'},
 // female pelvis (only drawn when the sex is female)
 {key:'pelvic peritoneum',zh:'盆腔腹膜',en:'Pelvic peritoneum'},
 {key:'vesicouterine pouch',zh:'膀胱子宮陷凹',en:'Vesicouterine pouch'},
 {key:'rectouterine pouch',zh:'直腸子宮陷凹',en:'Rectouterine pouch'}
] as const;
export const PERITONEUM_KEYS:string[]=['pelvic peritoneum','vesicouterine pouch','rectouterine pouch'];
export const serousLayerKey=(name:string)=>/parietal pleura/i.test(name)?'parietal pleura':name.toLowerCase().replace(/\b(left|right)\b/g,'').replace(/\s+/g,' ').trim();
