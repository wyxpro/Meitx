import type {
  Merchant,
  MerchantListItem,
  PainPoint,
  MarketingPackage,
  AcceptancePrediction,
  Script,
  SeasonalInsight,
  MerchantBenchmark,
  MerchantOperationData,
  MerchantCommunicationData,
} from '@/types/merchant';

const now = new Date();
const currentMonth = now.getMonth() + 1;

// 真实商家头像图片（餐厅/店铺门头）
export const MERCHANT_AVATARS = [
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_dc313d37-cac8-4ded-8e60-56945927097e.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_87a2cf03-b03a-45da-abca-07fd6defb7e1.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_eb42f7c6-8f23-41d0-91fc-78bc185230f7.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_f9298045-c66d-4be5-ba6b-5120e9f1b7d6.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_6776b193-48fe-4859-9f68-e64392de190b.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_ec11362a-4826-4107-a8f8-7565e0603646.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_a84a1ef8-edec-4813-bfc7-e72986316343.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_ae7c7b2a-3ee7-4fe9-b361-02f82ec4efb0.jpg',
];

export function getRealAvatarUrl(name: string): string {
  if (!name) return MERCHANT_AVATARS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return MERCHANT_AVATARS[sum % MERCHANT_AVATARS.length];
}

function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function generateBenchmark(category: string): MerchantBenchmark {
  const baseMap: Record<string, number> = {
    餐饮: 85000,
    丽人: 42000,
    休闲娱乐: 38000,
    酒店旅游: 120000,
    亲子教育: 56000,
    运动健身: 48000,
    生活服务: 35000,
    医疗健康: 92000,
  };
  const base = baseMap[category] ?? 50000;
  return {
    categoryAverageSales: Math.round(base * (0.9 + Math.random() * 0.3)),
    categoryAverageOrders: Math.round((base / 45) * (0.8 + Math.random() * 0.4)),
    categoryAverageAov: Math.round(40 + Math.random() * 60),
    top10PercentSales: Math.round(base * 1.8),
    seasonFactor: Number((0.8 + Math.random() * 0.5).toFixed(2)),
    trendDirection: Math.random() > 0.4 ? 'up' : 'stable',
  };
}

function generatePainPoints(category: string, operationData: MerchantOperationData): PainPoint[] {
  const painPoints: PainPoint[] = [];

  if (operationData.salesGrowthRate < 0) {
    painPoints.push({
      id: 'pp-1',
      title: '销售额环比下滑',
      causeAnalysis: `本月销售额环比下滑 ${Math.abs(operationData.salesGrowthRate).toFixed(1)}%，主要受客流减少与同商圈竞品分流影响，需通过精准套餐与曝光提升挽回。`,
      revenueShortcoming: '预计每月流失营收约 1.2-1.8 万元，若持续将影响全年续约。',
      sourceData: ['月销售额', '环比增长率', '商圈均值'],
      severity: 'high',
    });
  }

  if (operationData.averageOrderValue < 55) {
    painPoints.push({
      id: 'pp-2',
      title: '客单价低于同品类均值',
      causeAnalysis: `当前客单价 ${operationData.averageOrderValue} 元，低于同品类均值，菜单结构中高利润单品占比不足，连带销售机会未被挖掘。`,
      revenueShortcoming: '每笔订单少收 8-15 元，按当前月单量测算，月增收空间约 0.8-1.5 万元。',
      sourceData: ['客单价', '同品类均值', '菜单结构'],
      severity: 'medium',
    });
  }

  if (operationData.rating < 4.2) {
    painPoints.push({
      id: 'pp-3',
      title: '门店评分拖低转化',
      causeAnalysis: `评分 ${operationData.rating} 低于 4.2，用户评价中多次提及服务响应慢/出品不稳定，影响新客下单决策。`,
      revenueShortcoming: '评分每提升 0.1，下单转化率约提升 2-3%，当前月流失潜客约 200-300 人。',
      sourceData: ['门店评分', '用户评价标签', '转化率'],
      severity: 'high',
    });
  }

  if (painPoints.length < 3) {
    painPoints.push({
      id: 'pp-4',
      title: '高峰时段产能利用率不足',
      causeAnalysis: '午晚高峰订单集中，但出餐/服务能力存在瓶颈，导致部分用户流失；平峰时段又缺乏引流手段。',
      revenueShortcoming: '高峰时段每流失 10% 订单，月营收减少约 0.5-0.9 万元；平峰时段闲置成本同样较高。',
      sourceData: ['订单时段分布', '产能利用率', '流失订单'],
      severity: 'medium',
    });
  }

  return painPoints.slice(0, 3);
}

