/** Which atlas structures the swallowing animation draws, and what each one does (pure; tested by scripts/test-swallow.mjs). Names are the atlas's own English names. */

export type SwallowRole =
  | 'tongue' | 'palate-muscle' | 'constrictor-1' | 'constrictor-2' | 'constrictor-3' | 'pharynx-other'
  | 'hyoid' | 'larynx' | 'epiglottis' | 'suprahyoid' | 'infrahyoid' | 'oesophagus' | 'trachea' | 'bone';

export interface SwallowPartRule {test: RegExp; role: SwallowRole}
/** The structures, in the order they are matched. A name may occur twice in the atlas (two sources of one structure): only the first is drawn. */
export const SWALLOW_PARTS: readonly SwallowPartRule[] = [
  {test: /^Tongue$|^(Left|Right) (genioglossus|hyoglossus)$/, role: 'tongue'},
  {test: /^Uvular muscle$|^(Left|Right) (levator veli palatini|tensor veli palatini)$/, role: 'palate-muscle'},
  {test: /^(Left|Right) superior pharyngeal constrictor$/, role: 'constrictor-1'},
  {test: /^(Left|Right) middle pharyngeal constrictor$/, role: 'constrictor-2'},
  {test: /^(Left|Right) inferior pharyngeal constrictor$/, role: 'constrictor-3'},
  {test: /^(Left|Right) (palatopharyngeus|salpingopharyngeus|stylopharyngeus)$|^Pharyngeal raphe$/, role: 'pharynx-other'},
  {test: /^Hyoid bone$/, role: 'hyoid'},
  {test: /^Epiglottis$/, role: 'epiglottis'},
  {test: /^(Thyroid cartilage|Cricoid cartilage)$|^(Left|Right) (arytenoid cartilage|thyrohyoid membrane)$/, role: 'larynx'},
  {test: /^(Left|Right) (mylohyoid|geniohyoid|stylohyoid|digastric)$/, role: 'suprahyoid'},
  {test: /^(Left|Right) thyrohyoid$/, role: 'infrahyoid'},
  {test: /^Esophagus$/, role: 'oesophagus'},
  {test: /^Trachea$/, role: 'trachea'},
  {test: /^(Mandible|Occipital bone|Sphenoid bone|Frontal bone|Atlas|Axis)$|^(Left|Right) (maxilla|palatine bone|temporal bone)$|^(Third|Fourth|Fifth|Sixth|Seventh) cervical vertebra$|^(First|Second) thoracic vertebra$/, role: 'bone'},
];
export const roleOf = (name: string): SwallowRole | null => SWALLOW_PARTS.find(r => r.test.test(name))?.role ?? null;

/** Picks the parts to load from an atlas manifest: one per name, in manifest order. */
export function pickSwallowParts<P extends {id: string; name: string}>(parts: readonly P[]): (P & {role: SwallowRole})[] {
  const seen = new Set<string>(), out: (P & {role: SwallowRole})[] = [];
  for (const p of parts) {const role = roleOf(p.name); if (!role || seen.has(p.name)) continue; seen.add(p.name); out.push({...p, role});}
  return out;
}

/** Movements (metres and radians) at full strength. Hyoid and larynx rise about 1.5–2 cm and come forward about 1 cm in a swallow; the epiglottis tips back over the inlet. */
export const MOVE = {
  hyoid: {up: .016, forward: .009},
  larynx: {up: .02, forward: .008},
  epiglottisTilt: 1.45,
  palateLift: .55,
  tongueTipLift: .006, tongueWaveLift: .007, tongueBaseBack: .008,
  constrictorSqueeze: .18,
  oesophagusSqueeze: .55,
} as const;
