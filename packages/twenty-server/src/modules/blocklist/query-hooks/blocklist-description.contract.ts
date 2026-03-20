import type {
  CreateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  type BlocklistCreateInput,
  type BlocklistUpdateInput,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

const createPayload = {
  data: [
    {
      handle: 'prospect@example.com',
      description: 'Inbound lead from conference follow-up',
      createdAt: '2026-03-20T12:00:00.000Z',
      updatedAt: '2026-03-20T12:00:00.000Z',
    },
  ],
} satisfies CreateManyResolverArgs<BlocklistCreateInput>;

const updatePayload = {
  id: 'blocklist-id',
  data: {
    description: 'Updated after contact requested no follow-up',
  },
} satisfies UpdateOneResolverArgs<BlocklistUpdateInput>;

void createPayload;
void updatePayload;
