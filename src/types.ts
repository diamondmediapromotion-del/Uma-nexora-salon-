export interface ShopService {
  id: string;
  shop_id: string;
  service_name: string;
  category: string;
  price: number;
  duration_minutes: number;
  description: string;
  is_active: boolean;
}

export interface ShopStaff {
  id: string;
  shop_id: string;
  staff_name: string;
  role_title: string;
  speciality: string;
  experience_years: number;
  rating: number;
  avatar_url: string;
  is_available: boolean;
  is_active: boolean;
}

export interface Service {
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface Shop {
  id: string;
  owner_id?: string;
  shop_name: string;
  category: string;
  description: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  whatsapp: string;
  cover_image_url: string;
  rating: number;
  starting_price: number;
  is_verified: boolean;
  is_active: boolean;
  is_open: boolean;
}

export interface Salon {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  area: string;
  image: string;
  services: Service[];
  tags: string[];
  distance: string;
  hasOffer: boolean;
  offerText?: string;
}

export interface Job {
  id: string;
  owner_id?: string;
  title: string;
  salon_name: string;
  location: string;
  job_type: string;
  salary_range: string;
  experience_level: string;
  perks?: string[];
  description?: string;
  category?: string;
  status?: string;
  views_count?: number;
  created_at?: string;
  is_saved?: boolean;
}

export interface GrowthPartner {
  id: string;
  name: string;
  role: string;
  city: string;
  earnings: string;
  quote: string;
  avatar: string;
}

export interface BrandPartner {
  id: string;
  name: string;
  category: string;
  logo: string;
  discount: string;
  perk: string;
}

export interface WebsiteTheme {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  primaryColor: string;
  accentColor: string;
  fontClass: string;
}

export interface CustomerBooking {
  id: string;
  customer_id: string;
  shop_id: string;
  staff_id: string | null;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  total_duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingServiceDetail {
  id: string;
  booking_id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  area: string | null;
  avatar_url: string | null;
}

export interface CustomerReview {
  id: string;
  customer_id: string;
  shop_id: string;
  booking_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  // Joined fields
  customer_name?: string;
  profiles?: {
    full_name: string;
  };
}
