# GPU dual-quaternion stage for biomechanics-v2

This adds a GPU stage to the existing biomechanics-v2 skinning. It does not
introduce a second rig, weight scheme or muscle model.

## What biomechanics-v2 already did

- `skeleton.ts`: thorax → clavicle → scapula → humerus → ulna → radius →
  carpus → hand, with fitted landmarks (humeral head, radial head, wrist).
- `soft-tissue.ts`: per-vertex indices/weights over a 7-frame palette per side
  and normalized dual-quaternion blending (`blended`), plus fibre guides,
  section scaling, muscle cells, surface guards, wraps, cables and followers.
  Nerves and vessels share the position-only `pathWeights` field, so touching
  parts land on the same posed point.
- `body-motion.ts`: the same approach for head, spine and both legs.

All of it ran on the CPU (shoulder worker or main-thread fallback), and every
pose re-solved and re-uploaded the positions and normals of every bound part.

## What changed

- `isLinearBinding()` (soft-tissue.ts) recognises bindings whose
  `deformTissue` is exactly one dual-quaternion blend per vertex: no follower,
  cable, wrap, fibre guide, fan, surface guard, shoulder muscle group or belly
  section change. On the current atlas that is 192 of 290 upper-limb bindings
  (84,572 of 202,408 vertices), mostly the `path` vessels plus hand and some
  forearm muscles.
- The shoulder worker hands those bindings' weights to the scene **once** and
  no longer solves or transfers them per pose (`GpuSkinResult`).
