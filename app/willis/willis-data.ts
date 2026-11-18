/** Circle of Willis animation of the brain detail mode: the steps (text, key points, exam tip), the blood-flow network and its solver, and the pure state machine.
 *  Nothing here touches the DOM or three.js, so the node tests can check it directly (scripts/test-willis.mjs).
 *
 *  The flow is a teaching model, not a measurement: every artery is one conductance, the four inflow arteries start at the same pressure and each territory drains through one
 *  resistance. Solving the network (Kirchhoff's current law) gives the direction and the share of flow in every segment, so blocking one artery shows where the flow turns round
 *  (collateral flow through the communicating arteries) and which territory is left short (ischaemia). */

// ---- network -------------------------------------------------------------------------------------------------------

export type NodeId =
  | 'ica-l-in' | 'ica-r-in' | 'va-l-in' | 'va-r-in'
  | 'ica-l-t' | 'ica-r-t' | 'ba-low' | 'ba-mid' | 'ba-top'
  | 'a1-l' | 'a1-r' | 'p1-l' | 'p1-r'
  | 'aca-l' | 'aca-r' | 'mca-l' | 'mca-r' | 'pca-l' | 'pca-r' | 'pf';

/** Segments of the network: [from, to] is the normal direction of flow. `g` is the conductance in arbitrary units (wider and shorter = larger). */
export interface Segment {id: SegmentId; from: NodeId; to: NodeId; g: number; en: string; zh: string}
export type SegmentId =
  | 'ica-l' | 'ica-r' | 'va-l' | 'va-r' | 'ba-1' | 'ba-2'
  | 'a1-l' | 'a1-r' | 'acom' | 'pcom-l' | 'pcom-r' | 'p1-l' | 'p1-r'
  | 'mca-l' | 'mca-r' | 'a2-l' | 'a2-r' | 'p2-l' | 'p2-r' | 'pf-branches';

export const SEGMENTS: readonly Segment[] = [
  {id: 'ica-l', from: 'ica-l-in', to: 'ica-l-t', g: 10, en: 'Left internal carotid artery', zh: '左內頸動脈'},
  {id: 'ica-r', from: 'ica-r-in', to: 'ica-r-t', g: 10, en: 'Right internal carotid artery', zh: '右內頸動脈'},
  {id: 'va-l', from: 'va-l-in', to: 'ba-low', g: 4, en: 'Left vertebral artery', zh: '左椎動脈'},
  {id: 'va-r', from: 'va-r-in', to: 'ba-low', g: 4, en: 'Right vertebral artery', zh: '右椎動脈'},
  {id: 'ba-1', from: 'ba-low', to: 'ba-mid', g: 10, en: 'Basilar artery (lower part)', zh: '基底動脈（下段）'},
  {id: 'ba-2', from: 'ba-mid', to: 'ba-top', g: 10, en: 'Basilar artery (upper part)', zh: '基底動脈（上段）'},
  {id: 'a1-l', from: 'ica-l-t', to: 'a1-l', g: 5, en: 'Left anterior cerebral artery (A1)', zh: '左前大腦動脈（A1 段）'},
  {id: 'a1-r', from: 'ica-r-t', to: 'a1-r', g: 5, en: 'Right anterior cerebral artery (A1)', zh: '右前大腦動脈（A1 段）'},
  {id: 'acom', from: 'a1-l', to: 'a1-r', g: 4, en: 'Anterior communicating artery', zh: '前交通支'},
  {id: 'pcom-l', from: 'ica-l-t', to: 'p1-l', g: 2.5, en: 'Left posterior communicating artery', zh: '左後交通支'},
  {id: 'pcom-r', from: 'ica-r-t', to: 'p1-r', g: 2.5, en: 'Right posterior communicating artery', zh: '右後交通支'},
  {id: 'p1-l', from: 'ba-top', to: 'p1-l', g: 5, en: 'Left posterior cerebral artery (P1)', zh: '左後大腦動脈（P1 段）'},
  {id: 'p1-r', from: 'ba-top', to: 'p1-r', g: 5, en: 'Right posterior cerebral artery (P1)', zh: '右後大腦動脈（P1 段）'},
  {id: 'mca-l', from: 'ica-l-t', to: 'mca-l', g: 1, en: 'Left middle cerebral artery', zh: '左中大腦動脈'},
  {id: 'mca-r', from: 'ica-r-t', to: 'mca-r', g: 1, en: 'Right middle cerebral artery', zh: '右中大腦動脈'},
  {id: 'a2-l', from: 'a1-l', to: 'aca-l', g: 0.45, en: 'Left anterior cerebral artery (A2 onward)', zh: '左前大腦動脈（A2 段以後）'},
  {id: 'a2-r', from: 'a1-r', to: 'aca-r', g: 0.45, en: 'Right anterior cerebral artery (A2 onward)', zh: '右前大腦動脈（A2 段以後）'},
  {id: 'p2-l', from: 'p1-l', to: 'pca-l', g: 0.5, en: 'Left posterior cerebral artery (P2 onward)', zh: '左後大腦動脈（P2 段以後）'},
  {id: 'p2-r', from: 'p1-r', to: 'pca-r', g: 0.5, en: 'Right posterior cerebral artery (P2 onward)', zh: '右後大腦動脈（P2 段以後）'},
  {id: 'pf-branches', from: 'ba-mid', to: 'pf', g: 0.6, en: 'Branches to the brainstem and cerebellum', zh: '腦幹與小腦的分支'},
];
export const SEGMENT_BY_ID = new Map(SEGMENTS.map(s => [s.id, s]));

