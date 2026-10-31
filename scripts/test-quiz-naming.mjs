// Typed-answer judging of the level-2 quiz (看結構寫名稱): case, spacing, hyphens, synonyms, left/right, close answers, languages, whole muscle for a part, opposites, abbreviations, simplified characters.
import assert from 'node:assert/strict';
import {quizModule} from './quiz-modules.mjs';
const {judgeName, acceptedNames, normalize, distance, relationOf, wholeMuscleOf, opposed} = await quizModule('app/quiz/naming.ts');
const mitral = {name: 'Mitral valve', chinese: '二尖瓣', side: 'midline'}, leaflet = {name: 'Anterior leaflet of mitral valve', chinese: '二尖瓣前瓣', side: 'midline'}, tricuspid = {name: 'Tricuspid valve', chinese: '三尖瓣', side: 'midline'}, trap = {name: 'Septomarginal trabecula (moderator band)', chinese: '節制索', side: 'midline'};
const pec = {name: 'Abdominal part of right pectoralis major', chinese: '右胸大肌腹部', side: 'right'}, ratio = {name: 'Posterior interventricular branch', chinese: '後室間支', side: 'midline'}, atrium = {name: 'Left atrium', chinese: '左心房', side: 'midline'};
const any = {language: 'any', needSide: false}, en = {language: 'en', needSide: false}, zh = {language: 'zh', needSide: false};
const r = (t, s, o) => judgeName(t, s, o).result;
// the checklist example: Mitral valve = Bicuspid valve
assert.equal(r('Mitral valve', mitral, en), 'correct'); assert.equal(r('  bicuspid   VALVE ', mitral, en), 'correct'); assert.equal(r('mitral-valve', mitral, en), 'correct');
assert.equal(r('二尖瓣', mitral, zh), 'correct'); assert.equal(r('僧帽瓣', mitral, any), 'correct'); assert.equal(r('Mitral valve', mitral, zh), 'wrong', 'English is not accepted when the language is Chinese');
assert.equal(r('Left atrioventricular valve', mitral, en), 'correct');
assert.equal(r('僧帽瓣前瓣', leaflet, zh), 'correct'); assert.equal(r('二尖瓣前瓣', leaflet, zh), 'correct'); assert.equal(r('Anterior leaflet of left atrioventricular valve', leaflet, en), 'correct'); assert.equal(r('anterior leaflet of bicuspid valve', leaflet, en), 'correct');
// the names shown are Bicuspid valve / Tricuspid valve; Mitral valve (and the older wordings) are still accepted as answers
{
  const bicuspid = {name: 'Bicuspid valve', chinese: '二尖瓣', side: 'midline'}, cusp = {name: 'Anterior cusp of bicuspid valve', chinese: '二尖瓣前瓣', side: 'midline'}, back = {name: 'Posterior cusp of tricuspid valve', chinese: '三尖瓣後瓣', side: 'midline'};
  const pm = {name: 'Posterior papillary muscle of left ventricle', chinese: '左心室後乳突肌', side: 'midline'}, chordae = {name: 'Chordae tendineae of bicuspid valve', chinese: '二尖瓣腱索', side: 'midline'};
  for (const answer of ['Bicuspid valve', 'Mitral valve', 'mitral-valve', 'Left atrioventricular valve']) assert.equal(r(answer, bicuspid, en), 'correct', answer);
  for (const answer of ['Anterior cusp of bicuspid valve', 'Anterior cusp of mitral valve', 'Anterior leaflet of mitral valve', 'anterior leaflet of bicuspid valve']) assert.equal(r(answer, cusp, en), 'correct', answer);
  for (const answer of ['二尖瓣前瓣', '僧帽瓣前瓣', '二尖瓣前葉']) assert.equal(r(answer, cusp, zh), 'correct', answer);
  for (const answer of ['Posterior cusp of tricuspid valve', 'Inferior leaflet of tricuspid valve', 'posterior leaflet of tricuspid valve']) assert.equal(r(answer, back, en), 'correct', answer);
  for (const answer of ['Posterior papillary muscle of left ventricle', 'Posteromedial papillary muscle of left ventricle', 'Posteromedial papillary muscle', 'Inferior papillary muscle of left ventricle', 'posterior papillary muscle of left ventricle']) assert.equal(r(answer, pm, en), 'correct', answer);
  for (const answer of ['Chordae tendineae of bicuspid valve', 'Chordae tendineae of mitral valve', 'Chordae tendineae']) assert.equal(r(answer, chordae, en), 'correct', answer);
  assert.equal(r('腱索', chordae, zh), 'correct');
  const ao = {name: 'Left coronary cusp of aortic valve', chinese: '主動脈瓣左冠狀瓣', side: 'midline'}, pv = {name: 'Anterior semilunar cusp of pulmonary valve', chinese: '肺動脈瓣前半月瓣', side: 'midline'};
  for (const answer of ['Left coronary cusp of aortic valve', 'Left coronary leaflet of aortic valve', 'left coronary cusp', 'left coronary leaflet']) assert.equal(r(answer, ao, en), 'correct', answer);
  for (const answer of ['Anterior semilunar cusp of pulmonary valve', 'Anterior semilunar leaflet of pulmonary valve', 'Anterior leaflet of pulmonary valve']) assert.equal(r(answer, pv, en), 'correct', answer);
}
assert.equal(r('Right atrioventricular valve', tricuspid, en), 'correct'); assert.equal(r('三尖瓣', tricuspid, zh), 'correct'); assert.equal(r('右房室瓣', tricuspid, zh), 'correct');
// brackets give two more accepted names
assert.equal(r('moderator band', trap, en), 'correct'); assert.equal(r('septomarginal trabecula', trap, en), 'correct');
// left/right: ignored unless the setting asks for it; a muscle part keeps its side word where the name has it
assert.equal(r('abdominal part of pectoralis major', pec, en), 'correct'); assert.equal(r('Abdominal part of left pectoralis major', pec, en), 'correct');
assert.equal(r('abdominal part of pectoralis major', pec, {...en, needSide: true}), 'wrong'); assert.equal(r('abdominal part of right pectoralis major', pec, {...en, needSide: true}), 'correct');
assert.equal(r('胸大肌腹部', pec, zh), 'correct'); assert.equal(r('胸大肌腹部', pec, {...zh, needSide: true}), 'wrong'); assert.equal(r('右胸大肌腹部', pec, {...zh, needSide: true}), 'correct');
// the side word may sit anywhere in the name (the main site writes "Right abdominal part of pectoralis major"); 左側 = 左
assert.equal(r('Right abdominal part of pectoralis major', pec, {...en, needSide: true}), 'correct'); assert.equal(r('Left abdominal part of pectoralis major', pec, {...en, needSide: true}), 'wrong');
assert.equal(r('右側胸大肌腹部', pec, {...zh, needSide: true}), 'correct'); assert.equal(r('左側胸大肌腹部', pec, {...zh, needSide: true}), 'wrong'); assert.equal(r('右側胸大肌腹部', pec, zh), 'correct');
// close: one slip in a short name, two in a long one; Chinese: one character in a name of four or more
assert.equal(r('mitral valv', mitral, en), 'close');
assert.equal(r('mitrel valve', mitral, en), 'close'); assert.equal(r('posterior interventricular brnch', ratio, en), 'close'); assert.equal(r('posterior interventricuar brnch', ratio, en), 'close');
assert.equal(r('posterior interventricular', ratio, en), 'wrong'); assert.equal(r('節制素', trap, zh), 'wrong', 'a three character name has no room for a slip');
assert.equal(r('後室間枝', ratio, zh), 'close');
assert.equal(r('atrium', atrium, en), 'wrong', 'left atrium is not just atrium'); assert.equal(r('left atrium', atrium, en), 'correct'); assert.equal(r('右心房', atrium, zh), 'wrong');
assert.equal(r('', mitral, any), 'wrong'); assert.equal(r('???', mitral, any), 'wrong');
const names = acceptedNames(pec); assert.ok(names.en.includes('Abdominal part of right pectoralis major') && names.zh.includes('右胸大肌腹部'));
assert.equal(distance('kitten', 'sitting'), 3); assert.equal(normalize('Left  Atrio-ventricular, valve', false), 'atrioventricularvalve');
assert.equal(normalize('Left acromial part of deltoid', true), normalize('Acromial part of left deltoid', true)); assert.equal(normalize('左側三角肌肩峰部', true), normalize('左三角肌肩峰部', true));
// abbreviations of the handouts: n. a. v. m. lig.
{
  const radial = {name: 'Right radial nerve', chinese: '右橈神經', side: 'right'}, brachial = {name: 'Right brachial artery', chinese: '右肱動脈', side: 'right'}, cephalic = {name: 'Right cephalic vein', chinese: '右頭靜脈', side: 'right'}, deltoid = {name: 'Right deltoid', chinese: '右三角肌', side: 'right'};
  assert.equal(r('radial n.', radial, en), 'correct'); assert.equal(r('radial n', radial, en), 'correct'); assert.equal(r('brachial a.', brachial, en), 'correct'); assert.equal(r('cephalic v.', cephalic, en), 'correct'); assert.equal(r('deltoid m.', deltoid, en), 'correct');
  assert.equal(r('radial a.', radial, en), 'wrong', 'the wrong abbreviation is a wrong answer');
}
// simplified characters are read as traditional
{
  const radial = {name: 'Right radial nerve', chinese: '右橈神經', side: 'right'}, longHead = {name: 'Long head of right biceps brachii', chinese: '右肱二頭肌長頭', side: 'right'};
  assert.equal(r('桡神经', radial, zh), 'correct'); assert.equal(r('橈神经', radial, zh), 'correct'); assert.equal(r('肱二头肌长头', longHead, zh), 'correct'); assert.equal(r('肱二頭肌長頭', longHead, zh), 'correct');
}
// opposites are different structures, never a slip of the pen
{
  const rhomboidMajor = {name: 'Right rhomboid major', chinese: '右大菱形肌', side: 'right'}, peroneusLongus = {name: 'Right fibularis longus', chinese: '右腓骨長肌', side: 'right'}, vastusLateralis = {name: 'Right vastus lateralis', chinese: '右股外側肌', side: 'right'}, aion = {name: 'Right anterior interosseous nerve', chinese: '右前骨間神經', side: 'right'};
  assert.ok(opposed('rhomboidminor', 'rhomboidmajor') && opposed('小菱形肌', '大菱形肌') && !opposed('rhomboidmajr', 'rhomboidmajor'));
  assert.equal(r('rhomboid minor', rhomboidMajor, en), 'wrong'); assert.equal(r('小菱形肌', rhomboidMajor, zh), 'wrong'); assert.equal(r('rhomboid majr', rhomboidMajor, en), 'close');
  assert.equal(r('腓骨短肌', peroneusLongus, zh), 'wrong'); assert.equal(r('股內側肌', vastusLateralis, zh), 'wrong'); assert.equal(r('後骨間神經', aion, zh), 'wrong'); assert.equal(r('posterior interosseous nerve', aion, en), 'wrong');
}
// a part of a muscle: the whole muscle is right, unless the muscle is learned by its heads (biceps brachii, triceps brachii, biceps femoris)
{
  const clav = {name: 'Clavicular part of right pectoralis major', chinese: '右胸大肌鎖骨頭', side: 'right'}, acromial = {name: 'Acromial part of left deltoid', chinese: '左三角肌肩峰部', side: 'left'}, trapAsc = {name: 'Ascending part of right trapezius', chinese: '右斜方肌升部（下部纖維）', side: 'right'};
  const fcu = {name: 'Humeral head of right flexor carpi ulnaris', chinese: '右尺側腕屈肌肱骨頭', side: 'right'}, gastroc = {name: 'Medial head of left gastrocnemius', chinese: '左腓腸肌內側頭', side: 'left'}, fpb = {name: 'Superficial head of right flexor pollicis brevis', chinese: '右拇短屈肌淺頭', side: 'right'};
  const longHead = {name: 'Long head of right biceps brachii', chinese: '右肱二頭肌長頭', side: 'right'}, lateralHead = {name: 'Lateral head of left triceps brachii', chinese: '左肱三頭肌外側頭', side: 'left'}, bfShort = {name: 'Short head of right biceps femoris', chinese: '右股二頭肌短頭', side: 'right'};
  assert.deepEqual(wholeMuscleOf(clav), {en: 'right pectoralis major', zh: '右胸大肌', muscle: 'pectoralis major', headsRequired: false});
  assert.deepEqual(wholeMuscleOf(trapAsc), {en: 'right trapezius', zh: '右斜方肌', muscle: 'trapezius', headsRequired: false});
  assert.equal(wholeMuscleOf(longHead).headsRequired, true); assert.equal(wholeMuscleOf(mitral), null); assert.equal(wholeMuscleOf(leaflet), null, 'a valve leaflet is not a muscle part');
  assert.equal(r('pectoralis major', clav, en), 'correct'); assert.equal(r('Pectoralis Major muscle', clav, en), 'correct'); assert.equal(r('胸大肌', clav, zh), 'correct'); assert.equal(r('右胸大肌', clav, zh), 'correct');
  assert.equal(r('clavicular part of pectoralis major', clav, en), 'correct', 'the part name stays right');
  assert.equal(r('pectoralis major', clav, {...en, needSide: true}), 'wrong', 'the side is still needed when asked for'); assert.equal(r('right pectoralis major', clav, {...en, needSide: true}), 'correct'); assert.equal(r('left pectoralis major', clav, {...en, needSide: true}), 'wrong');
  assert.equal(r('右胸大肌', clav, {...zh, needSide: true}), 'correct'); assert.equal(r('胸大肌', clav, {...zh, needSide: true}), 'wrong');
  assert.equal(r('deltoid', acromial, en), 'correct'); assert.equal(r('三角肌', acromial, zh), 'correct'); assert.equal(r('trapezius', trapAsc, en), 'correct'); assert.equal(r('斜方肌', trapAsc, zh), 'correct');
  assert.equal(r('flexor carpi ulnaris', fcu, en), 'correct'); assert.equal(r('尺側腕屈肌', fcu, zh), 'correct'); assert.equal(r('gastrocnemius', gastroc, en), 'correct'); assert.equal(r('腓腸肌', gastroc, zh), 'correct'); assert.equal(r('flexor pollicis brevis', fpb, en), 'correct');
  assert.equal(r('pectoralis minor', clav, en), 'wrong', 'a different muscle stays wrong'); assert.equal(r('pectoralis majr', clav, en), 'close');
  assert.ok(acceptedNames(clav).en.includes('right pectoralis major') && acceptedNames(clav).zh.includes('右胸大肌'));
  // biceps, triceps and biceps femoris: the head has to be named; the whole muscle is close (typed-whole), not right
  for (const [typed, s, o] of [['biceps brachii', longHead, en], ['肱二頭肌', longHead, zh], ['triceps brachii', lateralHead, en], ['肱三頭肌', lateralHead, zh], ['biceps femoris', bfShort, en], ['股二頭肌', bfShort, zh]]) {
    const v = judgeName(typed, s, o); assert.equal(v.result, 'close', `${typed} is close for ${s.name}`); assert.equal(v.relation, 'typed-whole');
  }
  assert.equal(r('long head of biceps brachii', longHead, en), 'correct'); assert.equal(r('short head of biceps brachii', longHead, en), 'wrong'); assert.equal(r('肱二頭肌短頭', longHead, zh), 'wrong');
  assert.ok(!acceptedNames(longHead).en.includes('right biceps brachii'), 'the whole is not listed as accepted for a head that has to be named');
}
// part and whole: naming the whole for a part (or a part for the whole) is close, never correct
{
  const valve = {name: 'Pulmonary valve', chinese: '肺動脈瓣'}, cusp = {name: 'Anterior semilunar cusp of pulmonary valve', chinese: '肺動脈瓣前瓣'};
  assert.equal(relationOf(cusp, valve), 'part'); assert.equal(relationOf(valve, cusp), 'whole'); assert.equal(relationOf(valve, valve), null);
  assert.equal(judgeName('pulmonary valve', cusp, en, [valve]).result, 'close'); assert.equal(judgeName('pulmonary valve', cusp, en, [valve]).relation, 'typed-whole');
  assert.equal(judgeName('anterior semilunar cusp of pulmonary valve', valve, en, [cusp]).relation, 'typed-part');
  assert.equal(judgeName('pulmonary valve', cusp, en, []).result, 'wrong', 'without the related structure it stays wrong');
  assert.equal(judgeName('anterior semilunar cusp of pulmonary valve', cusp, en, [valve]).result, 'correct');
  // midline structures keep left/right: the papillary muscles of the right ventricle are not part of the left ventricle
  const lv = {name: 'Left ventricle', chinese: '左心室', side: 'midline'}, rv = {name: 'Right ventricle', chinese: '右心室', side: 'midline'}, rvPap = {name: 'Anterior papillary muscle of right ventricle', chinese: '右心室前乳突肌', side: 'midline'};
  assert.equal(relationOf(rvPap, lv), null); assert.equal(relationOf(rvPap, rv), 'part'); assert.equal(relationOf(lv, rvPap), null);
  const lca = {name: 'Left coronary artery', chinese: '左冠狀動脈', side: 'midline'}, rcaBranch = {name: 'Right marginal branch of right coronary artery', chinese: '右冠狀動脈右緣支', side: 'midline'};
  assert.equal(relationOf(rcaBranch, lca), null);
  // a paired structure still drops the side
  assert.equal(relationOf({name: 'Long head of right biceps brachii', side: 'right'}, {name: 'Left biceps brachii', side: 'left'}), 'part');
}
// the main site's spelling, the checklist's 1:1 aliases, ordinals and vertebra codes; a parent shown on the site is never accepted for a branch; group names are close
{
  const r2 = (t, s, o) => judgeName(t, s, o).result;
  const fa = {name: 'Right flexor accessorius', chinese: '右足底方肌', side: 'right', system: 'muscular'}, hip = {name: 'Right hip bone', chinese: '右髖骨', side: 'right', system: 'skeletal'};
  const rib = {name: 'Left tenth rib', chinese: '左第十肋骨', side: 'left', system: 'skeletal'}, t10 = {name: 'Tenth thoracic vertebra', chinese: '第十胸椎', side: 'midline', system: 'skeletal'}, lumb = {name: 'First lumbrical of right foot', chinese: '右足第一蚓狀肌', side: 'right', system: 'muscular'};
  const perf = {name: 'Left set of perforating arteries', chinese: '左穿動脈群', side: 'left', system: 'arterial'}, deep = {name: 'Right deep branch of radial nerve', chinese: '右橈神經深支', side: 'right', system: 'nervous'};
  const gem = {name: 'Right gemellus inferior', chinese: '右下孖肌', side: 'right', system: 'muscular'}, iliacus = {name: 'Right iliacus', chinese: '右髂肌', side: 'right', system: 'muscular'}, rf = {name: 'Right rectus femoris', chinese: '右股直肌', side: 'right', system: 'muscular'};
  assert.equal(r2('quadratus plantae', fa, en), 'correct'); assert.equal(r2('coxal bone', hip, en), 'correct'); assert.equal(r2('hip bone', hip, en), 'correct');
  assert.equal(r2('10th rib', rib, en), 'correct'); assert.equal(r2('tenth rib', rib, en), 'correct'); assert.equal(r2('T10 vertebra', t10, en), 'correct'); assert.equal(r2('t10', t10, en), 'wrong', 'the code alone is not the name');
  assert.equal(r2('1st lumbrical of foot', lumb, en), 'correct'); assert.equal(r2('perforating arteries', perf, en), 'correct');
  assert.equal(r2('radial nerve', deep, en), 'wrong', 'the site shows the branch under the nerve, but the nerve is not the branch');
  assert.equal(r2('inferior gemellus muscle', gem, en), 'correct', 'checklist 1:1 alias');
  assert.equal(judgeName('iliopsoas muscle', iliacus, en).result, 'close'); assert.equal(judgeName('iliopsoas', iliacus, en).relation, 'typed-whole');
  assert.equal(judgeName('quadriceps femoris', rf, en).result, 'close', 'a group name is close, never right');
  assert.equal(normalize('Left tenth rib', false), normalize('Left 10th rib', false)); assert.equal(normalize('L5 vertebra', true), normalize('fifth lumbar vertebra', true));
}
console.log('Quiz naming passed: case, spacing, hyphens, synonyms, brackets, left/right, close answers, abbreviations, simplified characters, opposites, whole muscle for a part, site spellings, checklist aliases, ordinals, part and whole, and answer languages.');