function generatePackages(category: string, painPoints: PainPoint[]): MarketingPackage[] {
  const packages: MarketingPackage[] = [
    {
      id: 'pkg-1',
      name: '曝光提升计划·Pro',
      type: '流量包',
      description: '通过首页推荐位加权、搜索关键词优化与定向推送，提升门店曝光与进店转化。',
      adaptReason: `匹配痛点「${painPoints[0]?.title ?? '流量不足'}」，直接解决获客难题。`,
      optimizationDirection: '短期提升曝光量 30%+，重点投放同商圈潜在人群。',
      estimatedOrderLift: 25,
      estimatedSalesLift: 18,
      estimatedRoi: 280,
      price: 2999,
    },
    {
      id: 'pkg-2',
      name: '套餐组合增收包',
      type: '转化包',
      description: '基于品类热销组合设计满减/多人套餐，提升客单价与下单转化率。',
      adaptReason: `匹配${category}品类消费特征，通过套餐组合拉动客单价与复购。`,
      optimizationDirection: '主推高毛利组合，设置阶梯满减，预计客单价提升 10-15 元。',
      estimatedOrderLift: 12,
      estimatedSalesLift: 22,
      estimatedRoi: 350,
      price: 1999,
    },
  ];
  return packages;
}

function generateAcceptance(
  communicationData: MerchantCommunicationData,
  operationData: MerchantOperationData
): AcceptancePrediction {
  let score = 50;
  score += communicationData.connectionRate * 0.3;
  score += Math.min(operationData.salesGrowthRate * 2, 15);
  score += communicationData.historicalContracts * 8;
  score -= communicationData.rejectionCount * 5;

  const level = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
  const riskWarnings: Record<'high' | 'medium' | 'low', string> = {
    high: '历史配合度高，建议优先跟进并快速推进签约。',
    medium: '存在竞品干扰或决策周期较长，建议持续触达并提供案例。',
    low: '接通率低或历史拒单较多，建议先建立信任，避免强推。',
  };

  return {
    score: Math.min(Math.max(Math.round(score), 0), 100),
    level,
    riskWarning: riskWarnings[level],
    keyFactors: ['接通率', '历史签约记录', '销售额增长率', '品类匹配度'],
  };
}

function generateScripts(
  merchant: Merchant,
  scene: 'phone' | 'wechat' | 'face_to_face'
): Script {
  const { basicInfo, operationData, painPoints, recommendedPackages, acceptancePrediction, communicationData } = merchant;
  const firstPain = painPoints[0];
  const pkg = recommendedPackages[0];

  const bossStyleMap: Record<string, string> = {
    price_sensitive: '注重投入产出',
    quality_focused: '关注长期品质',
    busy: '时间宝贵',
    conservative: '决策谨慎',
    active: '愿意尝试新事物',
  };

  const contentMap: Record<string, string> = {
    phone: `您好，请问是${basicInfo.name}的${basicInfo.managerName}老板吗？我是美团阿波罗的运营顾问小王。关注到咱们店最近${firstPain?.title ?? '经营数据有些波动'}，本月销售额${(operationData.monthlySales / 10000).toFixed(1)}万，环比${operationData.salesGrowthRate >= 0 ? '增长' : '下降'}${Math.abs(operationData.salesGrowthRate).toFixed(1)}%。结合同商圈${basicInfo.category}门店数据，我这边有一个「${pkg?.name ?? '曝光提升计划'}」，预计能帮咱们月增收${pkg?.estimatedSalesLift ?? 15}%左右，ROI 能达到${pkg?.estimatedRoi ?? 250}%以上。老板您看今天下午或明天上午，我花3分钟给您详细介绍一下方案？`,
    wechat: `${basicInfo.managerName}老板您好，我是美团阿波罗运营小王。刚看了下咱们${basicInfo.name}的经营数据，发现${firstPain?.title ?? '有一些提升空间'}。针对这个情况，我匹配了一个「${pkg?.name ?? '曝光提升计划'}」，预计能帮门店月增收约${pkg?.estimatedSalesLift ?? 15}%，投入${pkg?.price ?? 2999}元。给您发了方案简要，您方便时看一下，有任何问题随时问我。`,
    face_to_face: `${basicInfo.managerName}老板您好，感谢您抽空见面。我这次来主要是想和您聊聊${basicInfo.name}最近的数据表现：本月销售额${(operationData.monthlySales / 10000).toFixed(1)}万，${firstPain?.title ?? '整体平稳'}。我们分析了同商圈${basicInfo.category}标杆店的做法，结合您${bossStyleMap[communicationData.bossStyle] ?? '门店的特点'}，定制了一套「${pkg?.name ?? '增收方案'}」。预计执行后月订单可提升${pkg?.estimatedOrderLift ?? 15}%，销售额提升${pkg?.estimatedSalesLift ?? 15}%。您看哪个方面想先深入了解？`,
  };

  const durationMap: Record<string, string> = {
    phone: '30-60秒',
    wechat: '1-2分钟阅读',
    face_to_face: '5-10分钟',
  };

  return {
    id: `script-${scene}`,
    scene,
    content: contentMap[scene],
    duration: durationMap[scene],
    keyPoints: ['点明数据事实', '指出核心痛点', '给出套餐与预估收益', '引导下一步动作'],
  };
}