/** The four inflow arteries start at the same pressure (1); the territories drain to 0. */
export const SOURCES: readonly NodeId[] = ['ica-l-in', 'ica-r-in', 'va-l-in', 'va-r-in'];
export const SINKS: readonly NodeId[] = ['aca-l', 'aca-r', 'mca-l', 'mca-r', 'pca-l', 'pca-r', 'pf'];

export type TerritoryId = 'aca-l' | 'aca-r' | 'mca-l' | 'mca-r' | 'pca-l' | 'pca-r' | 'pf';
export const TERRITORIES: readonly {id: TerritoryId; en: string; zh: string}[] = [
  {id: 'aca-l', en: 'Left ACA territory', zh: '左前大腦動脈供血區'},
  {id: 'aca-r', en: 'Right ACA territory', zh: '右前大腦動脈供血區'},
  {id: 'mca-l', en: 'Left MCA territory', zh: '左中大腦動脈供血區'},
  {id: 'mca-r', en: 'Right MCA territory', zh: '右中大腦動脈供血區'},
  {id: 'pca-l', en: 'Left PCA territory', zh: '左後大腦動脈供血區'},
  {id: 'pca-r', en: 'Right PCA territory', zh: '右後大腦動脈供血區'},
  {id: 'pf', en: 'Brainstem and cerebellum', zh: '腦幹與小腦'},
];

/** Conductance factor of a blocked segment (not zero, so the system stays solvable; small enough that no flow is visible). */
export const BLOCKED = 1e-6;
/** "Hypoplastic posterior communicating arteries": a common variant of an incomplete circle. */
export const THIN_PCOM = .04;

export interface FlowOptions {blocked?: SegmentId | null; thinPcom?: boolean}
export interface FlowResult {
  /** flow in each segment, positive in the segment's normal direction (from → to) */
  flow: Record<SegmentId, number>;
  /** pressure at each node (sources 1, sinks 0) */
  pressure: Record<NodeId, number>;
  /** flow into each territory as a share of the flow with no block and a complete circle */
  perfusion: Record<TerritoryId, number>;
}

const conductance = (s: Segment, o: FlowOptions) => s.g * (o.blocked === s.id ? BLOCKED : 1) * (o.thinPcom && (s.id === 'pcom-l' || s.id === 'pcom-r') ? THIN_PCOM : 1);

