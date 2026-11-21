import type {OrganDef} from './organ-types';
import type {OrganId} from './organ-ids';
/** Each organ definition is loaded on demand. */
export async function loadOrganDef(id: OrganId): Promise<OrganDef> {
  switch (id) {
    case 'stomach': return (await import('./organs/stomach')).STOMACH;
    case 'duodenum-pancreas-spleen': return (await import('./organs/duodenum-pancreas-spleen')).DUODENUM_PANCREAS_SPLEEN;
  }
}
export type {OrganId};
