// Static guard for the selection highlight: a picked structure must be tinted (not only outlined), per part through the selection texture, and the info card's "not in view"
// hint must be measured on the selected meshes' own surface. Both were lost once (an outline-only rule, then box-corner sampling) without any check noticing.
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../app/scene.tsx', import.meta.url), 'utf8');
const fail = [];
const need = (cond, msg) => { if (!cond) fail.push(msg); };
// 1. the pick tint is on for an ordinary pick: no code path may set the fill factor to 0 for the plain selection code
need(/float fillK = 1\.0;/.test(src), 'selection fill factor must be 1.0 for every pick (fillK)');
need(!/fillK = \(selCode >= 250\.0 && selectFill < 0\.5\)/.test(src), 'ordinary picks must not be reduced to an outline only');
// 2. the tint is applied from per-part state (selection texture), after category / mastery tints, and at the end of the fragment shader
const colorStep = src.indexOf("diffuseColor.rgb = mix(diffuseColor.rgb, partTint.rgb, partTint.a");
const selStep = src.indexOf("diffuseColor.rgb = mix(diffuseColor.rgb, selCol, selAmt * fillK");
need(colorStep > 0 && selStep > colorStep, 'the selection tint must be applied after the category / mastery tint so it wins');
need(/gl_FragColor\.rgb = mix\(gl_FragColor\.rgb, selCol, 0\.85 \* selAmt \* fillK\)/.test(src), 'the selection tint must also be applied after lighting');
need(/selectedData\[i\*4\]=selected\?/.test(src), 'selection must be written per part into the selection texture');
// 3. a pick never edits a shared material: no emissive / colour writes keyed on the selection outside the nerve look table
need(!/material\.(color|emissive)\.(set|copy)\([^)]*select/i.test(src), 'a selection must not recolour a shared material');
// 4. the "not in view" test samples the selected meshes themselves
const vis = fs.readFileSync(new URL('../app/selection-visibility.ts', import.meta.url), 'utf8');
need(/selMeshes/.test(src) && /sampleMeshPoints\(selMeshes/.test(src) && /fromBufferAttribute\(pos!?,i\)/.test(vis), 'in-view hint must sample the selected meshes\' own vertices');
if (fail.length) { console.error('Selection highlight check failed:\n - ' + fail.join('\n - ')); process.exit(1); }
console.log('Selection highlight check passed: ordinary picks are tinted per part, the tint wins over category colours, and the in-view hint samples the selection surface.');
