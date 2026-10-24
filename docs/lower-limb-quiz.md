# Lower-limb identification quiz

Open `#/quiz/lower-limb`, or select 下肢 in the atlas and follow Quiz. Returning
from the quiz opens the lower-limb atlas. Hash routes work on GitHub Pages,
including direct links and refreshes. The quiz, atlas and skeleton lab are lazy
routes; opening the quiz does not initialize the full atlas or its motion worker.

The quiz contains **326 named answers from 359 existing meshes**:

| System | Named answers (both sides) |
| --- | ---: |
| Bones | 64 |
| Muscles | 118 |
| Nerves | 32 |
| Arteries | 62 |
| Veins | 50 |

Choose gluteal/hip, thigh, knee, leg or ankle/foot; right, left or both sides;
one or more systems; and 10, 20 or all available questions. Long structures may
belong to multiple sections. Questions never repeat within a round, and mixed
rounds include every chosen system when the question count allows.

The prompt supplies a name, but the model does not reveal it on hover. The
first submitted selection is scored once. Correct geometry becomes green;
an incorrect selection becomes red, with both names in the feedback. Revealing
an answer counts as a mistake. The summary can replay exactly the wrong and
revealed answers. Peeling hides structures without scoring; restoring the hidden
structures remains available. Anonymous keyboard selection supports arrows and Enter.

Geometry is copied losslessly from the current normalized BodyParts3D atlas and
the existing nerve stream. Existing source-identity corrections and quarantines
are respected. Split meshes with the same anatomical name and side form one
answer. The nerve set is limited to 16 individually identified structures per
side; uncertain small branch labels are not promoted into test questions.
No missing anatomical structures are procedurally invented. The model is a
fixed reference pose: this feature does not fix or validate the motion model.

`prepare-lower-quiz.mjs` creates content-addressed packages and a small catalogue
at build time. Both sides and all five systems total approximately 5.13 MB gzip;
only packages needed for the current region/system are requested. The shared
validated model cache supports subsequent questions. Loading failures block
answer submission and offer retry; late callbacks cannot enable a new question.

Validation:

- `test-lower-quiz.mjs`: catalogue identities, source byte equality, index bounds,
  both sides and every section/system, grouped answers, randomized queues,
  immutable first-attempt scoring, reveals, and mistake replay.
- `test-quiz-viewer.mjs`: actual Three.js geometry and raycasting, correct/wrong
  colors, visibility, peeling, all five systems, keyboard, drag/pinch rejection,
  cache reuse, failed-load lockout and stale-load handling.
- `test-quiz-flow.mjs`: actual React component state/event handlers covering the
  setup-to-quiz-to-summary/retry flow, including early exit and empty filters.
- TypeScript, production build, existing atlas checks and deployment CI.

The Node viewer integration stubs GPU rendering and OrbitControls. The React
flow harness is not a browser DOM test. Physical iPhone/iPad rendering and touch
behavior still require device testing; those tests must not be described as
anatomical or WebGL visual validation.
