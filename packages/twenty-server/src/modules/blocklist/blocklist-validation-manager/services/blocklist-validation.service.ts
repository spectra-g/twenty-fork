import { BadRequestException, Injectable } from '@nestjs/common';

import { z } from 'zod';

import {
  type CreateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isDomain } from 'src/engine/utils/is-domain';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type BlocklistItem = Omit<
  BlocklistWorkspaceEntity,
  'createdAt' | 'updatedAt' | 'workspaceMember'
> & {
  createdAt: string;
  updatedAt: string;
  workspaceMemberId: string;
};

const BLOCKLIST_DESCRIPTION_MAX_LENGTH = 255;

@Injectable()
export class BlocklistValidationService {
  constructor(
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async validateBlocklistForCreateMany(
    payload: CreateManyResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    await this.validateSchema(payload.data);
    await this.validateUniquenessForCreateMany(payload, userId, workspaceId);

    return payload;
  }

  public async validateBlocklistForUpdateOne(
    payload: UpdateOneResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    if (typeof payload.data.handle !== 'undefined') {
      await this.validateSchema([payload.data]);
    }
    if ('description' in payload.data) {
      this.validateDescription(payload.data.description);
    }
    await this.validateUniquenessForUpdateOne(payload, userId, workspaceId);

    return payload;
  }

  public async validateSchema(blocklist: BlocklistItem[]) {
    const emailOrDomainSchema = z
      .string()
      .trim()
      .pipe(z.email({ error: 'Invalid email or domain' }))
      .or(
        z
          .string()
          .refine(
            (value) => value.startsWith('@') && isDomain(value.slice(1)),
            'Invalid email or domain',
          ),
      );

    for (const item of blocklist) {
      if (!item.handle) {
        throw new BadRequestException('Blocklist handle is required');
      }

      const result = emailOrDomainSchema.safeParse(item.handle);

      if (!result.success) {
        throw new BadRequestException(result.error.issues[0].message);
      }

      if ('description' in item) {
        this.validateDescription(item.description);
      }
    }
  }

  public validateDescription(description: string | null | undefined) {
    if (description === null || typeof description === 'undefined') {
      return;
    }

    if (description.length > BLOCKLIST_DESCRIPTION_MAX_LENGTH) {
      throw new BadRequestException(
        `Blocklist description cannot exceed ${BLOCKLIST_DESCRIPTION_MAX_LENGTH} characters`,
      );
    }
  }

  public async validateUniquenessForCreateMany(
    payload: CreateManyResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    const currentWorkspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkspaceMemberWorkspaceEntity,
            );

          return workspaceMemberRepository.findOneByOrFail({
            userId,
          });
        },
        authContext,
      );

    const currentBlocklist =
      await this.blocklistRepository.getByWorkspaceMemberId(
        currentWorkspaceMember.id,
        workspaceId,
      );

    const currentBlocklistHandles = currentBlocklist.map(
      (blocklist) => blocklist.handle,
    );

    if (
      payload.data.some((item) => currentBlocklistHandles.includes(item.handle))
    ) {
      throw new BadRequestException('Blocklist handle already exists');
    }
  }

  public async validateUniquenessForUpdateOne(
    payload: UpdateOneResolverArgs<BlocklistItem>,
    userId: string,
    workspaceId: string,
  ) {
    const existingRecord = await this.blocklistRepository.getById(
      payload.id,
      workspaceId,
    );

    if (!existingRecord) {
      throw new BadRequestException('Blocklist item not found');
    }

    if (
      typeof payload.data.workspaceMemberId !== 'undefined' &&
      existingRecord.workspaceMemberId !== payload.data.workspaceMemberId
    ) {
      throw new BadRequestException('Workspace member cannot be updated');
    }

    if (typeof payload.data.handle === 'undefined') {
      return;
    }

    if (existingRecord.handle === payload.data.handle) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    const currentWorkspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkspaceMemberWorkspaceEntity,
            );

          return workspaceMemberRepository.findOneByOrFail({
            userId,
          });
        },
        authContext,
      );

    const currentBlocklist =
      await this.blocklistRepository.getByWorkspaceMemberId(
        currentWorkspaceMember.id,
        workspaceId,
      );

    const currentBlocklistHandles = currentBlocklist
      .filter((blocklist) => blocklist.id !== payload.id)
      .map((blocklist) => blocklist.handle);

    if (currentBlocklistHandles.includes(payload.data.handle)) {
      throw new BadRequestException('Blocklist handle already exists');
    }
  }
}
