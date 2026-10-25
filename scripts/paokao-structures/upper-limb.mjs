// Upper-limb nerves and vessels the atlas lacks: brachial-plexus cords and roots of the median nerve, intercostobrachial nerve, recurrent branch of the median nerve,
// posterior circumflex humeral vein, posterior interosseous artery and the palmar branches that complete the palmar arches.
import {sub, add, mul, unit, len, lerp} from '../lib/paokao-util.mjs';

const GRAYS = 'Gray’s Anatomy for Students, 4th ed. (Drake et al.), ch. 7 Upper Limb';
const SIDES = [{w: 'Right', l: 'right', sx: -1, zh: '右', s: 'r'}, {w: 'Left', l: 'left', sx: 1, zh: '左', s: 'l'}];

export default function upperLimb(U) {
  const out = [], P = (x, y, z) => [x, y, z];
  const axis = (name, y, near, half = .002) => U.axisAt(name, y, near, half);
  const low = name => U.tips(name, .008).reduce((a, v) => v[1] < a[1] ? v : a);
  const high = name => U.tips(name, .008).reduce((a, v) => v[1] > a[1] ? v : a);
  for (const S of SIDES) {
    const N = n => `${n}.${S.s}`, ax = `${S.w} axillary artery`, med = N('Median nerve'), uln = N('Ulnar nerve'), mc = N('Musculocutaneous nerve');
    const medTop = high(med), ulnTop = high(uln), mcTop = high(mc);
    const dSup = low(N('Anterior division of superior trunk of brachial plexus')), dMid = low(N('Anterior division of middle trunk of brachial plexus')), dInf = low(N('Anterior division of inferior trunk of brachial plexus'));
    const artery = y => axis(ax, y, P(S.sx * .13, y, -.008));
    // Lateral cord: anterior divisions of the upper and middle trunks join lateral to the axillary artery; it gives the musculocutaneous nerve and the lateral root of the median nerve.
    {
      const e = add(lerp(dSup, dMid, .5), P(S.sx * .004, -.014, .004));
      out.push({
        name: `${S.w} lateral cord of brachial plexus`, zh: `${S.zh}臂神經叢外側束`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [dSup, lerp(dSup, e, .5), e], r: [.0016, .0018], samples: 14}, {pts: [dMid, lerp(dMid, e, .5), e], r: [.0016, .0018], samples: 14},
          {pts: [e, add(lerp(e, mcTop, .35), P(S.sx * .006, 0, 0)), add(lerp(e, mcTop, .7), P(S.sx * .003, 0, .002)), mcTop], r: [.0015, .0012], samples: 30}],
        card: {origin: ['Anterior divisions of the upper and middle trunks (C5–C7)', '上幹與中幹的前股（C5–C7）'],
          course: ['Lies lateral to the axillary artery behind pectoralis minor; gives the lateral pectoral nerve, the musculocutaneous nerve and the lateral root of the median nerve', '在胸小肌深面、腋動脈外側；發出外側胸神經、肌皮神經與正中神經外側根'],
          supply: ['Flexor muscles of the arm (through the musculocutaneous nerve) and the lateral part of the median nerve territory', '臂前群屈肌（經肌皮神經）與正中神經外側部分的支配範圍']},
        refs: [GRAYS],
      });
      // Lateral root of the median nerve: crosses in front of the axillary artery to join the medial root.
      const cross = add(lerp(e, medTop, .5), P(0, 0, .007));
      out.push({
        name: `${S.w} lateral root of median nerve`, zh: `${S.zh}正中神經外側根`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [e, cross, medTop], r: [.0014, .0016], samples: 16}],
        card: {origin: ['Lateral cord (C6–C7)', '外側束（C6–C7）'], course: ['Crosses in front of the axillary artery to meet the medial root', '越過腋動脈前方，與內側根會合'], supply: ['Forms the median nerve with the medial root', '與內側根合成正中神經']}, refs: [GRAYS],
      });
      // Medial cord: anterior division of the lower trunk, medial to the axillary artery; gives the ulnar nerve and the medial root of the median nerve.
      const e2 = add(dInf, P(-S.sx * .006, -.012, -.002));
      out.push({
        name: `${S.w} medial cord of brachial plexus`, zh: `${S.zh}臂神經叢內側束`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [dInf, lerp(dInf, e2, .5), e2], r: [.0017, .0017], samples: 14}, {pts: [e2, lerp(e2, ulnTop, .5), ulnTop], r: [.0016, .0013], samples: 14}],
        card: {origin: ['Anterior division of the lower trunk (C8–T1)', '下幹前股（C8–T1）'],
          course: ['Lies medial to the axillary artery; gives the medial pectoral nerve, the medial brachial and antebrachial cutaneous nerves, the ulnar nerve and the medial root of the median nerve', '位於腋動脈內側；發出內側胸神經、臂內側與前臂內側皮神經、尺神經與正中神經內側根'],
          supply: ['Medial forearm and hand muscles (through the ulnar nerve) and medial arm skin', '前臂與手內側肌群（經尺神經）及臂內側皮膚']},
        refs: [GRAYS],
      });
      const cross2 = add(lerp(e2, medTop, .5), P(0, 0, .006));
      out.push({
        name: `${S.w} medial root of median nerve`, zh: `${S.zh}正中神經內側根`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [e2, cross2, medTop], r: [.0014, .0016], samples: 16}],
        card: {origin: ['Medial cord (C8–T1)', '內側束（C8–T1）'], course: ['Crosses in front of the axillary artery to meet the lateral root', '越過腋動脈前方，與外側根會合'], supply: ['Forms the median nerve with the lateral root', '與外側根合成正中神經']}, refs: [GRAYS],
      });
    }
    // Intercostobrachial nerve: lateral cutaneous branch of the 2nd intercostal nerve, across the axilla to the skin of the medial arm.
    {
      const brach = y => axis(`${S.w} brachial artery`, y, P(S.sx * .165, y, -.02));
      const a = U.onSurface(`${S.w} second rib`, P(S.sx * .112, 1.340, .004), .0010), b = add(artery(1.352), P(0, -.006, .012)), c = add(brach(1.316), P(-S.sx * .013, 0, .005)), d = add(brach(1.272), P(-S.sx * .016, 0, .003));
      out.push({
        name: `${S.w} intercostobrachial nerve`, zh: `${S.zh}肋間臂神經`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [a, b, c, d], r: [.0007, .0005], samples: 32}],
        card: {origin: ['Lateral cutaneous branch of the 2nd intercostal nerve (T2)', '第二肋間神經（T2）的外側皮支'], course: ['Pierces the 2nd intercostal space in the mid-axillary line, crosses the axilla and joins the medial brachial cutaneous nerve', '在腋中線穿出第二肋間隙，越過腋窩並與臂內側皮神經相連'], supply: ['Skin of the axilla and the medial upper arm', '腋窩與上臂內側皮膚']}, refs: [GRAYS],
      });
    }
    // Recurrent (thenar) branch of the median nerve: leaves at the distal border of the flexor retinaculum and curls back to the thenar muscles.
    {
      const o = U.cen(med, P(S.sx * .262, .858, .032), .004), t = U.onSurface(`${S.w} opponens pollicis`, P(S.sx * .300, .868, .046), .0008), m = add(lerp(o, t, .5), P(0, -.004, .008));
      out.push({
        name: `${S.w} recurrent branch of median nerve`, zh: `${S.zh}正中神經返支`, system: 'nervous', kind: 'nerve',
        tubes: [{pts: [o, m, t], r: [.0008, .0006], samples: 20}],
        card: {origin: ['Median nerve, at the distal border of the flexor retinaculum', '正中神經，位於屈肌支持帶遠側緣'], course: ['Curls laterally and upwards over the flexor pollicis brevis into the thenar muscles', '向外側、向上彎，越過屈拇短肌進入魚際肌'],
          supply: ['Abductor pollicis brevis, flexor pollicis brevis (superficial head) and opponens pollicis', '拇短展肌、屈拇短肌（淺頭）與拇對掌肌']}, refs: [GRAYS],
      });
    }
    // Posterior circumflex humeral vein: accompanies the artery through the quadrangular space into the axillary vein.
    {
      const art = `${S.w} posterior circumflex humeral artery`, veinParent = `${S.w} axillary vein`;
      const tips = U.tips(art, .006), end = tips.reduce((a, v) => Math.abs(v[2]) > Math.abs(a[2]) ? v : a);
      const o = U.cen(veinParent, P(S.sx * .145, 1.368, 0), .004), mid = add(lerp(o, end, .5), P(0, 0, -.008));
      out.push({
        name: `${S.w} posterior circumflex humeral vein`, zh: `${S.zh}旋肱後靜脈`, system: 'venous', kind: 'vein', parent: veinParent,
        tubes: [{pts: [o, add(mid, P(0, -.002, 0)), add(end, P(S.sx * .002, -.003, .0))], r: [.0016, .0010], samples: 24}],
        card: {origin: ['Axillary vein', '腋靜脈'], course: ['Accompanies the posterior circumflex humeral artery through the quadrangular space, behind the surgical neck of the humerus', '伴隨旋肱後動脈經四邊孔，繞肱骨外科頸後方'], supply: ['Drains the deltoid, teres minor and the shoulder joint', '回收三角肌、小圓肌與肩關節的血液']}, refs: [GRAYS],
      });
    }
    // Posterior interosseous artery: from the common interosseous artery through the upper gap in the interosseous membrane, down the back of the forearm.
    {
      const com = `${S.w} common interosseous artery`, ulna = `${S.w} ulna`, radius = `${S.w} radius`;
      const o = U.cen(com, P(S.sx * .218, 1.074, -.024), .004);
      const memb = `Interosseous membrane of ${S.l} forearm`;
      const back = y => { const r = axis(radius, y, P(S.sx * .25, y, -.01)), u = axis(ulna, y, P(S.sx * .235, y, -.01)); return add(lerp(r, u, .5), P(0, 0, -.0115)); };
      const pts = [o, add(o, P(S.sx * .002, -.012, -.014)), back(1.040), back(1.000), back(0.960), back(0.925), back(0.895)];
      out.push({
        name: `${S.w} posterior interosseous artery`, zh: `${S.zh}後骨間動脈`, system: 'arterial', kind: 'artery', parent: com,
        tubes: [{pts, r: [.0014, .0007], samples: 44}],
        card: {origin: ['Common interosseous artery (a branch of the ulnar artery)', '總骨間動脈（尺動脈的分支）'], course: ['Passes backwards over the upper border of the interosseous membrane and descends between the superficial and deep extensor muscles', '越過骨間膜上緣向後，在淺、深伸肌之間下行'], supply: ['Extensor muscles of the forearm; anastomoses with the dorsal carpal network', '前臂伸肌群；與腕背網吻合']}, refs: [GRAYS],
      });
    }
    // Superficial palmar branch of the radial artery (completes the superficial palmar arch) and deep palmar branch of the ulnar artery (completes the deep arch).
    {
      const ra = axis(`${S.w} radial artery`, .884, P(S.sx * .276, .884, .02)), arch = `${S.w} superficial palmar arterial arch`, tipA = U.tipNear(arch, P(S.sx * .272, .88, .03), .006);
      out.push({
        name: `${S.w} superficial palmar branch of radial artery`, zh: `${S.zh}橈動脈掌淺支`, system: 'arterial', kind: 'artery', parent: `${S.w} radial artery`,
        tubes: [{pts: [ra, add(lerp(ra, tipA, .5), P(0, 0, .008)), tipA], r: [.0012, .0009], samples: 18}],
        card: {origin: ['Radial artery, just before it turns onto the back of the wrist', '橈動脈，在轉到腕背之前'], course: ['Passes through or over the thenar muscles to join the ulnar artery in the superficial palmar arch', '穿過或越過魚際肌，與尺動脈在掌淺弓會合'], supply: ['Thenar eminence; completes the superficial palmar arch', '魚際隆起；補足掌淺弓']}, refs: [GRAYS],
      });
      const ua = axis(`${S.w} ulnar artery`, .878, P(S.sx * .242, .878, .03)), deep = `${S.w} deep palmar arch`, tipD = U.tipNear(deep, P(S.sx * .24, .87, .03), .006);
      out.push({
        name: `${S.w} deep palmar branch of ulnar artery`, zh: `${S.zh}尺動脈掌深支`, system: 'arterial', kind: 'artery', parent: `${S.w} ulnar artery`,
        tubes: [{pts: [ua, add(lerp(ua, tipD, .5), P(0, 0, -.006)), tipD], r: [.0011, .0009], samples: 18}],
        card: {origin: ['Ulnar artery, beside the pisiform', '尺動脈，豆狀骨旁'], course: ['Passes between abductor digiti minimi and flexor digiti minimi brevis to the palm and joins the radial artery in the deep palmar arch', '穿過小指展肌與小指屈肌之間入掌，與橈動脈在掌深弓會合'], supply: ['Hypothenar muscles; completes the deep palmar arch', '小魚際肌；補足掌深弓']}, refs: [GRAYS],
      });
    }
  }
  return out;
}