function generateSeasonalInsight(category: string): SeasonalInsight {
  const seasonMap: Record<string, string> = {
    餐饮: '暑期/夜宵旺季',
    丽人: '节假日前美容高峰',
    休闲娱乐: '周末与节假日',
    酒店旅游: '暑期出游旺季',
    亲子教育: '开学季/寒暑假',
    运动健身: '夏季减脂旺季',
    生活服务: '换季家政高峰',
    医疗健康: '体检季/换季',
  };

  return {
    season: seasonMap[category] ?? '当前旺季',
    opportunity: `${currentMonth}月${category}品类搜索热度上升，建议提前布局关键词与套餐预热，抢占流量窗口。`,
    risk: '若竞品已提前上线活动，可能分流高意向用户，需加快上线节奏。',
    shortTermPlan: '1）本周内完成套餐配置；2）上线前3天加大曝光投放；3）每日监控转化并微调出价。',
  };
}

export function getMockMerchantById(id: string): Merchant {
  const category = ['餐饮', '丽人', '休闲娱乐', '酒店旅游', '亲子教育', '运动健身', '生活服务', '医疗健康'][
    id.charCodeAt(0) % 8
  ];

  const monthlySales = Math.round(30000 + Math.random() * 150000);
  const monthlyOrders = Math.round(monthlySales / (40 + Math.random() * 50));
  const averageOrderValue = Math.round(monthlySales / monthlyOrders);
  const lastMonthSales = Math.round(monthlySales * (0.85 + Math.random() * 0.35));
  const lastMonthOrders = Math.round(monthlyOrders * (0.85 + Math.random() * 0.35));

  const name = `测试${category}门店-${id.slice(-4)}`;
  const basicInfo: Merchant['basicInfo'] = {
    id,
    name,
    category,
    subCategory: `${category}子类`,
    openDays: 365 + Math.floor(Math.random() * 1000),
    address: '北京市朝阳区测试街道88号',
    contactPhone: formatPhone(`138${String(Math.random()).slice(2, 10)}`),
    managerName: '王老板',
    avatarUrl: getRealAvatarUrl(name),
  };

  const operationData: Merchant['operationData'] = {
    monthlySales,
    monthlyOrders,
    averageOrderValue,
    lastMonthSales,
    lastMonthOrders,
    salesGrowthRate: Number(((monthlySales - lastMonthSales) / lastMonthSales * 100).toFixed(1)),
    orderGrowthRate: Number(((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)),
    peakHours: ['11:00-13:00', '17:00-19:00'],
    rating: Number((3.8 + Math.random() * 1.4).toFixed(1)),
  };

  const communicationData: Merchant['communicationData'] = {
    connectionRate: Math.round(40 + Math.random() * 55),
    historicalContracts: Math.floor(Math.random() * 5),
    rejectionCount: Math.floor(Math.random() * 4),
    acceptanceTags: ['关注曝光', '预算有限', '希望先试'],
    lastContactDate: '2026-06-20',
    preferredContactTime: '工作日下午 14:00-17:00',
    bossStyle: ['price_sensitive', 'quality_focused', 'busy', 'conservative', 'active'][Math.floor(Math.random() * 5)] as Merchant['communicationData']['bossStyle'],
  };

  const benchmark = generateBenchmark(category);
  const painPoints = generatePainPoints(category, operationData);
  const recommendedPackages = generatePackages(category, painPoints);
  const acceptancePrediction = generateAcceptance(communicationData, operationData);
  const seasonalInsight = generateSeasonalInsight(category);

  const merchant: Merchant = {
    basicInfo,
    operationData,
    communicationData,
    benchmark,
    painPoints,
    recommendedPackages,
    acceptancePrediction,
    scripts: [],
    seasonalInsight,
    dataQualityNotes: ['已过滤测试订单', '手机号已脱敏', '数据更新至昨日'],
    isTestStore: false,
    isClosed: false,
    hasAbnormalOrder: false,
  };

  merchant.scripts = (['phone', 'wechat', 'face_to_face'] as const).map((scene) => generateScripts(merchant, scene));

  return merchant;
}

export function getMockMerchantList(params?: {
  count?: number;
  filters?: { category?: string; level?: 'high' | 'medium' | 'low' };
}): MerchantListItem[] {
  // 7 家固定不同品类、不同意向、头像各不相同的商家
  const FIXED_MERCHANTS: Array<{
    id: string; name: string; category: string;
    monthlySales: number; monthlyOrders: number; connectionRate: number;
    acceptanceLevel: 'high' | 'medium' | 'low';
    potentialScore: number; advantageTags: string[];
    seasonPotential: 'high' | 'medium' | 'low';
    address: string; contactPhone: string; managerName: string;
  }> = [
    { id: 'm-1001', name: '蜀香麻辣烫旗舰店',   category: '餐饮',   monthlySales: 128000, monthlyOrders: 2560, connectionRate: 82, acceptanceLevel: 'high',   potentialScore: 92, advantageTags: ['高流水','高意向','好评店'], seasonPotential: 'high',   address: '北京市朝阳区三里屯路18号', contactPhone: '138****8801', managerName: '陈老板' },
    { id: 'm-1002', name: '美颜造型美容工作室',  category: '丽人',   monthlySales: 46000,  monthlyOrders: 320,  connectionRate: 68, acceptanceLevel: 'medium', potentialScore: 74, advantageTags: ['潜力门店','易接通'],   seasonPotential: 'medium', address: '上海市徐汇区衡山路66号', contactPhone: '139****2202', managerName: '刘老板' },
    { id: 'm-1003', name: '欢乐星球亲子乐园',   category: '亲子教育', monthlySales: 68000, monthlyOrders: 890,  connectionRate: 75, acceptanceLevel: 'high',   potentialScore: 88, advantageTags: ['高意向','好评店'],      seasonPotential: 'high',   address: '广州市天河区体育西路123号', contactPhone: '137****3303', managerName: '张老板' },
    { id: 'm-1004', name: '活力健身俱乐部',     category: '运动健身', monthlySales: 52000, monthlyOrders: 410,  connectionRate: 55, acceptanceLevel: 'medium', potentialScore: 68, advantageTags: ['潜力门店'],             seasonPotential: 'medium', address: '深圳市南山区科技园路45号', contactPhone: '136****4404', managerName: '王老板' },
    { id: 'm-1005', name: '悦享生活洗护服务',   category: '生活服务', monthlySales: 38000, monthlyOrders: 560,  connectionRate: 48, acceptanceLevel: 'low',    potentialScore: 52, advantageTags: ['潜力门店'],             seasonPotential: 'low',    address: '成都市武侯区天府大道88号', contactPhone: '135****5505', managerName: '李老板' },
    { id: 'm-1006', name: '皇家湾酒店度假村',   category: '酒店旅游', monthlySales: 186000, monthlyOrders: 980, connectionRate: 88, acceptanceLevel: 'high',   potentialScore: 95, advantageTags: ['高流水','高意向','易接通'], seasonPotential: 'high', address: '杭州市西湖区湖滨路1号',   contactPhone: '134****6606', managerName: '赵老板' },
    { id: 'm-1007', name: '春林休闲棋牌茶馆',   category: '休闲娱乐', monthlySales: 41000, monthlyOrders: 620,  connectionRate: 61, acceptanceLevel: 'medium', potentialScore: 71, advantageTags: ['潜力门店'],             seasonPotential: 'medium', address: '武汉市江汉区解放大道203号', contactPhone: '133****7707', managerName: '孙老板' },
  ];

  const list: MerchantListItem[] = FIXED_MERCHANTS.map((m, idx) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    monthlySales: m.monthlySales,
    monthlyOrders: m.monthlyOrders,
    connectionRate: m.connectionRate,
    acceptanceLevel: m.acceptanceLevel,
    potentialScore: m.potentialScore,
    advantageTags: m.advantageTags,
    seasonPotential: m.seasonPotential,
    avatarUrl: MERCHANT_AVATARS[idx % MERCHANT_AVATARS.length],
    address: m.address,
    contactPhone: m.contactPhone,
    managerName: m.managerName,
  }));

  // 支持过滤
  const filtered = list.filter(item => {
    if (params?.filters?.category && item.category !== params.filters.category) return false;
    if (params?.filters?.level && item.acceptanceLevel !== params.filters.level) return false;
    return true;
  });

  return filtered.sort((a, b) => b.potentialScore - a.potentialScore);
}

