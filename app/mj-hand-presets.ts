import {DIGIT_NEUTRAL,type DigitPose} from './biomechanics-v2/digits';

/** Hand gestures for the finger controls. The thumb values of 捏取 and OK 手勢 were solved so that the pads of the thumb and the index finger meet (bone tips 8 mm apart, bones never closer than 3 mm); the fist (MCP 82–90°, PIP 98–105°, DIP 70–80°, little and ring finger curl a little more than the index finger) lays the thumb over the middle phalanges (scripts/test-digits.mjs and scripts/test-digit-collision.mjs check them). */
export interface HandPreset{id:string;label:string;pose:DigitPose}
const make=(values:Partial<DigitPose>):DigitPose=>({...DIGIT_NEUTRAL,...values});
export const HAND_PRESETS:HandPreset[]=[
 {id:'open',label:'張開',pose:make({indexMcpAbduction:12,ringMcpAbduction:10,littleMcpAbduction:18,thumbCmcAbduction:40,indexMcpFlexion:-10,middleMcpFlexion:-10,ringMcpFlexion:-10,littleMcpFlexion:-10})},
 {id:'half',label:'半握拳',pose:make({indexMcpFlexion:42,indexPipFlexion:58,indexDipFlexion:28,middleMcpFlexion:45,middlePipFlexion:60,middleDipFlexion:30,ringMcpFlexion:48,ringPipFlexion:62,ringDipFlexion:32,littleMcpFlexion:52,littlePipFlexion:64,littleDipFlexion:34,thumbCmcAbduction:22,thumbMcpFlexion:12,thumbIpFlexion:12})},
 {id:'fist',label:'握拳',pose:make({indexMcpFlexion:82,indexPipFlexion:98,indexDipFlexion:70,middleMcpFlexion:86,middlePipFlexion:100,middleDipFlexion:74,ringMcpFlexion:90,ringPipFlexion:102,ringDipFlexion:76,littleMcpFlexion:90,littlePipFlexion:105,littleDipFlexion:80,thumbCmcFlexion:-15,thumbCmcAbduction:14,thumbMcpFlexion:30,thumbIpFlexion:80})},
 {id:'pinch',label:'捏取',pose:make({indexMcpFlexion:38,indexPipFlexion:50,indexDipFlexion:20,middleMcpFlexion:45,middlePipFlexion:50,middleDipFlexion:25,ringMcpFlexion:55,ringPipFlexion:58,ringDipFlexion:28,littleMcpFlexion:62,littlePipFlexion:62,littleDipFlexion:30,thumbCmcFlexion:-15,thumbOpposition:30,thumbMcpFlexion:11,thumbIpFlexion:3})},
 {id:'ok',label:'OK 手勢',pose:make({indexMcpFlexion:38,indexPipFlexion:50,indexDipFlexion:20,middleMcpFlexion:-5,ringMcpAbduction:8,littleMcpAbduction:15,thumbCmcFlexion:-15,thumbCmcAbduction:10,thumbOpposition:19,thumbMcpFlexion:14,thumbIpFlexion:-5})}
];
