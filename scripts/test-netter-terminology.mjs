import assert from 'node:assert/strict';
import {netterEnglishName} from '../app/mj-netter-terminology.ts';

const cases=[
 ['Celiac artery','arterial','Celiac trunk'],
 ['Left triquetral','skeletal','Left triquetrum bone'],
 ['Right hip bone','skeletal','Right coxal bone'],
 ['Left maxilla','skeletal','Left maxillary bone'],
 ['First cervical vertebra','skeletal','Atlas (C1)'],
 ['Second cervical vertebra','skeletal','Axis (C2)'],
 ['Third cervical vertebra','skeletal','C3 vertebra'],
 ['Left supra-orbital nerve','nervous','Left supraorbital nerve'],
 ['Right flexor accessorius','muscular','Right quadratus plantae'],
 ['First lumbrical of right foot','muscular','Right 1st lumbrical of foot'],
 ['Lateral head of right gastrocnemius','muscular','Right lateral head of gastrocnemius'],
 ['Clavicular part of right pectoralis major','muscular','Right clavicular head of pectoralis major'],
 ['Sternocostal part of left pectoralis major','muscular','Left sternocostal head of pectoralis major'],
 ['Set of calcaneal branches of posterior tibial artery','arterial','Calcaneal branches of posterior tibial artery'],
 ['Left deep palmar venous arch','venous','Left deep venous palmar arch'],
 ['Hyo-epiglottic ligament','connective','Hyoepiglottic ligament']
];

for(const [raw,system,expected] of cases){
 const actual=netterEnglishName(raw,system);
 assert.equal(actual,expected,`${raw} -> ${actual}`);
}
console.log(`Netter terminology regression: ${cases.length} cases passed`);
