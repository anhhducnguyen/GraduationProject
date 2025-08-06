export interface FakeFace {
  url: string;
  public_id: string;
  created_at: string;
  width: number;
  height: number;
  format: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    urls: FakeFace[];
  };
}