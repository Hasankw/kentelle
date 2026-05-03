export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  howToUse: string | null;
  routine: string | null;
  cautions: string | null;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  isActive: boolean;
  categories: Category[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  image: string | null;
  sortOrder: number;
}

export interface SkinConcern {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
}

export interface BillingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  body: string;
  productName: string | null;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  publishedAt: Date | null;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  reviewed: boolean;
  createdAt: Date;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  message: string;
  status: "ACTIVE" | "REDEEMED";
  redeemedAt: Date | null;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export type SortOption =
  | "featured"
  | "best_selling"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "oldest"
  | "alpha_asc"
  | "alpha_desc";
