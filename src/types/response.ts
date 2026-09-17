export type Response<TData> = {
  data: TData;
};

export type DefaultMeta = {
  page: number;
  totalPage: number;
  totalData: number;
};

export type ListResponse<TData, TMeta = DefaultMeta> = Response<TData[]> & {
  meta: TMeta;
};

export type ErrorResponse = {
  type: string;
  errors: Array<{
    attr: string | null;
    detail: string | null;
    code: string | null;
  }>;
  timestamp: string;
};
