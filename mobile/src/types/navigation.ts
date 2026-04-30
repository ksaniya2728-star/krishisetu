import type { UserRole } from './auth';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  RoleSelection: { formValues: Record<string, string> } | undefined;
};

export type FarmerStackParamList = {
  FarmerHome: undefined;
  AddProduce: undefined;
  FarmerOrders: undefined;
  FarmerEarnings: undefined;
  Profile: undefined;
};

export type ConsumerStackParamList = {
  ConsumerHome: undefined;
  ProductDetail: { productId: string };
  ConsumerCart: undefined;
  ConsumerOrders: undefined;
  OrderTracking: { orderId: string };
  CommunityBasket: undefined;
  Profile: undefined;
};

export type AppTabsParamList = {
  FarmerTabs: undefined;
  ConsumerTabs: undefined;
};

export type RootNavigationState = {
  role?: UserRole;
};

