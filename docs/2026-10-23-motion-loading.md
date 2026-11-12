# Motion attachments and loading update — 2026-10-23

## Changes

- Trunk motion now carries authored rib origins with the local spinal field,
  and shoulder/arm attachments with the same final thoracic frame as the bones.
  Previously, assigning the whole tissue to either field could separate its
  other attachment. The peripheral upper-limb nerves use this carrier too.
- Shared body-part classification is used by both worker and local fallback.
  Head, spine and leg tissue calculations can now run in the existing worker.
  Bones, muscles and nerve followers display the same completed pose. Reset
  invalidates pending results, including when changing body regions.
- Original positions and packed normals are saved before fallback posing.
- The approximately 2 MB deltoid nerve attachment table loads with peripheral
  nerves instead of being bundled into both startup JavaScript and the worker.
  The worker is created on the first motion request, not on opening the atlas.
- Supplementary downloads use a two-job queue after primary atlas loading.
  Draining includes nested catalogue jobs. Existing independent retries and
  persistent immutable model caching remain in place.
- Neck vessel and articular-surface JSON use their existing gzip assets.

No source meshes were replaced or removed. The established shoulder/forearm
solvers and their tested attachment fits are retained.

## Verification performed

- `npm run check` passed: TypeScript, mapping/classification audits, loading,
  failure/retry recovery, source-byte preservation and four actual-scene CPU
  integration variants (including a real Node worker).
- `npm run check:motion` passed: skeleton, shoulder, forearm/wrist, muscle
  sections, neurovascular followers, trunk attachments, head/legs, joint
  structures and cervical continuity regressions.
- `npm run prebuild` and `npx vite build --base /MJ_anatomy/` passed.
- Integration covers 2,232 normalized atlas parts and 264 installed peripheral
  nerves. Body region switching and reset-before-worker-reply are tested.
  Rendered position buffers return exactly to source positions on reset.
- The new trunk fixture covers 54 muscle/pose cases and 50,550 authored
  attachment samples. Maximum attachment/carrier disagreement is 0.000061 mm;
  the previous assignment reached 58.305 mm on this fixture. This measures
  transform consistency, not anatomical or physiological accuracy.

## Build size

| File | Previous | Updated |
| --- | ---: | ---: |
| Entry JavaScript | 3,950.85 kB | 1,960.51 kB |
| Motion worker | 2,989.25 kB | 1,072.61 kB |
| Deferred nerve attachment module | In both bundles | 1,993.29 kB |

The entry bundle is about 50% smaller. This does **not** mean that complete
model loading takes half the time: the atlas still has 33.5 MB of compressed
primary packages, plus supplementary assets, and requires geometry assembly.

## Remaining limitations

- These are educational geometric motion approximations, not a force-based
  physiological simulation or a guarantee of correct anatomy in every pose.
- Existing extreme-pose mesh-edge stretch diagnostics remain nonzero. Passing
  their regression limits does not prove that all folds or nerve gaps are gone.
- Scene tests use real geometry and worker calculations but stub GPU drawing.
  The available cloud browser cannot start WebGL, so iPad/Safari visual and
  frame-rate validation has not been completed in this environment.
- The worker integration run had a maximum main-thread CPU frame of 1,272 ms;
  the no-worker fallback was about 4 seconds. This is not a 60 fps claim.
- No unrelated model-file changes in the original working directory are
  included in this update.
