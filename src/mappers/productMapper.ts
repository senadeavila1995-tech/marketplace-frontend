export const toBackendProduct = (form: any) => {
  return {
    name: form.name,
    description: form.description,
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),

    imageUrl: form.image_url || "",

    StoreId: Number(form.storeId ?? form.store_id ),
    CategoryId: Number(form.categoryId ?? form.category_id ),

    status: form.status ?? true,
  };
};