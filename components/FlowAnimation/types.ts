/** 走向動畫共用型別：上肢與下肢使用同一套引擎，只有資料與示意模型不同。 */
export type Pt=[number,number,number];
export type PathGroup='nerve'|'artery'|'vein';
/** 一個步驟：標題、鏡頭（位置、目標）、分段生長的路徑、參照路徑、高亮肌肉、標籤與三段講解 */
export interface Step{
 t:string;en:string;cam:[Pt,Pt];
 /** 依序生長的路徑群組（同一群組同時生長） */
 ph:string[][];
 /** 只作參照、顯示得更淡的路徑 */
 ctx?:string[];
 /** 短暫亮起的肌肉 id（對應示意模型） */
 mus?:string[];
 /** 梨狀肌加深顯示 */
 pir?:boolean;
 /** 總覽步驟：鏡頭繞全肢轉一圈 */
 orbit?:boolean;
 /** [中文, 英文, 錨點座標, 顏色] */
 tags:[string,string,Pt,string][];
 where:string;br:string;cl:string;
}
export interface Mode{groups:string[];name:string;brH:string;steps:Step[];legend:[string,string][]}
export interface PathwayDataset{
 hint:string;
 nerves:Record<string,Pt[]>;arteries:Record<string,Pt[]>;veins:Record<string,Pt[]>;
 /** 伴行靜脈位於動脈後方（膕窩一帶）的動脈 id；其餘伴行靜脈偏在動脈內側 */
 posteriorArteries:string[];
 /** 較粗的路徑 id */
 thickPaths:RegExp;
 modes:Mode[];
}
