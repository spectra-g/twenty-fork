import 'reflect-metadata';

import { BlocklistCreateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-many.pre-query.hook';
import { BlocklistCreateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-create-one.pre-query.hook';
import { BlocklistQueryHookModule } from 'src/modules/blocklist/query-hooks/blocklist-query-hook.module';
import { BlocklistUpdateManyPreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-many.pre-query.hook';
import { BlocklistUpdateOnePreQueryHook } from 'src/modules/blocklist/query-hooks/blocklist-update-one.pre-query.hook';

describe('BlocklistQueryHookModule', () => {
  it('should register the createOne hook alongside the existing blocklist hooks', () => {
    const providers = Reflect.getMetadata('providers', BlocklistQueryHookModule);

    expect(providers).toEqual(
      expect.arrayContaining([
        BlocklistCreateOnePreQueryHook,
        BlocklistCreateManyPreQueryHook,
        BlocklistUpdateOnePreQueryHook,
        BlocklistUpdateManyPreQueryHook,
      ]),
    );
  });
});