function solveRaw(o: FlowOptions) {
  const nodes = [...new Set(SEGMENTS.flatMap(s => [s.from, s.to]))] as NodeId[];
  const fixed = new Map<NodeId, number>([...SOURCES.map(n => [n, 1] as [NodeId, number]), ...SINKS.map(n => [n, 0] as [NodeId, number])]);
  const free = nodes.filter(n => !fixed.has(n)), at = new Map(free.map((n, i) => [n, i]));
  const N = free.length, A = Array.from({length: N}, () => new Float64Array(N + 1));
  for (const s of SEGMENTS) {
    const g = conductance(s, o);
    for (const [a, b] of [[s.from, s.to], [s.to, s.from]] as [NodeId, NodeId][]) {
      const i = at.get(a); if (i === undefined) continue;
      A[i][i] += g;
      const j = at.get(b);
      if (j === undefined) A[i][N] += g * fixed.get(b)!; else A[i][j] -= g;
    }
  }
  // Gaussian elimination with partial pivoting
  for (let c = 0; c < N; c++) {
    let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < N; r++) {
      if (r === c) continue;
      const k = A[r][c] / A[c][c]; if (!k) continue;
      for (let q = c; q <= N; q++) A[r][q] -= k * A[c][q];
    }
  }
  const pressure = {} as Record<NodeId, number>;
  for (const n of nodes) pressure[n] = fixed.has(n) ? fixed.get(n)! : A[at.get(n)!][N] / A[at.get(n)!][at.get(n)!];
  const flow = {} as Record<SegmentId, number>;
  for (const s of SEGMENTS) flow[s.id] = conductance(s, o) * (pressure[s.from] - pressure[s.to]);
  const inflow = {} as Record<TerritoryId, number>;
  for (const t of TERRITORIES) inflow[t.id] = SEGMENTS.filter(s => s.to === t.id).reduce((sum, s) => sum + flow[s.id], 0);
  return {flow, pressure, inflow};
}

const NORMAL = solveRaw({});
/** Flow through the network with one segment blocked (or none) and, optionally, thin posterior communicating arteries. */
export function solveFlow(o: FlowOptions = {}): FlowResult {
  const r = solveRaw(o), perfusion = {} as Record<TerritoryId, number>;
  for (const t of TERRITORIES) perfusion[t.id] = Math.max(0, r.inflow[t.id] / NORMAL.inflow[t.id]);
  return {flow: r.flow, pressure: r.pressure, perfusion};
}
/** The largest flow of the normal network, used to scale the speed and density of the moving dots. */
export const NORMAL_MAX_FLOW = Math.max(...SEGMENTS.map(s => Math.abs(NORMAL.flow[s.id])));

/** How a territory is shown: enough flow, reduced flow, or ischaemia. */
export type PerfusionLevel = 'ok' | 'low' | 'ischaemia';
export const LOW_BELOW = .8, ISCHAEMIA_BELOW = .5;
export const perfusionLevel = (share: number): PerfusionLevel => share < ISCHAEMIA_BELOW ? 'ischaemia' : share < LOW_BELOW ? 'low' : 'ok';
export const LEVEL_ZH: Record<PerfusionLevel, string> = {ok: '血流足夠', low: '血流下降', ischaemia: '缺血'};

/** Segments that turn round compared with the normal network (collateral flow), with a small threshold so a segment with almost no flow does not count. */
export function reversedSegments(result: FlowResult): SegmentId[] {
  const eps = .02 * NORMAL_MAX_FLOW;
  return SEGMENTS.filter(s => Math.abs(result.flow[s.id]) > eps && Math.sign(result.flow[s.id]) !== Math.sign(NORMAL.flow[s.id]) && Math.abs(NORMAL.flow[s.id]) > 1e-9 || (Math.abs(NORMAL.flow[s.id]) <= eps && Math.abs(result.flow[s.id]) > 4 * eps)).map(s => s.id);
}

// ---- territories of the brain model's surfaces ---------------------------------------------------------------------

