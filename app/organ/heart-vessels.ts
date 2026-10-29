/**
 * Vessels of the heart detail model, sorted for the chamber view: opening a chamber keeps the great vessels and the main coronary vessels (they show where the heart sits)
 * and hides the fine surface branches and the pericardium, which would only cover the chamber being looked into.
 * Names are the catalogue part names (heart-detail.json); the list is reproduced in REVIEW_LOG.md for checking.
 */
/** Main coronary vessels kept when a chamber is open (the rest of the coronary and cardiac-vein groups are fine branches). */
export const MAIN_CORONARY = ['Right coronary artery', 'Left coronary artery', 'Anterior interventricular artery', 'Circumflex artery', 'Coronary sinus', 'Great cardiac vein'] as const;
/** Fine surface branches hidden while a chamber is open. */
export const FINE_BRANCHES = [
  'Right inferolateral branch of right coronary artery', 'Septal branches of anterior interventricular artery', 'Right marginal branch', 'Posterior interventricular branch', 'Diagonal branches', 'Sinoatrial nodal artery', 'Left marginal branch',
  'Middle cardiac vein', 'Inferior vein of left ventricle', 'Posterior vein of left ventricle', 'Small cardiac vein', 'Anterior cardiac veins',
] as const;
/** Groups whose visibility is restored when the chamber is closed again. */
export const VESSEL_GROUPS = ['coronary', 'veins', 'vessels', 'pericardium'] as const;
/** Opacity of a kept vessel that stands in front of the chamber being opened. */
export const BLOCKER_OPACITY = .4;
export const isFineBranch = (name: string) => (FINE_BRANCHES as readonly string[]).includes(name);
/** A kept vessel: any great vessel, or one of the main coronary vessels. */
export const isKeptVessel = (group: string, name: string) => group === 'vessels' || (MAIN_CORONARY as readonly string[]).includes(name);
