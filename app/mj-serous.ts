/** Serous membranes drawn around the lungs and heart (schematic shells). Layers can be switched one by one. */
export const SEROUS_LAYERS=[
 {key:'visceral pleura',zh:'臟層胸膜',en:'Visceral pleura'},
 {key:'parietal pleura',zh:'壁層胸膜',en:'Parietal pleura'},
 {key:'fibrous pericardium',zh:'纖維心包',en:'Fibrous pericardium'},
 {key:'parietal layer of serous pericardium',zh:'漿膜心包壁層',en:'Parietal layer of serous pericardium'},
 {key:'visceral layer of serous pericardium',zh:'漿膜心包臟層（心外膜）',en:'Visceral layer of serous pericardium (epicardium)'}
] as const;
export const serousLayerKey=(name:string)=>name.toLowerCase().replace(/\b(left|right)\b/g,'').replace(/\s+/g,' ').trim();
