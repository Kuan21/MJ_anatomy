# Viewer input, shading and delivery repair

Dragging a joint previously requested a camera refocus on every pointer update.
An exponential smoothing loop also rewrote the range input with older angles.
Direct input now coalesces to the latest angle and side once per animation
frame; region changes and reset cancel queued input. Direct manipulation
preserves the camera and the current anatomy view. A second touch can begin a
pinch while joint motion is enabled.

Small triangle areas were accumulated into normalized Int16 normals, rounding
them to zero before normalization. Surface normals now accumulate in float,
share coincident vertices within each tissue, and are packed only at the end.

An upper-limb worker retains the existing attachment, continuity, surface and
shoulder-volume calculations. Only one request can be outstanding. Bones,
muscles, vessels and nerve followers use the same completed pose, including
when newer pointer input arrives during a solve. Worker failure falls back to
the synchronous solver. Rendering updates only changed buffer ranges and
submits only visible triangles; restoring layers restores their indices.

The delivery atlas repackages all 2,234 source structures byte-for-byte into
84 content-addressed packages. The existing runtime classifier still produces
2,232 primary structures, with the separate facial supplement unchanged.
Two downloads run on constrained devices (three on desktop). Validated
immutable data is cached locally when browser storage is available. The first
complete download is still about 33.5 MB plus supplements; first-visit timing
depends on the connection. Smaller packages allow interaction before that
download finishes. Missing packages remain independently retryable.

Validation: source/delivery equality for every position, normal and index;
cache reuse and repair; failed-package resume; actual worker-thread execution;
bone/tissue atomic updates; unit normals through 90-degree abduction; exact
focus indices and restoration of all six initial systems; queued-input and
camera regressions; existing full motion/attachment/nerve checks; production
build. The scene integration test stubs GPU drawing. Physical iPad/WebGL
appearance and frame rate have not been validated here. The underlying
biomechanics remain a geometric teaching approximation.
