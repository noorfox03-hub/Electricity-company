export type UserRole = 'driver' | 'shipper' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  country_code: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: string; // مواد غذائية، مواد بناء...
  unit: string;
  quantity: number;
}

export interface Receiver {
  name: string;
  phone: string;
  address: string;
}

export interface Load {
  id: string;
  owner_id: string;
  
  // تفاصيل الشحنة الأساسية
  type: string; // بضائع عامة، إلخ
  package_type: string; // كرتون، شوال...
  
  origin: string;
  destination: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  
  pickupDate?: string;
  
  // المنتجات والمستلم (JSONB in DB)
  products?: Product[];
  receiver?: Receiver;
  
  distance: number;
  estimatedTime: string;
  weight: number;
  price: number;
  description?: string;
  
  truck_type_required: string;
  status: LoadStatus;
  created_at: string;
  
  // بيانات المالك (Joined Data)
  profiles?: {
    full_name: string;
    phone: string;
    country_code: string;
  };
}

export type LoadStatus = 'available' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TruckType = 
  | 'trella' 
  | 'lorry' 
  | 'dyna' 
  | 'pickup' 
  | 'refrigerated' 
  | 'tanker'
  | 'flatbed'
  | 'container'
  | 'unknown';

export type TrailerType = 
  | 'flatbed' 
  | 'curtain' 
  | 'box' 
  | 'refrigerated' 
  | 'lowboy' 
  | 'tank';

export type TruckDimensions = 
  | 'small' 
  | 'medium' 
  | 'large' 
  | 'extra_large';

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  country_code: string;
  avatar?: string;
  role: UserRole;
  currentCity: string;
  rating: number;
  completedTrips: number;
  isAvailable: boolean;
  truckType?: TruckType;
  created_at: string;
  driver_details?: {
    truck_type: TruckType;
    trailer_type: TrailerType;
    dimensions: TruckDimensions;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalShippers: number;
  activeLoads: number;
  completedTrips: number;
}
