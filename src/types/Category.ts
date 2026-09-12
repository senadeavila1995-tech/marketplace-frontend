export interface Category {
  id: number;
  name: string;
  createdAt?: string;
}

export interface CategoryRequest {
  name: string;
}
