// Parent/child relations the course notes and the anatomy texts require: each branch must leave its parent where the parent really gives it off. `%` is the side word
// ("Right"/"Left"; lower-case inside a name), `.s` the nerve-stream suffix. rule(ctx) may demand a level for the origin (the deep brachial artery arises just below teres major).
export const ARTERIES = [
  // aortic arch and neck
  ['Brachiocephalic artery', 'Arch of aorta'], ['Right subclavian artery', 'Brachiocephalic artery'], ['Right common carotid artery', 'Brachiocephalic artery'],
  ['Left common carotid artery', 'Arch of aorta'], ['Left subclavian artery', 'Arch of aorta'],
  ['% internal thoracic artery', '% subclavian artery'], ['% vertebral artery', '% subclavian artery'],
  // axillary artery, first part
  ['% superior thoracic artery', '% axillary artery'],
  // second part
  ['Trunk of % thoraco-acromial artery', '% axillary artery'], ['Pectoral branch of % thoraco-acromial artery', 'Trunk of % thoraco-acromial artery'],
  ['Acromial branch of % thoraco-acromial artery', 'Trunk of % thoraco-acromial artery'], ['Deltoid branch of % thoraco-acromial artery', 'Trunk of % thoraco-acromial artery'],
  ['Clavicular branch of % thoraco-acromial artery', 'Trunk of % thoraco-acromial artery'], ['% lateral thoracic artery', '% axillary artery'],
  // third part
  ['% subscapular artery', '% axillary artery'], ['% circumflex scapular artery', '% subscapular artery'], ['% thoracodorsal artery', '% subscapular artery'],
  ['% anterior circumflex humeral artery', '% axillary artery'], ['% posterior circumflex humeral artery', '% axillary artery'],
  // brachial artery and the elbow
  ['% brachial artery', '% axillary artery'],
  ['% deep brachial artery', '% brachial artery', {originBelow: {mesh: '% teres major', near: [0, -1, 0], box: 'humeral', tolMm: 14}}],
  ['Middle collateral branch of % deep brachial artery', '% deep brachial artery'], ['Radial collateral branch of % deep brachial artery', '% deep brachial artery'],
  ['% superior ulnar collateral artery', '% brachial artery'], ['% inferior ulnar collateral artery', '% brachial artery'],
  ['% radial artery', '% brachial artery'], ['% ulnar artery', '% brachial artery'],
  ['% radial recurrent artery', '% radial artery'], ['% anterior ulnar recurrent artery', '% ulnar artery'], ['% posterior ulnar recurrent artery', '% ulnar artery'],
  ['% common interosseous artery', '% ulnar artery'], ['% anterior interosseous artery', '% common interosseous artery'], ['% posterior interosseous artery', '% common interosseous artery'],
  ['% recurrent interosseous artery', '% common interosseous artery'],
  ['% superficial palmar branch of radial artery', '% radial artery'], ['% deep palmar branch of ulnar artery', '% ulnar artery'],
  // pelvis and lower limb
  ['% common iliac artery', 'Abdominal aorta'], ['% external iliac artery', '% common iliac artery'], ['% internal iliac artery', '% common iliac artery'],
  ['% femoral artery', '% external iliac artery'], ['% deep femoral artery', '% femoral artery'], ['% lateral circumflex femoral artery', '% deep femoral artery'],
  ['% medial circumflex femoral artery', '% deep femoral artery'], ['% popliteal artery', '% femoral artery'], ['% anterior tibial artery', '% popliteal artery'],
  ['% posterior tibial artery', '% popliteal artery'], ['% fibular artery', '% posterior tibial artery'], ['% dorsalis pedis artery', '% anterior tibial artery'],
  ['% medial plantar artery', '% posterior tibial artery'], ['% lateral plantar artery', '% posterior tibial artery'],
  ['% superior gluteal artery', '% internal iliac artery'], ['% inferior gluteal artery', '% internal iliac artery'], ['% internal pudendal artery', '% internal iliac artery'],
  ['% descending genicular artery', '% femoral artery'],
];
export const VEINS = [
  ['% axillary vein', '% subclavian vein'], ['% cephalic vein', '% axillary vein'], ['% basilic vein', '% axillary vein'],
  ['% posterior circumflex humeral vein', '% axillary vein'],
];
/** Nerve branches (stream names carry a .l/.r suffix): [child, parent]. */
export const NERVES = [
  ['Musculocutaneous nerve.s', '% lateral cord of brachial plexus'], ['Median nerve.s', '% lateral root of median nerve'], ['Median nerve.s', '% medial root of median nerve'],
  ['Ulnar nerve.s', '% medial cord of brachial plexus'], ['% lateral root of median nerve', '% lateral cord of brachial plexus'], ['% medial root of median nerve', '% medial cord of brachial plexus'],
  ['% intercostobrachial nerve', '% second rib'],
  ['% greater splanchnic nerve', 'Sympathetic trunk.s'], ['% lesser splanchnic nerve', 'Sympathetic trunk.s'], ['% least splanchnic nerve', 'Sympathetic trunk.s'],
  ['% recurrent branch of median nerve', 'Median nerve.s'], ['% lateral dorsal cutaneous nerve', 'Sural nerve.s'],
  ['% inferior gluteal nerve', 'Sciatic nerve.s'], ['% nerve to obturator internus', 'Sciatic nerve.s'],
];
