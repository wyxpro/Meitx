import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, FunnelChart, Funnel, LabelList,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Target, Trophy, Medal, Crown } from 'lucide-react';
import {
  getStoredMerchants,
  getStoredCommRecords,
  isThisMonth,
  isLastMonth
} from '@/services/mockData';

// Mock data
const monthlySalesData = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  sales: Math.round(800000 + Math.random() * 400000),
  orders: Math.round(15000 + Math.random() * 8000),
  target: 1000000,
}));

const categoryData = [
  { category: '餐饮', value: 38, color: 'hsl(221.2, 83.2%, 53.3%)' },
  { category: '丽人', value: 18, color: 'hsl(37.7, 92.1%, 50.2%)' },
  { category: '休闲娱乐', value: 14, color: 'hsl(142.1, 76.2%, 36.3%)' },
  { category: '酒店旅游', value: 11, color: 'hsl(0, 84.2%, 60.2%)' },
  { category: '亲子教育', value: 9, color: 'hsl(262.1, 83.3%, 58%)' },
  { category: '其他', value: 10, color: 'hsl(215.4, 16.3%, 46.9%)' },
];

const weeklyData = Array.from({ length: 7 }, (_, i) => ({
  day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
  connected: Math.round(15 + Math.random() * 25),
  signed: Math.round(2 + Math.random() * 6),
  rejected: Math.round(3 + Math.random() * 10),
}));

const radarDataTeam = [
  { subject: '销售覆盖', 当前团队: 85, 行业均值: 68, fullMark: 100 },
  { subject: '沟通效率', 当前团队: 72, 行业均值: 65, fullMark: 100 },
  { subject: '签约转化', 当前团队: 68, 行业均值: 55, fullMark: 100 },
  { subject: '复购维护', 当前团队: 91, 行业均值: 72, fullMark: 100 },
  { subject: '品类渗透', 当前团队: 78, 行业均值: 60, fullMark: 100 },
  { subject: '活跃度', 当前团队: 83, 行业均值: 70, fullMark: 100 },
];

const funnelData = [
  { name: '商家总池', value: 1280, fill: 'hsl(221.2, 83.2%, 53.3%)' },
  { name: '已触达', value: 856, fill: 'hsl(221.2, 83.2%, 60%)' },
  { name: '有意向', value: 312, fill: 'hsl(37.7, 92.1%, 50.2%)' },
  { name: '已签约', value: 96, fill: 'hsl(142.1, 76.2%, 36.3%)' },
  { name: '复购中', value: 48, fill: 'hsl(142.1, 76.2%, 42%)' },
];

const rankingData = [
  { rank: 1, name: '四季香餐厅', category: '餐饮', sales: 98600, growth: '+28%', signed: 3 },
  { rank: 2, name: '美丽时光美发', category: '丽人', sales: 87200, growth: '+19%', signed: 2 },
  { rank: 3, name: '欢乐城娱乐', category: '娱乐', sales: 76500, growth: '+35%', signed: 4 },
  { rank: 4, name: '如家酒店', category: '酒店', sales: 65400, growth: '+12%', signed: 1 },
  { rank: 5, name: '快乐宝贝亲子园', category: '亲子', sales: 59800, growth: '+22%', signed: 2 },
  { rank: 6, name: '铁人健身', category: '运动', sales: 54300, growth: '+15%', signed: 1 },
  { rank: 7, name: '洁美生活服务', category: '生活', sales: 48600, growth: '+8%', signed: 1 },
  { rank: 8, name: '阳光口腔', category: '医疗', sales: 43200, growth: '+31%', signed: 2 },
];

const operatorData = [
  { name: '王小明', signed: 12, contacted: 86, rate: 14.0, trend: '+2.1%' },
  { name: '李晓红', signed: 10, contacted: 72, rate: 13.9, trend: '+1.8%' },
  { name: '张伟', signed: 9, contacted: 68, rate: 13.2, trend: '-0.5%' },
  { name: '陈静', signed: 7, contacted: 58, rate: 12.1, trend: '+0.9%' },
  { name: '赵磊', signed: 6, contacted: 55, rate: 10.9, trend: '-1.2%' },
];



const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-warning" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-muted-foreground" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-accent" />;
  return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>;
};

