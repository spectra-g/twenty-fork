export type WorkspaceSchemaIndexType =
  | 'BTREE'
  | 'HASH'
  | 'GIST'
  | 'SPGIST'
  | 'GIN'
  | 'BRIN';

export type WorkspaceSchemaIndexDefinition = {
  name: string;
  columns: string[];
  columnOperatorClasses?: Array<string | undefined>;
  type?: WorkspaceSchemaIndexType;
  isUnique?: boolean;
  where?: string;
};
