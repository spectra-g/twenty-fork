export type DashboardFilter = {
  ownerUserId?: string;
  stage?: string;
  dateRange?: {
    from?: string | Date;
    to?: string | Date;
  };
};