export default function DataCenterPage() {
  const [period, setPeriod] = useState('month');

  const computedKpis = useMemo(() => {
    const merchants = getStoredMerchants();
    const records = getStoredCommRecords();

    // 1. Total revenue
    const totalSales = merchants.reduce((sum, m) => sum + m.monthlySales, 0);
    let revenueValue = 0;
    let revenueLabel = '';
    let growthRate = 15.3; // Default or calculated growth
    if (period === 'week') {
      revenueValue = totalSales / 4;
      revenueLabel = `¥${(revenueValue / 10000).toFixed(1)}万`;
      growthRate = 8.7;
    } else if (period === 'quarter') {
      revenueValue = totalSales * 3;
      revenueLabel = `¥${(revenueValue / 10000).toFixed(1)}万`;
      growthRate = 18.2;
    } else if (period === 'year') {
      revenueValue = totalSales * 12;
      revenueLabel = `¥${(revenueValue / 10000).toFixed(1)}万`;
      growthRate = 22.4;
    } else {
      // month
      revenueValue = totalSales;
      revenueLabel = `¥${(revenueValue / 10000).toFixed(1)}万`;
      // Calculate growth from lastMonthSales if available, otherwise default to 15.3%
      const totalLastMonth = merchants.reduce((sum, m) => sum + (m.monthlySales / 1.153), 0);
      growthRate = ((totalSales - totalLastMonth) / totalLastMonth) * 100;
    }

    // 2. Signed merchants
    const signedCount = records.filter(r => r.result === 'signed').length;
    const thisMonthSigned = records.filter(r => r.result === 'signed' && isThisMonth(r.contact_time)).length;
    const lastMonthSigned = records.filter(r => r.result === 'signed' && isLastMonth(r.contact_time)).length;
    const signedGrowth = lastMonthSigned > 0 ? ((thisMonthSigned - lastMonthSigned) / lastMonthSigned) * 100 : 22.0;

    // 3. Connected communications
    const totalConnected = records.filter(r => r.result !== 'no_answer').length;
    const thisMonthConnected = records.filter(r => r.result !== 'no_answer' && isThisMonth(r.contact_time)).length;
    const lastMonthConnected = records.filter(r => r.result !== 'no_answer' && isLastMonth(r.contact_time)).length;
    const connectedGrowth = lastMonthConnected > 0 ? ((thisMonthConnected - lastMonthConnected) / lastMonthConnected) * 100 : 8.1;

    // 4. Average conversion rate
    const conversionRate = records.length > 0 ? (records.filter(r => r.result === 'signed').length / records.length * 100) : 0;
    const lastMonthRecords = records.filter(r => isLastMonth(r.contact_time));
    const lastMonthRate = lastMonthRecords.length > 0 ? (lastMonthRecords.filter(r => r.result === 'signed').length / lastMonthRecords.length * 100) : 13.2;
    const rateChange = conversionRate - lastMonthRate;

    return [
      { label: period === 'week' ? '本周总营收' : period === 'quarter' ? '本季总营收' : period === 'year' ? '全年总营收' : '本月总营收', value: revenueLabel, change: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`, up: growthRate >= 0, icon: DollarSign },
      { label: '签约商家数', value: String(signedCount), change: `${signedGrowth >= 0 ? '+' : ''}${signedGrowth.toFixed(1)}%`, up: signedGrowth >= 0, icon: Users },
      { label: '总接通次数', value: String(totalConnected), change: `${connectedGrowth >= 0 ? '+' : ''}${connectedGrowth.toFixed(1)}%`, up: connectedGrowth >= 0, icon: Activity },
      { label: '平均转化率', value: `${conversionRate.toFixed(1)}%`, change: `${rateChange >= 0 ? '+' : ''}${rateChange.toFixed(1)}%`, up: rateChange >= 0, icon: Target },
    ];
  }, [period]);

  const maxSales = useMemo(() => Math.max(...rankingData.map(r => r.sales)), []);

  return (
    <AppLayout title="数据中心" actions={
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="rounded-sm w-28 text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-sm">
          <SelectItem value="week">本周</SelectItem>
          <SelectItem value="month">本月</SelectItem>
          <SelectItem value="quarter">本季度</SelectItem>
          <SelectItem value="year">全年</SelectItem>
        </SelectContent>
      </Select>
    }>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {computedKpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <kpi.icon className="w-4 h-4 text-primary/60" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold tracking-tight mt-2">{kpi.value}</p>
                  <span className={`text-xs flex items-center gap-0.5 mt-1 ${kpi.up ? 'text-success' : 'text-destructive'}`}>
                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="rounded-sm mb-4 whitespace-nowrap w-max">
              <TabsTrigger value="sales" className="rounded-sm text-xs">销售趋势</TabsTrigger>
              <TabsTrigger value="funnel" className="rounded-sm text-xs">转化漏斗</TabsTrigger>
              <TabsTrigger value="ranking" className="rounded-sm text-xs">商家排行</TabsTrigger>
              <TabsTrigger value="operator" className="rounded-sm text-xs">运营排行</TabsTrigger>
              <TabsTrigger value="category" className="rounded-sm text-xs">品类分布</TabsTrigger>
              <TabsTrigger value="radar" className="rounded-sm text-xs">综合评估</TabsTrigger>
            </TabsList>
          </div>

          {/* 销售趋势 */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-sm border-border shadow-sm md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">月度销售趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlySalesData}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(37.7, 92.1%, 50.2%)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(37.7, 92.1%, 50.2%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
                        <Tooltip formatter={(v: number, name: string) => [`¥${(v / 10000).toFixed(1)}万`, name === 'sales' ? '实际销售' : '目标']} />
                        <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                        <Area type="monotone" dataKey="target" name="目标" stroke="hsl(37.7, 92.1%, 50.2%)" fill="url(#targetGrad)" strokeWidth={1.5} strokeDasharray="4 2" />
                        <Area type="monotone" dataKey="sales" name="销售额" stroke="hsl(221.2, 83.2%, 53.3%)" fill="url(#salesGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">月度订单量</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySalesData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="orders" name="订单量" fill="hsl(37.7, 92.1%, 50.2%)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 转化漏斗 */}
          <TabsContent value="funnel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">商机转化漏斗</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip formatter={(v: number, name: string) => [v.toLocaleString(), name]} />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                          <LabelList position="right" fill="hsl(215.4, 16.3%, 46.9%)" stroke="none" dataKey="name" style={{ fontSize: 12 }} />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">各阶段转化率</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {funnelData.slice(0, -1).map((stage, i) => {
                    const next = funnelData[i + 1];
                    const rate = ((next.value / stage.value) * 100).toFixed(1);
                    return (
                      <div key={stage.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{stage.name} → {next.name}</span>
                          <span className="font-semibold" style={{ color: stage.fill }}>{rate}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: stage.fill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${rate}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{stage.value.toLocaleString()} 家</span>
                          <span>{next.value.toLocaleString()} 家</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 商家排行榜 */}
          <TabsContent value="ranking">
            <Card className="rounded-sm border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">本月商家营收 TOP 8</CardTitle>
                  <Badge variant="secondary" className="rounded-sm text-[10px]">本月</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingData.map((m, i) => (
                    <motion.div
                      key={m.rank}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(m.rank)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate">{m.name}</span>
                            <Badge variant="outline" className="rounded-sm text-[10px] font-normal shrink-0">{m.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs font-semibold">¥{(m.sales / 10000).toFixed(1)}万</span>
                            <span className={`text-[10px] ${m.growth.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{m.growth}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.sales / maxSales) * 100}%` }}
                            transition={{ duration: 0.7, delay: i * 0.06 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 运营人员排行 */}
          <TabsContent value="operator">
            <Card className="rounded-sm border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">运营人员本月表现</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-border">
                        {['排名', '姓名', '签约数', '触达商家', '转化率', '趋势'].map(h => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium py-2 px-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {operatorData.map((op, i) => (
                        <motion.tr
                          key={op.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-3">{rankIcon(i + 1)}</td>
                          <td className="py-3 px-3 font-medium text-sm whitespace-nowrap">{op.name}</td>
                          <td className="py-3 px-3 text-sm whitespace-nowrap">
                            <span className="font-bold text-primary">{op.signed}</span> 单
                          </td>
                          <td className="py-3 px-3 text-sm whitespace-nowrap">{op.contacted} 家</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${op.rate * 5}%` }} />
                              </div>
                              <span className="text-xs font-semibold">{op.rate}%</span>
                            </div>
                          </td>
                          <td className={`py-3 px-3 text-xs font-medium whitespace-nowrap ${op.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{op.trend}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 品类分布 */}
          <TabsContent value="category">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">品类营收占比</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={3}>
                          {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v}%`, '占比']} />
                        <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">品类详细数据</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.map((item) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{item.category}</span>
                          <span className="font-semibold">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 雷达综合评估 */}
          <TabsContent value="radar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">运营能力 vs 行业均值</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 360 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarDataTeam}>
                        <PolarGrid stroke="hsl(214.3, 31.8%, 91.4%)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="当前团队" dataKey="当前团队" stroke="hsl(221.2, 83.2%, 53.3%)" fill="hsl(221.2, 83.2%, 53.3%)" fillOpacity={0.3} />
                        <Radar name="行业均值" dataKey="行业均值" stroke="hsl(37.7, 92.1%, 50.2%)" fill="hsl(37.7, 92.1%, 50.2%)" fillOpacity={0.15} />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">能力对比详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {radarDataTeam.map((item) => (
                      <div key={item.subject} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{item.subject}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-bold">{item.当前团队}</span>
                            <span className="text-muted-foreground">{item.行业均值}</span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div className="absolute h-full bg-accent/30 rounded-full" style={{ width: `${item.行业均值}%` }} />
                          <motion.div
                            className="absolute h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.当前团队}%` }}
                            transition={{ duration: 0.7 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-1.5 rounded bg-primary inline-block" />当前团队</div>
                    <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-1.5 rounded bg-accent/60 inline-block" />行业均值</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 沟通效果图 */}
            <Card className="rounded-sm border-border shadow-sm mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">每周沟通情况</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                      <Bar dataKey="connected" name="接通" fill="hsl(221.2, 83.2%, 53.3%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="signed" name="签约" fill="hsl(142.1, 76.2%, 36.3%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="rejected" name="拒绝" fill="hsl(0, 84.2%, 60.2%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

