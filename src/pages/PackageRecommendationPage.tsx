import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift, TrendingUp, ArrowUpRight, CheckCircle2, Search,
  Filter, Star, ChevronRight, Target, Sparkles, Package,
  BarChart3, Zap, Crown, RefreshCw
} from 'lucide-react';
import { getMockMerchantList } from '@/services/mockData';
import { getMockMerchantById } from '@/services/mockData';
import { CATEGORIES } from '@/types/merchant';
import { toast } from 'sonner';

const categoryOptions = CATEGORIES.slice(0, 8);

// 套餐类型徽章颜色
const pkgTypeColor: Record<string, string> = {
  '曝光提升': 'bg-primary/10 text-primary border-primary/20',
  '新客专享': 'bg-success/10 text-success border-success/20',
  '品质认证': 'bg-warning/10 text-warning border-warning/20',
  '外卖优化': 'bg-accent/10 text-accent border-accent/20',
  '活动营销': 'bg-destructive/10 text-destructive border-destructive/20',
};

function getPkgTypeColor(type: string) {
  return pkgTypeColor[type] ?? 'bg-muted text-muted-foreground border-border';
}

// 统计卡片数据
const summaryStats = [
  { label: '今日推荐商家', value: '38', icon: Target, color: 'text-primary', sub: '较昨日 +5' },
  { label: '高 ROI 套餐', value: '12', icon: Crown, color: 'text-warning', sub: '预估 ROI>200%' },
  { label: '本周待推送', value: '156', icon: Package, color: 'text-success', sub: '待联系推荐' },
  { label: '本月签约转化', value: '8.4%', icon: TrendingUp, color: 'text-accent', sub: '环比+1.2%' },
];

