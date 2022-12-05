export interface HomeListDto {
  page: number;

  pageSize: number;

  orderBy?: string;

  username?: string;

  isTag?: boolean;
}
