/** The "Hover labels" switch (top bar): whether the name tip follows the mouse over a structure. Off by default; the choice is kept in localStorage,
 * and a blocked or failing storage never breaks the page (reads fall back to the default, writes are skipped). */
export const HOVER_LABELS_KEY = 'mj-hover-labels';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const browserStorage = (): StorageLike | null => {try {return typeof localStorage === 'undefined' ? null : localStorage;} catch {return null;}};
export function readHoverLabels(storage: StorageLike | null = browserStorage()): boolean {
  try {return storage?.getItem(HOVER_LABELS_KEY) === '1';} catch {return false;}
}
export function writeHoverLabels(on: boolean, storage: StorageLike | null = browserStorage()): void {
  try {storage?.setItem(HOVER_LABELS_KEY, on ? '1' : '0');} catch {/* storage blocked or full: the choice just is not remembered */}
}
/** A name tip follows a mouse or pen only (touch has no hover), and only while the switch is on. Quiz, pin practice and the mock exam are separate pages whose
 * viewers draw no name tips at all, so the switch cannot reveal an answer there. */
export const hoverNameShown = (switchOn: boolean, pointerType: string): boolean => switchOn && (pointerType === 'mouse' || pointerType === 'pen');
