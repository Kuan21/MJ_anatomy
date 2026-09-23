export interface MuscleFacts {
 chinese:string;
 originEn:string; originZh:string;
 insertionEn:string; insertionZh:string;
 innervationEn:string; innervationZh:string;
 actionEn:string; actionZh:string;
 bloodEn:string; bloodZh:string;
}

export const mf=(chinese:string,originEn:string,originZh:string,insertionEn:string,insertionZh:string,innervationEn:string,innervationZh:string,actionEn:string,actionZh:string,bloodEn:string,bloodZh:string):MuscleFacts=>({
 chinese,originEn,originZh,insertionEn,insertionZh,innervationEn,innervationZh,actionEn,actionZh,bloodEn,bloodZh
});
