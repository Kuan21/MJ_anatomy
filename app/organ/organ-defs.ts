import type {OrganDef} from './organ-types';
import type {OrganId} from './organ-ids';
/** Each organ definition is loaded on demand. */
export async function loadOrganDef(id: OrganId): Promise<OrganDef> {
  switch (id) {
    case 'stomach': return (await import('./organs/stomach')).STOMACH;
    case 'liver-gallbladder': return (await import('./organs/liver-gallbladder')).LIVER_GALLBLADDER;
  }
}
export type {OrganId};