export default function PackageRecommendationPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('roi');
  const [activeTab, setActiveTab] = useState('merchants');

  const merchants = useMemo(() => getMockMerchantList({ count: 30 }), []);

  const filteredMerchants = useMemo(() => {
    let list = merchants;
    if (keyword) list = list.filter(m => m.name.includes(keyword) || m.category.includes(keyword));
    if (category !== 'all') list = list.filter(m => m.category === category);
    return list.slice(0, 20);
  }, [merchants, keyword, category]);

  // 获取某商家的套餐推荐（通过完整商家数据）
  const merchantsWithPackages = useMemo(() => {
    return filteredMerchants.map(m => {
      const full = getMockMerchantById(m.id);
      return { ...m, packages: full.recommendedPackages, painPoints: full.painPoints };
    });
  }, [filteredMerchants]);

  // 汇总所有套餐
  const allPackages = useMemo(() => {
    const pkgs: Array<{ pkg: typeof merchantsWithPackages[0]['packages'][0]; merchantName: string; merchantId: string }> = [];
    merchantsWithPackages.forEach(m => {
      m.packages.forEach(p => pkgs.push({ pkg: p, merchantName: m.name, merchantId: m.id }));
    });
    if (sortBy === 'roi') pkgs.sort((a, b) => b.pkg.estimatedRoi - a.pkg.estimatedRoi);
    if (sortBy === 'lift') pkgs.sort((a, b) => b.pkg.estimatedSalesLift - a.pkg.estimatedSalesLift);
    if (sortBy === 'price') pkgs.sort((a, b) => b.pkg.price - a.pkg.price);
    return pkgs.slice(0, 24);
  }, [merchantsWithPackages, sortBy]);

  return (
    <AppLayout title="智能套餐推荐">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* 说明 Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-sm border-primary/20 bg-primary/5 shadow-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">AI 智能套餐匹配</p>
                <p className="text-xs text-muted-foreground mt-0.5">系统基于商家经营痛点、品类属性、销售额档位和历史数据，自动匹配最优营销套餐组合，预估 ROI 和增长潜力供参考。</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <TabsList className="rounded-sm">
              <TabsTrigger value="merchants" className="rounded-sm text-xs gap-1.5"><Target className="w-3.5 h-3.5" />按商家推荐</TabsTrigger>
              <TabsTrigger value="packages" className="rounded-sm text-xs gap-1.5"><Package className="w-3.5 h-3.5" />套餐总览</TabsTrigger>
            </TabsList>
            {/* 筛选 */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜索商家..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9 rounded-sm text-xs w-40" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="品类" /></SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">全部品类</SelectItem>
                  {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {activeTab === 'packages' && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-sm w-32 text-xs"><SelectValue placeholder="排序" /></SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="roi">按 ROI 排序</SelectItem>
                    <SelectItem value="lift">按销售提升</SelectItem>
                    <SelectItem value="price">按价格</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* 按商家推荐 Tab */}
          <TabsContent value="merchants" className="space-y-4">
            {merchantsWithPackages.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="rounded-sm border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* 商家信息 */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                          {m.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{m.name}</span>
                            <Badge variant="outline" className="rounded-sm text-[10px] font-normal">{m.category}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>月销 ¥{(m.monthlySales / 10000).toFixed(1)}万</span>
                            <span>接通率 {m.connectionRate}%</span>
                          </div>
                          {/* 痛点 */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {m.painPoints.slice(0, 2).map(p => (
                              <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-destructive/10 text-destructive border border-destructive/20">
                                {p.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* 套餐推荐 */}
                      <div className="flex gap-3 flex-wrap md:flex-nowrap shrink-0">
                        {m.packages.slice(0, 2).map(pkg => (
                          <div key={pkg.id} className={`border rounded-sm p-3 min-w-0 flex-1 md:w-52 space-y-2`}>
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <p className="text-xs font-semibold leading-tight">{pkg.name}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border mt-1 inline-block ${getPkgTypeColor(pkg.type)}`}>{pkg.type}</span>
                              </div>
                              <p className="text-sm font-bold text-primary shrink-0">¥{pkg.price}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                              <div className="bg-muted/50 rounded-sm py-1">
                                <p className="font-bold text-success">+{pkg.estimatedOrderLift}%</p>
                                <p className="text-muted-foreground">订单</p>
                              </div>
                              <div className="bg-muted/50 rounded-sm py-1">
                                <p className="font-bold text-accent">+{pkg.estimatedSalesLift}%</p>
                                <p className="text-muted-foreground">销售</p>
                              </div>
                              <div className="bg-muted/50 rounded-sm py-1">
                                <p className="font-bold text-warning">{pkg.estimatedRoi}%</p>
                                <p className="text-muted-foreground">ROI</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* 操作 */}
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <Button size="sm" className="rounded-sm text-xs h-8" onClick={() => navigate(`/merchant/${m.id}`)}>
                          <Zap className="w-3.5 h-3.5 mr-1" />去推荐
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-sm text-xs h-8" onClick={() => toast.success(`已加入跟进队列：${m.name}`)}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />跟进
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {merchantsWithPackages.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                <Package className="w-10 h-10 mx-auto mb-3 text-muted" />
                <p>暂无符合条件的商家</p>
              </div>
            )}
          </TabsContent>

          {/* 套餐总览 Tab */}
          <TabsContent value="packages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPackages.map(({ pkg, merchantName, merchantId }, i) => (
                <motion.div key={`${merchantId}-${pkg.id}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card className="rounded-sm border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all h-full flex flex-col">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm leading-tight">{pkg.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{merchantName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">¥{pkg.price}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${getPkgTypeColor(pkg.type)}`}>{pkg.type}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{pkg.description}</p>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        {[
                          { label: '订单提升', value: pkg.estimatedOrderLift, color: 'bg-success' },
                          { label: '销售提升', value: pkg.estimatedSalesLift, color: 'bg-primary' },
                          { label: 'ROI', value: Math.min(pkg.estimatedRoi / 3, 100), displayVal: `${pkg.estimatedRoi}%`, color: 'bg-warning' },
                        ].map(item => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-semibold">{item.displayVal ?? `+${item.value}%`}</span>
                            </div>
                            <Progress value={item.value} className={`h-1.5 [&>div]:${item.color}`} />
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 w-full rounded-sm text-xs"
                        onClick={() => navigate(`/merchant/${merchantId}`)}
                      >
                        查看商家详情 <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
