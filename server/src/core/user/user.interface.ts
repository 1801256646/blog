export interface CreateUser {
  username: string;

  password: string;

  cname: string;

  isWx: boolean;

  avatar: string;
}

export interface UpdateDto extends Partial<CreateUser> {
  focus?: number[];

  collection?: number[];

  description?: string;

  userFocus?: number[];

  userFanc?: number[];

  gitAddress?: string;
}

export interface UserFocus {
  userId: number;
  userFocus: number;
}

export interface GetAllUser {
  page: number;

  pageSize: number;
}
