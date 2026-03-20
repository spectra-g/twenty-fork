export type BlocklistItem = {
  id: string;
  handle: string;
  description?: string | null;
  workspaceMemberId: string;
  createdAt: string;
  __typename: 'BlocklistItem';
};
