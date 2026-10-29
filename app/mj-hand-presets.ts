import {DIGIT_NEUTRAL,type DigitPose} from './biomechanics-v2/digits';

/** Hand gestures for the finger controls. The thumb values of 捏取 and OK 手勢 were solved so that the tips of the thumb and the index finger meet; the fist lays the thumb over the middle phalanges (scripts/test-digits.mjs checks both). */
export interface HandPreset{id:string;label:string;pose:DigitPose}
const make=(values:Partial<DigitPose>):DigitPose=>({...DIGIT_NEUTRAL,...values});
export const HAND_PRESETS:HandPreset[]=[
 {id:'open',label:'張開',pose:make({indexMcpAbduction:12,ringMcpAbduction:10,littleMcpAbduction:18,thumbCmcAbduction:40,indexMcpFlexion:-10,middleMcpFlexion:-10,ringMcpFlexion:-10,littleMcpFlexion:-10})},
 {id:'fist',label:'握拳',pose:make({indexMcpFlexion:85,indexPipFlexion:100,indexDipFlexion:65,middleMcpFlexion:85,middlePipFlexion:100,middleDipFlexion:65,ringMcpFlexion:85,ringPipFlexion:100,ringDipFlexion:65,littleMcpFlexion:85,littlePipFlexion:100,littleDipFlexion:65,thumbCmcFlexion:-5,thumbOpposition:8,thumbMcpFlexion:49,thumbIpFlexion:75})},
 {id:'pinch',label:'捏取',pose:make({indexMcpFlexion:34,indexPipFlexion:54,indexDipFlexion:17,middleMcpFlexion:55,middlePipFlexion:60,middleDipFlexion:30,ringMcpFlexion:65,ringPipFlexion:70,ringDipFlexion:35,littleMcpFlexion:70,littlePipFlexion:75,littleDipFlexion:35,thumbCmcFlexion:-15,thumbCmcAbduction:5,thumbOpposition:17,thumbMcpFlexion:10,thumbIpFlexion:19})},
 {id:'ok',label:'OK 手勢',pose:make({indexMcpFlexion:34,indexPipFlexion:54,indexDipFlexion:17,middleMcpFlexion:-5,ringMcpAbduction:8,littleMcpAbduction:15,thumbCmcFlexion:-15,thumbCmcAbduction:5,thumbOpposition:17,thumbMcpFlexion:10,thumbIpFlexion:19})}
];
