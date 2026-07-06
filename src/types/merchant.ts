export interface MerchantBasicInfo {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  openDays: number;
  address: string;
  contactPhone: string;
  managerName: string;
  avatarUrl?: string;
}

export interface MerchantOperationData {
  monthlySales: number;
  monthlyOrders: number;
  averageOrderValue: number;
  lastMonthSales: number;
  lastMonthOrders: number;
  salesGrowthRate: number;
  orderGrowthRate: number;
  peakHours: string[];
  rating: number;
}

export interface MerchantCommunicationData {
  connectionRate: number;
  historicalContracts: number;
  rejectionCount: number;
  acceptanceTags: string[];
  lastContactDate: string;
  preferredContactTime: string;
  bossStyle: 'price_sensitive' | 'quality_focused' | 'busy' | 'conservative' | 'active';
}

export interface MerchantBenchmark {
  categoryAverageSales: number;
  categoryAverageOrders: number;
  categoryAverageAov: number;
  top10PercentSales: number;
  seasonFactor: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface PainPoint {
  id: string;
  title: string;
  causeAnalysis: string;
  revenueShortcoming: string;
  sourceData: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface MarketingPackage {
  id: string;
  name: string;
  type: string;
  description: string;
  adaptReason: string;
  optimizationDirection: string;
  estimatedOrderLift: number;
  estimatedSalesLift: number;
  estimatedRoi: number;
  price: number;
}

export interface AcceptancePrediction {
  score: number;
  level: 'high' | 'medium' | 'low';
  riskWarning: string;
  keyFactors: string[];
}

export interface Script {
  id: string;
  scene: 'phone' | 'wechat' | 'face_to_face';
  content: string;
  duration: string;
  keyPoints: string[];
  feedback?: 'good' | 'bad' | null;
}

export interface SeasonalInsight {
  season: string;
  opportunity: string;
  risk: string;
  shortTermPlan: string;
}

export interface Merchant {
  basicInfo: MerchantBasicInfo;
  operationData: MerchantOperationData;
  communicationData: MerchantCommunicationData;
  benchmark: MerchantBenchmark;
  painPoints: PainPoint[];
  recommendedPackages: MarketingPackage[];
  acceptancePrediction: AcceptancePrediction;
  scripts: Script[];
  seasonalInsight: SeasonalInsight;
  dataQualityNotes: string[];
  isTestStore: boolean;
  isClosed: boolean;
  hasAbnormalOrder: boolean;
}

export interface MerchantFilterParams {
  salesMin?: number;
  salesMax?: number;
  category?: string;
  connectionRateMin?: number;
  acceptanceLevel?: 'high' | 'medium' | 'low';
  seasonPotential?: 'high' | 'medium' | 'low';
  keyword?: string;
}

export interface MerchantListItem {
  id: string;
  name: string;
  category: string;
  monthlySales: number;
  monthlyOrders: number;
  connectionRate: number;
  acceptanceLevel: 'high' | 'medium' | 'low';
  potentialScore: number;
  advantageTags: string[];
  seasonPotential: 'high' | 'medium' | 'low';
  avatarUrl?: string;
  address?: string;
  contactPhone?: string;
  managerName?: string;
}

export type SceneType = 'phone' | 'wechat' | 'face_to_face';

export const SCENE_OPTIONS: { value: SceneType; label: string }[] = [
  { value: 'phone', label: '电话触达' },
  { value: 'wechat', label: '微信文字' },
  { value: 'face_to_face', label: '深度面谈' },
];

export const CATEGORIES = [
  '餐饮',
  '丽人',
  '休闲娱乐',
  '酒店旅游',
  '亲子教育',
  '运动健身',
  '生活服务',
  '医疗健康',
];

export const ACCEPTANCE_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: '高意向',
  medium: '中意向',
  low: '低意向',
};

export const SEASON_POTENTIAL_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: '高增长潜力',
  medium: '稳定增长',
  low: '潜力有限',
};
