export interface JointTypeInfo{
 id:string;
 en:string;
 zh:string;
 axis:string;
 upperLimbExamples:string;
 movements:string;
}

export const JOINT_TYPES:JointTypeInfo[]=[
 {id:'ball-socket',en:'Ball-and-socket',zh:'球窩關節',axis:'Multiaxial｜多軸',upperLimbExamples:'Glenohumeral (shoulder)｜盂肱關節',movements:'Flex/extend · abduct/adduct · medial/lateral rotation · circumduction｜屈伸、外展內收、內外旋、環轉'},
 {id:'hinge',en:'Hinge',zh:'鉸鏈關節',axis:'Uniaxial｜單軸',upperLimbExamples:'Elbow; interphalangeal joints｜肘關節、指間關節',movements:'Flexion / extension｜屈曲／伸展'},
 {id:'pivot',en:'Pivot',zh:'樞紐／車軸關節',axis:'Uniaxial｜單軸',upperLimbExamples:'Proximal & distal radioulnar joints｜近／遠端橈尺關節',movements:'Pronation / supination｜旋前／旋後'},
 {id:'condyloid',en:'Condyloid (ellipsoid)',zh:'髁狀／橢圓關節',axis:'Biaxial｜雙軸',upperLimbExamples:'Radiocarpal wrist; MCP joints｜橈腕關節、掌指關節',movements:'Flex/extend · abduct/adduct · circumduction｜屈伸、外展內收、環轉'},
 {id:'saddle',en:'Saddle',zh:'鞍狀關節',axis:'Biaxial｜雙軸',upperLimbExamples:'1st CMC of thumb; sternoclavicular｜拇指第一腕掌關節、胸鎖關節',movements:'Flex/extend · abduct/adduct · circumduction; thumb opposition/reposition｜屈伸、外展內收、環轉；拇指對掌／復位'},
 {id:'plane',en:'Plane (gliding)',zh:'平面／滑動關節',axis:'Small multiaxial gliding｜小幅多軸滑動',upperLimbExamples:'Acromioclavicular; intercarpal joints｜肩鎖關節、腕骨間關節',movements:'Small gliding / rotation constrained by ligaments｜小幅滑動／旋轉'}
];
