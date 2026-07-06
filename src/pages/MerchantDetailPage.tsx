import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Store, Phone, MapPin, Calendar, Star,
  TrendingUp, TrendingDown, Minus, ImageIcon, UtensilsCrossed,
  Package, Gift, CheckCircle2, ArrowUpRight, ExternalLink
} from 'lucide-react';
import { AIPluginPanel, AIPluginDrawer } from '@/components/merchant/AIPluginPanel';
import { getMockMerchantById } from '@/services/mockData';
import type { Merchant } from '@/types/merchant';
import { toast } from 'sonner';

// 真实店铺图片（按商家名称取余分配）
const REAL_STORE_IMAGES = [
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_dc313d37-cac8-4ded-8e60-56945927097e.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_87a2cf03-b03a-45da-abca-07fd6defb7e1.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_eb42f7c6-8f23-41d0-91fc-78bc185230f7.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_f9298045-c66d-4be5-ba6b-5120e9f1b7d6.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_6776b193-48fe-4859-9f68-e64392de190b.jpg',
];

// 真实菜谱图片
const REAL_MENU_IMAGES = [
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_f1a5161e-f054-42f5-8d29-4fc2d82f51c6.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_a76da3be-ecb8-46dc-b49b-63b248bb6c97.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_b3427738-3652-4c8a-b880-18d4132cedd7.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_dfb03079-29cb-41fb-a2cf-27095cc6704c.jpg',
  'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_40a49a33-d619-4584-814f-aeb25b1ebeb3.jpg',
];

function getStoreImages(name: string) {
  const base = name.charCodeAt(0) % REAL_STORE_IMAGES.length;
  return [
    REAL_STORE_IMAGES[base % REAL_STORE_IMAGES.length],
    REAL_STORE_IMAGES[(base + 1) % REAL_STORE_IMAGES.length],
    REAL_STORE_IMAGES[(base + 2) % REAL_STORE_IMAGES.length],
  ];
}

