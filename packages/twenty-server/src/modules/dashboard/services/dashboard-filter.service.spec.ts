import { DashboardFilterService } from 'src/modules/dashboard/services/dashboard-filter.service';

describe('DashboardFilterService', () => {
  let service: DashboardFilterService;

  beforeEach(() => {
    service = new DashboardFilterService();
  });

  describe('composeFilters', () => {
    it('returns local filters when global filters are empty', () => {
      const localFilters = {
        status: 'ACTIVE',
      };

      const result = service.composeFilters({}, localFilters);

      expect(result).toEqual(localFilters);
    });

    it('returns global filters when local filters are empty', () => {
      const globalFilters = {
        ownerId: 'owner-1',
      };

      const result = service.composeFilters(globalFilters, {});

      expect(result).toEqual(globalFilters);
    });

    it('returns intersection-like composition with local values taking precedence', () => {
      const globalFilters = {
        status: 'ACTIVE',
        ownerId: 'owner-global',
        isArchived: false,
      };
      const localFilters = {
        ownerId: 'owner-local',
        priority: 'HIGH',
      };

      const result = service.composeFilters(globalFilters, localFilters);

      expect(result).toEqual({
        status: 'ACTIVE',
        ownerId: 'owner-local',
        isArchived: false,
        priority: 'HIGH',
      });
    });

    it('handles nested filter objects with local override', () => {
      const globalFilters = {
        person: {
          city: 'Paris',
          country: 'FR',
        },
      };
      const localFilters = {
        person: {
          city: 'London',
        },
      };

      const result = service.composeFilters(globalFilters, localFilters);

      expect(result).toEqual({
        person: {
          city: 'London',
          country: 'FR',
        },
      });
    });
  });

  describe('applyPermissionStripping', () => {
    it('returns unchanged payload when all fields are allowed', () => {
      const filters = {
        status: 'ACTIVE',
        ownerId: 'owner-1',
      };

      const result = service.applyPermissionStripping(filters, [
        'status',
        'ownerId',
      ]);

      expect(result).toEqual(filters);
    });

    it('removes disallowed fields from payload', () => {
      const filters = {
        status: 'ACTIVE',
        ownerId: 'owner-1',
        internalScore: 42,
      };

      const result = service.applyPermissionStripping(filters, [
        'status',
        'ownerId',
      ]);

      expect(result).toEqual({
        status: 'ACTIVE',
        ownerId: 'owner-1',
      });
      expect(result).not.toHaveProperty('internalScore');
    });

    it('strips nested disallowed fields', () => {
      const filters = {
        person: {
          city: 'London',
          country: 'UK',
        },
        company: {
          name: 'Twenty',
        },
      };

      const result = service.applyPermissionStripping(filters, [
        'person.city',
        'company.name',
      ]);

      expect(result).toEqual({
        person: {
          city: 'London',
        },
        company: {
          name: 'Twenty',
        },
      });
    });

    it('returns empty object when no fields are allowed', () => {
      const filters = {
        status: 'ACTIVE',
        ownerId: 'owner-1',
      };

      const result = service.applyPermissionStripping(filters, []);

      expect(result).toEqual({});
    });
  });
});