- `gpu-skinning.ts` packs both sides' palettes into a float texture
  (slot 0 = identity, then each side's frames) and writes the existing
  indices/weights into `segIndex`/`segWeight` on the merged meshes. The anatomy
  shader blends them with the same hemisphere correction and dual-part
  projection as `blended`, and rotates normals by the same blend. A part's
  `motionState.w` flag switches it on.
- The palette only carries the displayed pose (`poseForFrame`), so
  GPU-skinned tissue stays atomic with the bones and the worker-solved muscles.
- Picking raycasts GPU-skinned parts against their CPU twin (`linearSkin`) at
  the displayed pose.

Refined muscles (fibre guides, sections, sheets, cuff, deltoid) and the head,
spine and leg regions keep their existing CPU path. Extending the GPU stage to
a body region means giving its palette further slots in `writePalette` and
routing its linear `bindBodyTissue` bindings the same way; the shader is
unchanged.

## Verification

- `node scripts/test-gpu-skinning.mjs` (part of `npm run check:motion`):
  - `linearSkin` equals `deformTissue` exactly for every linear binding.
  - A JavaScript mirror of the shader running on the packed float32 palette and
    16-bit weights stays within 0.0033 mm of `deformTissue` over three poses.
  - Where a GPU vessel touches a CPU-solved one (cables, followers), the seam
    moves by at most 0.0013 mm more than when both were CPU-solved (120 contacts).
  - The worker hands every linear binding over once and never re-solves it.
- `npm run check` and `npm run check:motion` pass, including the real-worker
  atomic-pose scene test.
- Headless Chromium (SwiftShader) compiled the shader without errors; with
  both arms at 75° abduction and 70° elbow flexion, the GPU-skinned vessels
  followed the bones. This is not an iPad/GPU-vendor test.

## Performance pass (dragging the arm, opening the site)

Measured on the same machine, before vs after, in headless Chromium (software
WebGL) and Node. Absolute numbers will differ on a real device; the ratios are
what carry over.

### Dragging an upper-limb pose (shoulder worker, both arms, 290 bindings)

| | before | after |
|---|---|---|
| solve per pose (median) | 622 ms | ~500 ms |
| data returned per pose | 3.6 MB | 2.1 MB |

The solver output is **bit-identical** (SHA-1 of every returned position and
normal over 34 poses). Changes, all arithmetic-preserving:
- `constrainMuscleCells` builds the full cell gradient only for the few cells
  that need correcting, after the cheap signed-volume test.
- `muscleVolume` clears only the muscle's own gradient entries, not the whole
  shared group's array, on every pass.
- The edge loop no longer re-derives its direction and re-indexes `targets`
  per edge.
- The head-clearance scans visit only free vertices with a non-zero clearance
  (longitudinal muscles use radius 0 and skip them).

What did **not** change: the solver still runs 24/80 passes of its constraint
loop for every refined muscle, so a pose is still roughly half a second.
Making that interactive needs either fewer passes or a coarse live preview
while dragging; both change the shape the user sees, so they are not part of
this change.

### Opening the site

| median of 5 interleaved runs | before | after |
|---|---|---|
| main-thread blocking (long tasks, minus 50 ms each) | 8.2 s | 3.2 s |
| worst single freeze | 2.3 s | 1.3 s |
| until "full model loaded" | 20.9 s | 18.3 s |

- `JointAnatomy.update()` rebuilt normals for all 285 joint structures on every
  viewer state change, and loading invalidates state about 75 times. It now
  skips a row whose (mode, input pose) is unchanged. A scripted sequence of 29
  states (poses, repeats, hide, body regions, explode, reset) gives
  bit-identical positions, normals and visibility, in 2.3 s instead of 13.7 s.
- Peripheral nerve normals were computed for every mesh in the package, then
  again after rest registration, including for meshes that are discarded.
  They are now computed once for installed meshes only. Normals differ from
  before by at most 6e-8 (one float32 step, from renormalising in a different
  order).
- Installing a nerve package and registering the joint structures yield to the
  browser every ~12 ms instead of holding the page for up to 2 s.
- GPU skin attributes are created when a merged mesh first needs them, not for
  all 1.78 M vertices at load.

Not changed: the downloads (44 MB), the Three.js scene creation (~0.5 s), the
per-chunk geometry assembly and `vertexMotionWeight`.

## Drag preview (coarse while moving, solved on release)

Before this change the displayed pose was always the last *finished* solve, so
dragging an arm updated roughly twice a second and every update was a
200–400 ms main-thread frame. Now:

- **While the pose is changing** the bones follow the latest input immediately
  and all bound tissue is skinned on the GPU from the binding weights the
  worker hands over once: dual quaternions for most tissue, linear blend for the
  `chest`/`pectoralPath` sheets (closer to their solved shape: 35 mm vs 52 mm
  mean deviation at 100° abduction). Peripheral nerves use the same palette
  through their own material. No full solve is started, and nothing is bound on
  the main thread.
- **On release** (no new pose for 150 ms, `PREVIEW_QUIET_MS` in `scene.tsx`) the
  full solve runs exactly as before and replaces the preview atomically when it
  completes. A result for an older pose never replaces the live preview.
- Ligaments and capsules (the joint structures) are hidden during the preview
  and reappear with the solved pose; the rigid articular surfaces keep moving.
- Body regions (head, spine, legs) are unchanged: they keep the old
  "bones wait for tissue" behaviour. The first drag after opening the motion
  lab also behaves as before until the worker has handed over its weights.

How rough is the preview? At 75° abduction / 60° elbow flexion over the 98
refined parts, the mean deviation from the solved shape is 1.3 mm (median part),
16.6 mm (p90), with the worst vertices on the pectoral sheets and their
vessels (~90 mm); `scripts/test-gpu-skinning.mjs` prints these numbers.

### Cost per dragged frame (main thread, real scene loader, GPU draw stubbed)

45 pose changes, one every ~16 ms, both arms:

| | `main` (c0a73b0) | this change |
|---|---|---|
| frames that show a new pose | ~4 (one per finished solve) | all 45 |
| worst frame while dragging | 391 ms | ≤45 ms |
| median frame while dragging | 0.7 ms (nothing new to show) | ~13 ms |
| frames over 50 ms while dragging | 4 | 0 |

The one remaining spike is the frame where the solved shape lands after release
(~230 ms: applying the worker result, re-deforming the peripheral nerves,
re-lighting the joint structures). It now happens once per drag instead of
twice a second.

Two more per-update full recomputations were removed on the way: the cervical
vessels rebuilt normals for all 8 meshes on every viewer state change even when
the neck had not moved (bit-identical output over a 35-state scripted
sequence, 360 ms → 142 ms), and the same pattern in the joint structures was
already fixed above.

Not measured: a real GPU or an iPad. The numbers above exclude the cost of
drawing.