function getMenuImages(name: string) {
  const base = name.charCodeAt(0) % REAL_MENU_IMAGES.length;
  return [
    REAL_MENU_IMAGES[base % REAL_MENU_IMAGES.length],
    REAL_MENU_IMAGES[(base + 1) % REAL_MENU_IMAGES.length],
    REAL_MENU_IMAGES[(base + 2) % REAL_MENU_IMAGES.length],
    REAL_MENU_IMAGES[(base + 3) % REAL_MENU_IMAGES.length],
  ];
}

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (id) setMerchant(getMockMerchantById(id));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const TrendIcon = useMemo(() => {
    if (!merchant) return Minus;
    if (merchant.operationData.salesGrowthRate > 0) return TrendingUp;
    if (merchant.operationData.salesGrowthRate < 0) return TrendingDown;
    return Minus;
  }, [merchant]);

  if (loading || !merchant) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-48 rounded-sm" />
          <Skeleton className="h-64 w-full rounded-sm" />
          <Skeleton className="h-48 w-full rounded-sm" />
        </div>
        <div className="hidden lg:block w-[420px] border-l border-border">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  const storeImages = getStoreImages(merchant.basicInfo.name);
  const menuImages = getMenuImages(merchant.basicInfo.name);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm shrink-0" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm truncate">{merchant.basicInfo.name}</h1>
              <p className="text-[10px] text-muted-foreground truncate">商家详情 · {merchant.basicInfo.category}</p>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
            {/* 基础信息 */}
            <Card className="rounded-sm border-border shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  {/* 商家头像 */}
                  <div className="w-16 h-16 rounded-sm overflow-hidden bg-primary/10 border border-border shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(merchant.basicInfo.name)}&backgroundColor=1D6BFF&fontWeight=700&fontSize=40`}
                      alt={merchant.basicInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="text-xl font-bold">{merchant.basicInfo.name}</h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="secondary" className="rounded-sm font-normal">{merchant.basicInfo.category}</Badge>
                          <Badge variant="outline" className="rounded-sm font-normal">{merchant.basicInfo.subCategory}</Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">门店评分</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-lg font-bold">{merchant.operationData.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><span>{merchant.basicInfo.contactPhone}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0" /><span>开店 {Math.floor(merchant.basicInfo.openDays / 365)} 年</span></div>
                      <div className="flex items-center gap-2 sm:col-span-2"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{merchant.basicInfo.address}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 经营数据 */}
            <Card className="rounded-sm border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />经营数据
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '月销售额', value: `¥${(merchant.operationData.monthlySales / 10000).toFixed(1)}万` },
                    { label: '月订单量', value: String(merchant.operationData.monthlyOrders) },
                    { label: '客单价', value: `¥${merchant.operationData.averageOrderValue}` },
                    { label: '环比增长', value: `${merchant.operationData.salesGrowthRate >= 0 ? '+' : ''}${merchant.operationData.salesGrowthRate}%` },
                  ].map(item => (
                    <div key={item.label} className="bg-muted/50 rounded-sm p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendIcon className={`w-4 h-4 ${merchant.operationData.salesGrowthRate >= 0 ? 'text-success' : 'text-destructive'}`} />
                  <span>销售额较上月{merchant.operationData.salesGrowthRate >= 0 ? '增长' : '下降'} {Math.abs(merchant.operationData.salesGrowthRate)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* 店铺图片 / 菜谱图片 / 套餐信息 Tabs */}
            <Card className="rounded-sm border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />店铺详情
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="store-photos">
                  <TabsList className="rounded-sm mb-4">
                    <TabsTrigger value="store-photos" className="rounded-sm text-xs gap-1.5"><ImageIcon className="w-3.5 h-3.5" />店铺图片</TabsTrigger>
                    <TabsTrigger value="menu-photos" className="rounded-sm text-xs gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5" />菜谱图片</TabsTrigger>
                    <TabsTrigger value="packages" className="rounded-sm text-xs gap-1.5"><Package className="w-3.5 h-3.5" />套餐信息</TabsTrigger>
                  </TabsList>

                  {/* 店铺图片 */}
                  <TabsContent value="store-photos">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {storeImages.map((url, i) => (
                        <div key={i} className="aspect-video rounded-sm overflow-hidden border border-border bg-muted">
                          <img src={url} alt={`店铺图片${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">共 {storeImages.length} 张店铺实景图</p>
                  </TabsContent>

                  {/* 菜谱图片 */}
                  <TabsContent value="menu-photos">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {menuImages.map((url, i) => (
                        <div key={i} className="aspect-square rounded-sm overflow-hidden border border-border bg-muted">
                          <img src={url} alt={`菜品图片${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">共 {menuImages.length} 张菜品图片</p>
                  </TabsContent>

                  {/* 套餐信息 */}
                  <TabsContent value="packages">
                    <div className="space-y-4">
                      {merchant.recommendedPackages.map(pkg => (
                        <div key={pkg.id} className="border border-border rounded-sm p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Gift className="w-4 h-4 text-primary shrink-0" />
                                <h4 className="font-semibold text-sm">{pkg.name}</h4>
                                <Badge variant="secondary" className="rounded-sm text-[10px]">{pkg.type}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pkg.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-bold text-primary">¥{pkg.price}</p>
                              <p className="text-[10px] text-muted-foreground">/周期</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-success/10 rounded-sm py-2">
                              <p className="font-bold text-success">+{pkg.estimatedOrderLift}%</p>
                              <p className="text-muted-foreground text-[10px]">订单提升</p>
                            </div>
                            <div className="bg-primary/10 rounded-sm py-2">
                              <p className="font-bold text-primary">+{pkg.estimatedSalesLift}%</p>
                              <p className="text-muted-foreground text-[10px]">销售提升</p>
                            </div>
                            <div className="bg-warning/10 rounded-sm py-2">
                              <p className="font-bold text-warning">{pkg.estimatedRoi}%</p>
                              <p className="text-muted-foreground text-[10px]">预估 ROI</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded-sm p-2">
                            <span className="font-medium text-foreground">推荐理由：</span>{pkg.adaptReason}
                          </p>
                          <Button size="sm" className="w-full rounded-sm text-xs" onClick={() => toast.success(`已推荐套餐：${pkg.name}`)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />推荐此套餐给商家
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 历史沟通记录 */}
            <Card className="rounded-sm border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">历史沟通记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['2026-06-20 电话沟通 15 分钟，老板表示关注套餐价格', '2026-06-15 微信触达，发送活动方案未回复', '2026-06-10 面谈，了解暑期营销需求'].map((record, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-muted-foreground">{record}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="lg:hidden h-20" />
          </main>
        </ScrollArea>
      </div>

      {/* 桌面端侧边 AI 插件 */}
      <div className="hidden lg:block">
        <AIPluginPanel merchant={merchant} />
      </div>

      {/* 移动端 AI 插件抽屉按钮 */}
      <div className="lg:hidden">
        <AIPluginDrawer merchant={merchant} />
      </div>
    </div>
  );
}