export function filterMockMerchantList(
  list: MerchantListItem[],
  filters: {
    salesMin?: number;
    salesMax?: number;
    category?: string;
    connectionRateMin?: number;
    acceptanceLevel?: 'high' | 'medium' | 'low';
    seasonPotential?: 'high' | 'medium' | 'low';
    keyword?: string;
  }
): MerchantListItem[] {
  return list.filter((item) => {
    if (filters.salesMin !== undefined && item.monthlySales < filters.salesMin) return false;
    if (filters.salesMax !== undefined && item.monthlySales > filters.salesMax) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.connectionRateMin !== undefined && item.connectionRate < filters.connectionRateMin) return false;
    if (filters.acceptanceLevel && item.acceptanceLevel !== filters.acceptanceLevel) return false;
    if (filters.seasonPotential && item.seasonPotential !== filters.seasonPotential) return false;
    if (filters.keyword && !item.name.includes(filters.keyword) && !item.category.includes(filters.keyword)) return false;
    return true;
  });
}

// LocalStorage helpers for synchronization
export function getStoredMerchants(): MerchantListItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('meitx_merchants');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  const defaults = getMockMerchantList();
  localStorage.setItem('meitx_merchants', JSON.stringify(defaults));
  return defaults;
}

export function saveStoredMerchants(merchants: MerchantListItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('meitx_merchants', JSON.stringify(merchants));
}

