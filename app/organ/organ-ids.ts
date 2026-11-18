/** Organ detail modes built from scripts/build-organ-atlas.mjs packages (kept apart from the definitions so the router does not load them). */
export const ORGAN_TITLES = {stomach: '胃'} as const;
export type OrganId = keyof typeof ORGAN_TITLES;
export const ORGAN_IDS = Object.keys(ORGAN_TITLES) as OrganId[];
export const isOrganId = (s: string): s is OrganId => s in ORGAN_TITLES;
