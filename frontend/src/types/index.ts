export type Role = 'CUSTOMER' | 'ARTISAN' | 'ADMIN';
export type Language = 'en' | 'hi' | 'bn' | 'gu';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: Role;
  preferredLang: Language;
  avatarUrl?: string;
  artisanProfile?: ArtisanProfile;
}

export interface CraftCluster {
  id: string;
  slug: string;
  name: string;
  state: string;
  district: string;
  materialsUsed: string[];
  isGiTagged: boolean;
  giRegNumber?: string | null;
  typicalBreakagePct: number;
  description: string;
  heroImageUrl?: string;
  artisansCount?: number;
  productsCount?: number;
}

export interface ArtisanProfile {
  id: string;
  userId?: string;
  brandName: string;
  artisanName: string;
  artisanLineage?: string;
  storyNarrative: string;
  workshopAddress?: string;
  upiId?: string;
  bankAccountMasked?: string;
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  experienceYears: number;
  workshopSize: number;
  hourlyEarningBase?: number;
  voiceIntroAudioUrl?: string;
  cluster?: CraftCluster | { name: string; state: string; isGiTagged: boolean };
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface FragilitySpec {
  id: string;
  code: string;
  name: string;
  fragilityClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  packagingInstructions?: string;
  cushioningMaterial: string;
  dropTestRatingFeet: number;
  boxCostInr: number;
}

export interface FairShareBreakdown {
  grossRetail: number;
  artisanDirectPay: number;
  artisanSharePct: number;
  platformTechFee: number;
  platformFeePct: number;
  breakageReservePool: number;
  packagingReserve: number;
  comparison?: {
    commercialMiddlemanMarkup: number;
    commercialArtisanReceived: number;
    additionalArtisanBenefit: number;
    earningsMultiplier: string;
  };
}

export interface ProductVideo {
  url: string;
  label: string;
  isIllustrative?: boolean;
}

export interface CraftDetails {
  videos?: ProductVideo[];
  videoUrl?: string;
  makingProcess?: string;
  story?: string;
  heritage?: string;
  artForm?: string;
  materials?: string[];
  careInstructions?: string;
  collections?: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  vernacularTitles?: { [key in Language]?: string };
  description: string;
  vernacularDescs?: { [key in Language]?: string };
  category: string;
  subCategory?: string;
  craftDetails?: CraftDetails;
  isDemo?: boolean;
  isTrendingSample?: boolean;
  tags: string[];
  retailPrice: number;
  artisanBasePrice: number;
  marketBenchmarkPrice?: number;
  fairShareBreakdown?: FairShareBreakdown;
  stockQuantity: number;
  isMadeToOrder?: boolean;
  leadTimeDays?: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    weightGrams: number;
  };
  fragilityClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  safeTransitCertified: boolean;
  packagingSpec?: FragilitySpec;
  images: ProductImage[];
  cluster?: CraftCluster;
  artisan?: {
    id: string;
    brandName: string;
    artisanName: string;
    artisanLineage?: string;
    avatarUrl?: string;
  };
  reviewsCount?: number;
  averageRating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TrackingStep {
  status: string;
  title: string;
  timestamp: string;
  location: string;
  notes: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  artisanShareTotal: number;
  platformFeeTotal: number;
  packagingFeeTotal: number;
  shippingFeeTotal: number;
  status: string;
  safeTransitGuarantee: boolean;
  shippingAddress: any;
  items: Array<{
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    artisanUnitShare: number;
    subtotal: number;
    packagingStatus: string;
  }>;
  trackingTimeline?: TrackingStep[];
  carrierName?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface CustomCommission {
  id: string;
  commissionNumber: string;
  title: string;
  projectScope: string;
  patronBudget: number;
  agreedPrice?: number;
  status: string;
  digitalIpHash?: string;
  milestones: Array<{
    id: string;
    title: string;
    percentage: number;
    amount: number;
    status: string;
    patronApproved: boolean;
  }>;
  artisan?: {
    user: { fullName: string };
  };
}
