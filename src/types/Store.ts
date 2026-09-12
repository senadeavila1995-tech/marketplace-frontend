export interface Store {
  id: number;
  name: string;
  description?: string | null;
  owner?: string;
}

export interface CreateStoreRequest {
  name: string;
  description?: string | null;
}
