export interface Promotion {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl?: string | null;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreatePromotionRequest {
  productId: number;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
}

export type UpdatePromotionRequest = CreatePromotionRequest;
