import type {SceneState} from './anatomy';

/** Selecting a structure (model click, list, search, info-card link) changes only what is selected: it never touches the camera, a layer, the isolate mode or the hidden set.
 * The scene moves the camera only when `cameraFocusNonce` changes, and only the Focus button of the info card changes it. */
export const selectOnly = (s: SceneState, ids: string[]): SceneState => ({...s, selected: ids, isolate: false, rotate: false});

/** The Focus button: ask the scene to frame these parts (or this nerve) once. */
export const withCameraFocus = (s: SceneState, target: {parts?: string[]; nerve?: string}): SceneState => ({
  ...s, cameraFocusParts: target.parts, cameraFocusNerve: target.nerve, cameraFocusNonce: (s.cameraFocusNonce ?? 0) + 1, cameraFocusScale: 1, explode: 0, rotate: false,
});

/** Every SceneState field that decides where the camera is; a selection must leave all of them as they were. */
export const CAMERA_FIELDS = ['view', 'reset', 'cameraFocusNonce', 'cameraFocusParts', 'cameraFocusNerve', 'cameraFocusRange', 'cameraFocusDir', 'cameraFocusScale', 'explode', 'focusParts', 'visible', 'hiddenParts', 'muscleLayer', 'depthFilter'] as const;
