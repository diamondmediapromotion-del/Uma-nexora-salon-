import { Shop } from "../types";

const CATEGORY_IMAGES: Record<string, string> = {
  hair_salon: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000&auto=format&fit=crop",
  tattoo: "https://images.unsplash.com/photo-1562158014-998845013083?q=80&w=1000&auto=format&fit=crop",
  barber: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop",
  spa: "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=1000&auto=format&fit=crop",
  beauty_parlour: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop",
  massage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1000&auto=format&fit=crop",
  nail_art: "https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?q=80&w=1000&auto=format&fit=crop",
};

const SPECIFIC_SHOP_IMAGES: Record<string, string> = {
  "Chique Salon & Luxury Spa": "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
  "Ink Craft Tattoo Studio": "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=1000&auto=format&fit=crop",
  "Royal Touch Salon": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop",
  "Chique Salon": "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
};

export const getShopImage = (shop: Partial<Shop>) => {
  if (shop.cover_image_url) return shop.cover_image_url;
  
  if (shop.shop_name && SPECIFIC_SHOP_IMAGES[shop.shop_name]) {
    return SPECIFIC_SHOP_IMAGES[shop.shop_name];
  }
  
  if (shop.category && CATEGORY_IMAGES[shop.category]) {
    return CATEGORY_IMAGES[shop.category];
  }
  
  return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop";
};
