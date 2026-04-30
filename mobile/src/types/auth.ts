export type UserRole = 'farmer' | 'consumer' | 'distributor';

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  onboardingCompleted: boolean;
  farmName?: string;
  apartmentName?: string;
  preferredDeliverySlot?: string;
  farmAddress?: string;
  profileImage?: string;
  location?: {
    village?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  availabilityStatus?: boolean;
  deliveryRadiusKm?: number;
  walletBalance?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