/** Which territory a cortical surface of the brain model belongs to (model label, brain-catalogue group, side 'left' / 'right' / 'median'). The borders are simplified to whole gyri:
 *  the anterior cerebral artery takes the medial surface in front of the parieto-occipital sulcus (superior frontal and paracentral, cingulate, precuneus, gyrus rectus); the posterior cerebral
 *  artery the occipital lobe and the inferior surface of the temporal lobe with the hippocampus; the middle cerebral artery the rest of the lateral surface and the insula; the brainstem and the
 *  cerebellum belong to the vertebrobasilar branches. A median structure takes the left side. Returns null for a surface that is not drawn. */
const ACA_GYRI = /^(superior frontal|paracentral|straight gyrus|olfactory sulcus|transverse frontopolar|precuneus|subparietal|cingulate gyrus and sulcus|cingulate sulcus)/i;
const PCA_GYRI = /^(lateral occipitotemporal|medial occipitotemporal|inferior temporal gyrus|occipitotemporal sulcus|collateral sulcus|parieto-occipital|hippocampus|cingulate gyrus \(posteroventral)/i;
export function territoryOf(label: string, group: string, side: string): TerritoryId | null {
  const s = side === 'right' ? 'r' : 'l';
  if (group === 'brainstem' || group === 'cerebellum') return 'pf';
  if (!/^(frontal|parietal|temporal|occipital|limbic|insula|interlobar|cortex-other)$/.test(group)) return null;
  if (group === 'occipital' || PCA_GYRI.test(label)) return `pca-${s}` as TerritoryId;
  if (ACA_GYRI.test(label)) return `aca-${s}` as TerritoryId;
  return `mca-${s}` as TerritoryId;
}

// ---- the arteries the learner can block ----------------------------------------------------------------------------

export interface BlockChoice {id: SegmentId; en: string; zh: string; /** what to look for (the result, in one line) */ result: string}
export const BLOCK_CHOICES: readonly BlockChoice[] = [
  {id: 'ica-l', en: 'Left internal carotid artery', zh: '左內頸動脈',
    result: '左側前循環失去主要來源：右側血流經前交通支流到左前大腦動脈，基底動脈血流經左後交通支向前流到左中大腦動脈。環完整時多可代償，左中大腦動脈供血區血流下降。'},
  {id: 'ica-r', en: 'Right internal carotid artery', zh: '右內頸動脈',
    result: '與左側相同、方向相反：經前交通支與右後交通支代償，右中大腦動脈供血區血流下降。'},
  {id: 'va-l', en: 'Left vertebral artery', zh: '左椎動脈',
    result: '右椎動脈仍可單獨供應基底動脈，後循環大致足夠。'},
  {id: 'va-r', en: 'Right vertebral artery', zh: '右椎動脈',
    result: '左椎動脈仍可單獨供應基底動脈，後循環大致足夠。'},
  {id: 'ba-1', en: 'Basilar artery', zh: '基底動脈',
    result: '阻塞點以上只能靠兩側後交通支把血往後送，再逆流進基底動脈上段；腦幹與小腦血流明顯下降，後交通支細小時兩者與後大腦動脈供血區都嚴重缺血。阻塞處的橋腦穿通支直接受影響（動畫未分開畫出）。'},
  {id: 'mca-l', en: 'Left middle cerebral artery', zh: '左中大腦動脈',
    result: '阻塞在 Willis 環之後：環上的側支幫不到，左中大腦動脈供血區缺血（大腦外側面、內囊與基底核一部分）。'},
  {id: 'mca-r', en: 'Right middle cerebral artery', zh: '右中大腦動脈',
    result: '阻塞在 Willis 環之後：右中大腦動脈供血區缺血。'},
  {id: 'a1-l', en: 'Left anterior cerebral artery (A1)', zh: '左前大腦動脈 A1 段',
    result: '阻塞在前交通支之前：右側血流經前交通支流到左 A2，左前大腦動脈供血區仍有血流。'},
  {id: 'a2-l', en: 'Left anterior cerebral artery (after the ACoA)', zh: '左前大腦動脈（前交通支之後）',
    result: '阻塞在前交通支之後：側支幫不到，左前大腦動脈供血區缺血（大腦內側面，包括下肢的運動與感覺區）。'},
  {id: 'p1-l', en: 'Left posterior cerebral artery (P1)', zh: '左後大腦動脈 P1 段',
    result: '阻塞在後交通支之前：左內頸動脈血流經左後交通支向後流到左 P2，左後大腦動脈供血區仍有血流。'},
  {id: 'p2-l', en: 'Left posterior cerebral artery (after the PCoA)', zh: '左後大腦動脈（後交通支之後）',
    result: '阻塞在後交通支之後：左後大腦動脈供血區缺血（枕葉與顳葉下面），可出現對側同側偏盲。'},
];

// ---- steps ---------------------------------------------------------------------------------------------------------

export interface WillisStep {
  id: 'inflow' | 'circle' | 'branches' | 'block';
  en: string; zh: string; short: string;
  points: string[];
  tip: {label: string; text: string};
}

export const WILLIS_STEPS: readonly WillisStep[] = [
  {id: 'inflow', en: 'Inflow: carotid and vertebral arteries', zh: '入環：內頸動脈與椎動脈', short: '入環',
    points: [
      '腦的血液來自兩對動脈：左右內頸動脈（前循環），左右椎動脈（後循環）。',
      '內頸動脈在頸部不分支，經頸動脈管進入顱腔，穿過海綿竇後在前床突內側離開，於視交叉外側到達腦底。',
      '椎動脈由鎖骨下動脈發出，向上穿過第六至第一頸椎的橫突孔，經枕骨大孔入顱，在延腦前面上行。',
      '兩條椎動脈在橋腦下緣合成一條基底動脈，沿橋腦前面的基底溝上行。',
    ],
    tip: {label: '考點', text: '內頸動脈在顱內的第一個分支是眼動脈，與視神經一起經視神經管入眶；椎動脈在顱內發出後下小腦動脈與脊髓前、後動脈。'}},
  {id: 'circle', en: 'The circle of Willis', zh: '大腦動脈環（Willis 環）', short: 'Willis 環',
    points: [
      '環由前往後依次是：前交通支、兩側前大腦動脈 A1 段、兩側內頸動脈末段、兩側後交通支、兩側後大腦動脈 P1 段（由基底動脈頂端分出）。',
      '環位於腦底的腳間池內，圍繞視交叉、灰結節與乳頭體。',
      '正常情況下，各條動脈的血流大致各走各路，交通支裡的流量很小：動畫裡交通支上的點很稀疏。',
      '中大腦動脈雖然是內頸動脈最大的終支，卻不屬於環的一部分。',
    ],
    tip: {label: '考點', text: '前交通支是腦動脈瘤最常見的位置，其次是後交通支與內頸動脈交界處；後交通支動脈瘤可壓迫動眼神經，造成瞳孔放大、眼瞼下垂。'}},
  {id: 'branches', en: 'Anterior, middle and posterior cerebral arteries', zh: '分支：前、中、後大腦動脈', short: '三條大腦動脈',
    points: [
      '前大腦動脈（藍色區域）：沿大腦縱裂往前上，繞過胼胝體膝部，供應大腦內側面直到頂枕溝，包括旁中央小葉（下肢的運動與感覺區）。',
      '中大腦動脈（綠色區域）：沿外側溝往外，供應大腦外側面大部分，包括上肢與臉的運動、感覺區及語言區；豆紋動脈供應基底核與內囊。',
      '後大腦動脈（紫色區域）：繞過大腦腳往後，供應枕葉（視覺皮質）、顳葉下面、視丘一部分。',
      '基底動脈的分支（上小腦動脈、前下小腦動脈、橋腦支）與椎動脈的後下小腦動脈供應腦幹與小腦（褐色區域）。',
    ],
    tip: {label: '考點', text: '前大腦動脈阻塞：對側下肢無力與感覺喪失；中大腦動脈阻塞：對側臉與上肢較嚴重，優勢半球加失語症；後大腦動脈阻塞：對側同側偏盲，常保留黃斑視力。'}},
  {id: 'block', en: 'Block an artery: collateral flow and ischaemia', zh: '阻塞一條動脈：側支循環與缺血', short: '阻塞與代償',
    points: [
      '在下方選一條動脈阻塞（紅色叉號），動畫重新計算每一段的血流方向與流量。',
      '橘色的段是血流方向倒轉的側支循環；橘紅色區域是缺血，淡黃色是血流下降。',
      '阻塞在環之前（內頸動脈、椎動脈、A1、P1）：交通支可把對側或前後的血流帶過來。',
      '阻塞在環之後（中大腦動脈、A2、P2）：環上的側支幫不到，該供血區缺血；只剩軟腦膜側支，動畫未畫出。',
      '勾選「後交通支細小」看不完整的環：很多人一側或兩側的後交通支很細，代償能力就差很多。',
    ],
    tip: {label: '考點', text: '環完整時，單側內頸動脈慢慢阻塞可以沒有症狀；突然阻塞或環不完整時，同側中大腦動脈供血區最容易缺血（遠離各動脈的交界區，稱分水嶺區，最先受影響）。'}},
];
export const STEP_COUNT = WILLIS_STEPS.length;
export const WILLIS_NOTE = '示意動畫：血流以簡化的管路模型計算，只表示方向與相對多少；供血區界線經簡化，個人差異很大。動脈位置以 3D 模型為準。';

// ---- state machine (same shape as the hearing animation) -----------------------------------------------------------

export interface PlayState {step: number; t: number; dwell: number; playing: boolean; auto: boolean}
export const AUTO_DWELL_S = 14;
export const SPEED_SLIDER = {min: .2, max: 1.6, step: .1, initial: .8};
export const initialPlay = (reducedMotion = false): PlayState => ({step: 0, t: 0, dwell: 0, playing: !reducedMotion, auto: false});
export const wrapStep = (i: number) => ((i % STEP_COUNT) + STEP_COUNT) % STEP_COUNT;
export const goTo = (s: PlayState, step: number): PlayState => ({...s, step: wrapStep(step), dwell: 0});
export const stepBy = (s: PlayState, delta: number): PlayState => goTo(s, s.step + delta);
export function advance(s: PlayState, dt: number, speed: number): PlayState {
  if (!s.playing) return s;
  const next = {...s, t: s.t + dt * speed, dwell: s.dwell + dt};
  return s.auto && next.dwell > AUTO_DWELL_S ? goTo(next, s.step + 1) : next;
}

/** Which segments are lit in each step (the others stay faint). */
export const STEP_SEGMENTS: Record<WillisStep['id'], readonly SegmentId[]> = {
  inflow: ['ica-l', 'ica-r', 'va-l', 'va-r', 'ba-1', 'ba-2'],
  circle: ['ica-l', 'ica-r', 'ba-1', 'ba-2', 'a1-l', 'a1-r', 'acom', 'pcom-l', 'pcom-r', 'p1-l', 'p1-r'],
  branches: SEGMENTS.map(s => s.id),
  block: SEGMENTS.map(s => s.id),
};

/** Moving dots along a segment: the dot at position k of n is at share `u` (0–1) of the way in the direction of flow. `flow` sets the speed and the direction. */
export function dotPosition(k: number, n: number, t: number, flow: number, length: number) {
  const speed = .018 + .05 * Math.min(1, Math.abs(flow) / NORMAL_MAX_FLOW); // metres per second of animation clock
  const base = ((k / n + t * speed / Math.max(length, 1e-3)) % 1 + 1) % 1;
  return flow >= 0 ? base : 1 - base;
}
/** How many dots a segment carries: more flow, more dots (none when the flow is negligible). */
export function dotCount(flow: number, length: number) {
  const share = Math.abs(flow) / NORMAL_MAX_FLOW;
  if (share < .01) return 0;
  return Math.max(2, Math.round(length / .004 * (.25 + .75 * Math.min(1, share))));
}
