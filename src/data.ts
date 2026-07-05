import { Salon, Job, GrowthPartner, BrandPartner, WebsiteTheme } from "./types";

export const SALONS_DATA: Salon[] = [
  {
    id: "salon-1",
    name: "Chique Salon & Luxury Spa",
    rating: 4.9,
    reviewsCount: 312,
    location: "Plot 12, Sardar Patel Marg, C-Scheme",
    area: "C-Scheme, Jaipur",
    distance: "1.2 km away",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
    tags: ["Verified", "Premium Partner", "Highly Rated"],
    hasOffer: true,
    offerText: "Flat 15% Cashback via Nexora QR",
    services: [
      { name: "Precision Haircut & Styling", price: 499, duration: "35 mins", category: "Hair" },
      { name: "Global Hair Coloring (L'Oreal)", price: 2499, duration: "120 mins", category: "Hair" },
      { name: "O3+ Bridal Glow Facial", price: 1899, duration: "60 mins", category: "Skin" },
      { name: "De-Tan Therapy", price: 599, duration: "30 mins", category: "Skin" }
    ]
  },
  {
    id: "salon-2",
    name: "Zoya Hair & Beauty Lounge",
    rating: 4.8,
    reviewsCount: 198,
    location: "Apex Mall, Lal Kothi, Tonk Road",
    area: "Tonk Road, Jaipur",
    distance: "2.4 km away",
    image: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&q=80&w=600",
    tags: ["Verified", "QR Enabled"],
    hasOffer: true,
    offerText: "Get Free De-tan with Facials",
    services: [
      { name: "Hydra Facial Glow Therapy", price: 2999, duration: "75 mins", category: "Skin" },
      { name: "Moroccan Hair Spa & Massage", price: 1200, duration: "50 mins", category: "Hair" },
      { name: "Luxury Gel Pedicure", price: 799, duration: "45 mins", category: "Nails" },
      { name: "Threading & Waxing Combo", price: 299, duration: "20 mins", category: "Skin" }
    ]
  },
  {
    id: "salon-3",
    name: "The Royal Touch Male Grooming",
    rating: 4.7,
    reviewsCount: 145,
    location: "E-3, Vaishali Marg",
    area: "Vaishali Nagar, Jaipur",
    distance: "4.1 km away",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
    tags: ["Verified", "Male Only", "Trending"],
    hasOffer: false,
    services: [
      { name: "Royal Beard Styling & Shave", price: 249, duration: "25 mins", category: "Hair" },
      { name: "Advanced Anti-Hairfall Treatment", price: 1499, duration: "40 mins", category: "Hair" },
      { name: "Charcoal Face Detox & Clean-up", price: 450, duration: "30 mins", category: "Skin" },
      { name: "Classic Haircut & Scalp Massage", price: 350, duration: "30 mins", category: "Hair" }
    ]
  },
  {
    id: "salon-4",
    name: "Urban Bloom Beauty Studio",
    rating: 4.6,
    reviewsCount: 88,
    location: "Sector 3, Shipra Path",
    area: "Mansarovar, Jaipur",
    distance: "5.3 km away",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
    tags: ["Verified", "Budget Friendly"],
    hasOffer: true,
    offerText: "10% Off on all Nail Arts",
    services: [
      { name: "Detox Mani-Pedi Combo", price: 899, duration: "55 mins", category: "Nails" },
      { name: "Premium Keratin Therapy", price: 3999, duration: "150 mins", category: "Hair" },
      { name: "Saffron Instant Glow Facial", price: 999, duration: "45 mins", category: "Skin" }
    ]
  }
];

