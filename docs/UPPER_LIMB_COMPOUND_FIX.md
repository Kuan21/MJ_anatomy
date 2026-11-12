# Upper-limb compound pose follow-up

Reproduced the reported shoulder extension −45°, abduction 69°, elbow flexion
50° pose using the actual atlas vertices, on both sides.

The three deltoid heads now share a rest-edge constraint graph. Exact duplicate
source vertices share nodes, so the stretch correction cannot separate their
seams. Fully bound bone attachments stay fixed. The solver starts from the
absolute skinned pose on each update, not the previous corrected frame.
Nearby distinct surfaces are not welded. This reduces excess local stretching;
it is not a collision, tendon-sliding, or physiological muscle simulation.

Regional camera fitting now measures the model in camera axes and reserves room
for the left controls, top navigation and right rail. Resizing and view changes
refresh the fit. Joint sliders have explicit visible tracks and touch targets.
Dragging the default right arm now also switches the side-selection state.

The seven cumulative muscle layers from GitHub main are retained unchanged in
`mj-muscle-layers.ts` and exposed under the right Dissection panel, including
their muscle lists. The v2 shared skinning pipeline supersedes main's older
per-piece rigid muscle transforms and limb-chain warp; both must not run together.

Validation: TypeScript check, initial React server render, actual-atlas soft
tissue and surface-constraint tests, and perspective projection checks at
600/1000/1366 px widths. The reported compound pose is a regression case.
Across compound and extreme shoulder poses, deltoid excess-edge-stretch energy
fell 94% left / 95% right; this is a numerical mesh metric, not an anatomical
accuracy score. Neutral geometry, rigid attachment positions, coincident seams,
and repeat-pose determinism pass. Browser/iPad visual verification remains
unavailable in this environment. Existing nerve registration and head/leg
motion remain approximations and are not claimed as clinically validated.
