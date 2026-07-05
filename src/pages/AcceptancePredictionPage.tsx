import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target, TrendingUp, AlertCircle, Activity, Search,
  ChevronRight, Zap, Phone, History, BarChart3, Tags,
  ShieldAlert, Flame, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { getMockMerchantList, getMockMerchantById } from '@/services/mockData';
import { CATEGORIES } from '@/types/merchant';
import { toast } from 'sonner';

const levelConfig = {
  high: { label: '高意向', color: 'bg-success text-success-foreground', textColor: 'text-success', borderColor: 'border-success/30', bg: 'bg-success/5', icon: ThumbsUp },
  medium: { label: '中意向', color: 'bg-warning text-warning-foreground', textColor: 'text-warning', borderColor: 'border-warning/30', bg: 'bg-warning/5', icon: Activity },
  low: { label: '低意向', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive', borderColor: 'border-destructive/30', bg: 'bg-destructive/5', icon: ThumbsDown },
};

const factorIcons: Record<string, React.ElementType> = {
  接通率: Phone,
  历史签约记录: History,
  销售额增长率: BarChart3,
  品类匹配度: Tags,
};

const summaryStats = [
  { label: '高意向商家', value: '42', icon: ThumbsUp, color: 'text-success', sub: '建议优先跟进' },
  { label: '中意向商家', value: '87', icon: Activity, color: 'text-warning', sub: '有潜力可挖掘' },
  { label: '低意向商家', value: '35', icon: ThumbsDown, color: 'text-destructive', sub: '暂缓接触' },
  { label: '平均预测分', value: '68.3', icon: BarChart3, color: 'text-primary', sub: '高于行业基准' },
];

export default function AcceptancePredictionPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [sortBy, setSortBy] = useState('score');

  const merchants = useMemo(() => getMockMerchantList({ count: 30 }), []);

  const merchantsWithPrediction = useMemo(() => {
    return merchants.map(m => {
      const full = getMockMerchantById(m.id);
      return { ...m, prediction: full.acceptancePrediction, painPoints: full.painPoints };
    });
  }, [merchants]);

  const filtered = useMemo(() => {
    let list = merchantsWithPrediction;
    if (keyword) list = list.filter(m => m.name.includes(keyword) || m.category.includes(keyword));
    if (category !== 'all') list = list.filter(m => m.category === category);
    if (levelFilter !== 'all') list = list.filter(m => m.prediction.level === levelFilter);
    if (sortBy === 'score') list = [...list].sort((a, b) => b.prediction.score - a.prediction.score);
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [merchantsWithPrediction, keyword, category, levelFilter, sortBy]);

  const stats = useMemo(() => {
    const high = merchantsWithPrediction.filter(m => m.prediction.level === 'high').length;
    const medium = merchantsWithPrediction.filter(m => m.prediction.level === 'medium').length;
    const low = merchantsWithPrediction.filter(m => m.prediction.level === 'low').length;
    return { high, medium, low };
  }, [merchantsWithPrediction]);

  return (
    <AppLayout title="接受度智能预测">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* 说明 Banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-sm border-warning/20 bg-warning/5 shadow-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Target className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">AI 接受度预测模型</p>
                <p className="text-xs text-muted-foreground mt-0.5">基于商家历史接通率、过往签约记录、品类特征、销售额档位、反馈标签综合计算意向评分，预测签约接受度供参考。</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="rounded-sm border-border shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => {
                  if (i === 0) setLevelFilter('high');
                  else if (i === 1) setLevelFilter('medium');
                  else if (i === 2) setLevelFilter('low');
                  else setLevelFilter('all');
                }}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{i < 3 ? (i === 0 ? stats.high : i === 1 ? stats.medium : stats.low) : s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 漏斗可视化 */}
        <Card className="rounded-sm border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />意向漏斗分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            {[
              { label: '高意向', count: stats.high, pct: Math.round(stats.high / merchantsWithPrediction.length * 100), color: 'bg-success', width: 'w-1/3' },
              { label: '中意向', count: stats.medium, pct: Math.round(stats.medium / merchantsWithPrediction.length * 100), color: 'bg-warning', width: 'w-2/3' },
              { label: '低意向', count: stats.low, pct: Math.round(stats.low / merchantsWithPrediction.length * 100), color: 'bg-destructive', width: 'w-full' },
            ].map((tier, i) => (
              <div key={tier.label} className="flex items-center gap-3">
                <span className="text-xs w-14 text-muted-foreground text-right shrink-0">{tier.label}</span>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full ${tier.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${tier.pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.15 }}
                  />
                </div>
                <span className="text-xs font-semibold w-16 shrink-0">{tier.count} 家（{tier.pct}%）</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 商家列表 */}
        <div className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="搜索商家..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9 rounded-sm text-xs" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="品类" /></SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="all">全部品类</SelectItem>
                {CATEGORIES.slice(0, 8).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="意向" /></SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="all">全部意向</SelectItem>
                <SelectItem value="high">高意向</SelectItem>
                <SelectItem value="medium">中意向</SelectItem>
                <SelectItem value="low">低意向</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="排序" /></SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="score">按分数排序</SelectItem>
                <SelectItem value="name">按名称排序</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 商家卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m, i) => {
              const cfg = levelConfig[m.prediction.level];
              const LevelIcon = cfg.icon;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`rounded-sm border shadow-sm hover:shadow-md transition-all h-full ${cfg.borderColor}`}>
                    <CardContent className="p-4 space-y-3">
                      {/* 头部 */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 font-bold text-sm ${cfg.bg} ${cfg.textColor}`}>
                            {m.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm truncate">{m.name}</span>
                              <Badge variant="outline" className="rounded-sm text-[10px] font-normal">{m.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">月销 ¥{(m.monthlySales / 10000).toFixed(1)}万 · 接通率 {m.connectionRate}%</p>
                          </div>
                        </div>
                        {/* 意向标签 */}
                        <div className="text-right shrink-0">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold ${cfg.color}`}>
                            <LevelIcon className="w-3 h-3" />{cfg.label}
                          </div>
                        </div>
                      </div>

                      {/* 评分 */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">接受度评分</span>
                          <span className={`font-bold text-base ${cfg.textColor}`}>{m.prediction.score} 分</span>
                        </div>
                        <Progress value={m.prediction.score} className="h-2" />
                      </div>

                      {/* 关键因素 */}
                      <div className="flex flex-wrap gap-1.5">
                        {m.prediction.keyFactors.slice(0, 3).map(f => {
                          const FIcon = factorIcons[f] ?? Tags;
                          return (
                            <span key={f} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                              <FIcon className="w-3 h-3" />{f}
                            </span>
                          );
                        })}
                      </div>

                      {/* 风险预警 */}
                      {m.prediction.riskWarning && (
                        <div className="flex items-start gap-1.5 text-[10px] text-warning bg-warning/10 rounded-sm px-2 py-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{m.prediction.riskWarning}</span>
                        </div>
                      )}

                      {/* 操作 */}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="flex-1 rounded-sm text-xs h-8" onClick={() => navigate(`/merchant/${m.id}`)}>
                          <Zap className="w-3.5 h-3.5 mr-1" />查看详情
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 rounded-sm text-xs h-8" onClick={() => toast.success(`已添加跟进：${m.name}`)}>
                          <TrendingUp className="w-3.5 h-3.5 mr-1" />加入跟进
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-16 text-muted-foreground text-sm">
                <Target className="w-10 h-10 mx-auto mb-3 text-muted" />
                <p>暂无符合条件的商家</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