export const JOBS_DATA: Job[] = [
  {
    id: "job-1",
    title: "Senior Hair Stylist (Male/Female)",
    salon_name: "Chique Salon & Luxury Spa",
    location: "C-Scheme, Jaipur",
    job_type: "Full-Time",
    salary_range: "₹35,000 - ₹50,000 / month",
    experience_level: "3-5 Years",
    perks: ["Free Accommodation", "High Commision on Products", "Annual Bonus", "Health Insurance"]
  },
  {
    id: "job-2",
    title: "Nail Art Technician & Expert",
    salon_name: "Zoya Hair & Beauty Lounge",
    location: "Tonk Road, Jaipur",
    job_type: "Full-Time",
    salary_range: "₹25,000 - ₹32,000 / month",
    experience_level: "1-2 Years",
    perks: ["Flexible Shift", "Product Sales Commission", "Weekly Offs"]
  },
  {
    id: "job-3",
    title: "L'Oreal Certified Senior Colorist",
    salon_name: "The Royal Touch Male Grooming",
    location: "Vaishali Nagar, Jaipur",
    job_type: "Contract-Based",
    salary_range: "₹40,000 - ₹55,000 / month",
    experience_level: "5+ Years",
    perks: ["Travel Allowance", "Brand Masterclass Access", "Daily Tips Retention"]
  }
];

export const PARTNERS_DATA: GrowthPartner[] = [
  {
    id: "partner-1",
    name: "Rajesh Sharma",
    role: "Area Growth Manager",
    city: "Jaipur Central",
    earnings: "₹72,400 earned last month",
    quote: "By onboarding 14 premium salons onto Nexora SalonOS in C-Scheme, I built a recurring lifetime revenue share. Nexora provides perfect local support!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "partner-2",
    name: "Anjali Mehta",
    role: "Freelance Beauty Ambassador",
    city: "Malviya Nagar",
    earnings: "₹48,900 earned last month",
    quote: "I introduce local home-salons and beauty professionals to the Nexora Website Builder. They get a free booking page, and I get paid weekly!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  }
];

export const BRANDS_DATA: BrandPartner[] = [
  {
    id: "brand-1",
    name: "L'Oréal Professionnel",
    category: "Hair Care & Styling",
    logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=100", // Generic pretty item
    discount: "Up to 22% Bulk discount",
    perk: "Direct delivery from distributor warehouse via Nexora Brand Store"
  },
  {
    id: "brand-2",
    name: "O3+ Professional",
    category: "Skin Care & Facials",
    logo: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=100",
    discount: "Flat 18% Off for SalonOS Members",
    perk: "Certified training sessions & branding kits free for your salon staff"
  },
  {
    id: "brand-3",
    name: "Streax Professional",
    category: "Hair Color & Care",
    logo: "https://images.unsplash.com/photo-1526413232644-8a409774958a?auto=format&fit=crop&q=80&w=100",
    discount: "Extra 5% Cashback on Nexora QR Orders",
    perk: "Priority distributor routing with 24-hour delivery in Jaipur"
  }
];

export const THEMES_DATA: WebsiteTheme[] = [
  {
    id: "theme-warm",
    name: "Warm Editorial",
    bgClass: "bg-amber-50/50",
    textClass: "text-amber-950",
    primaryColor: "bg-amber-800 hover:bg-amber-900 text-white",
    accentColor: "border-amber-200 text-amber-800 bg-amber-100/50",
    fontClass: "font-serif"
  },
  {
    id: "theme-modern",
    name: "Minimalist Slate",
    bgClass: "bg-slate-50",
    textClass: "text-slate-900",
    primaryColor: "bg-slate-900 hover:bg-slate-800 text-white",
    accentColor: "border-slate-200 text-slate-800 bg-slate-100",
    fontClass: "font-sans"
  },
  {
    id: "theme-royal",
    name: "Royal Purple",
    bgClass: "bg-purple-50/40",
    textClass: "text-purple-950",
    primaryColor: "bg-purple-700 hover:bg-purple-800 text-white",
    accentColor: "border-purple-200 text-purple-700 bg-purple-100/40",
    fontClass: "font-sans"
  },
  {
    id: "theme-rose",
    name: "Rose Boutique",
    bgClass: "bg-rose-50/30",
    textClass: "text-rose-950",
    primaryColor: "bg-rose-600 hover:bg-rose-700 text-white",
    accentColor: "border-rose-200 text-rose-700 bg-rose-100/30",
    fontClass: "font-sans"
  }
];