export function getStoredCommRecords(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('meitx_comm_records');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  const defaults = [
    { id: 'comm-0', merchant_name: '四季香餐厅', channel: 'phone', duration_minutes: 15, content: '介绍了曝光提升计划，老板表示有意向，约下周再谈', result: 'connected', contact_time: new Date().toISOString(), operator: '王小明' },
    { id: 'comm-1', merchant_name: '美丽时光美发', channel: 'wechat', duration_minutes: null, content: '电话告知最新活动方案，对方未接听', result: 'no_answer', contact_time: new Date(Date.now() - 3600000 * 2).toISOString(), operator: '李晓红' },
    { id: 'comm-2', merchant_name: '欢乐星球亲子乐园', channel: 'face_to_face', duration_minutes: null, content: '面谈深入了解暑期需求，签署了试用协议', result: 'signed', contact_time: new Date(Date.now() - 3600000 * 5).toISOString(), operator: '张伟' },
    { id: 'comm-3', merchant_name: '活力健身俱乐部', channel: 'wechat', duration_minutes: null, content: '微信发送了数据报告，对方已查看', result: 'follow_up', contact_time: new Date(Date.now() - 86400000).toISOString(), operator: '陈静' },
    { id: 'comm-4', merchant_name: '悦享生活洗护服务', channel: 'phone', duration_minutes: 8, content: '沟通套餐价格，老板对 ROI 有疑虑，已发送案例', result: 'rejected', contact_time: new Date(Date.now() - 86400000 * 2).toISOString(), operator: '王小明' },
  ];
  localStorage.setItem('meitx_comm_records', JSON.stringify(defaults));
  return defaults;
}

export function saveStoredCommRecords(records: any[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('meitx_comm_records', JSON.stringify(records));
}

export function getStoredFollowUps(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('meitx_follow_ups');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  const defaults = [
    { id: 'fu-1', name: '四季香餐厅',   time: '今日 15:00', priority: 'high',   reason: '昨日意向较强，需确认签约',    done: false },
    { id: 'fu-2', name: '美丽时光美发', time: '明日 10:00', priority: 'high',   reason: '对曝光套餐有疑问',            done: false },
    { id: 'fu-3', name: '活力健身俱乐部',     time: '后天 14:00', priority: 'medium', reason: '跟进暑期活动方案',            done: false },
    { id: 'fu-4', name: '春林休闲棋牌茶馆',     time: '3天后',      priority: 'low',    reason: '常规季度回访',                done: false },
  ];
  localStorage.setItem('meitx_follow_ups', JSON.stringify(defaults));
  return defaults;
}

export function saveStoredFollowUps(followUps: any[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('meitx_follow_ups', JSON.stringify(followUps));
}

export function isThisMonth(dateStr: string | Date): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function isLastMonth(dateStr: string | Date): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth() - 1;
  if (targetMonth < 0) {
    targetMonth = 11;
    targetYear -= 1;
  }
  return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
}

