import z from 'zod';

export const dashboardFilterUrlQueryParamsSchema = z.object({
  dashboardFilter: z
    .object({
      ownerId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      stage: z.string().optional(),
    })
    .optional(),
});
