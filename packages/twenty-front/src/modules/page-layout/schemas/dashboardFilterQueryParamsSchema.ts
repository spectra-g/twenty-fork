import z from 'zod';

export const dashboardFilterQueryParamsSchema = z.object({
  dashboardFilters: z.string().optional(),
});
