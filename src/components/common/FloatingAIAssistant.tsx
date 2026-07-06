import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, ChevronLeft, Brain, MessageSquare,
  TrendingUp, AlertCircle, Zap, Copy, Bot,
  BarChart3, ShieldAlert, CheckCircle2, Star, Package, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

// 各 Tab 内容数据
const TAB_DATA = {
  数据: {
    icon: BarChart3,
    metrics: [
      { label: '月销售额', value: '¥12.8万', change: '-8.3%', up: false },
      { label: '月订单量', value: '2,340', change: '+5.1%', up: true },
      { label: '客单价', value: '¥54.7', change: '+2.3%', up: true },
      { label: '接通率', value: '72%', change: '-3%', up: false },
      { label: '新客占比', value: '28%', change: '-5%', up: false },
      { label: '复购率', value: '18%', change: '+1.2%', up: true },
    ],
    trend: [
      { month: '1月', sales: 10.2 }, { month: '2月', sales: 11.5 },
      { month: '3月', sales: 13.8 }, { month: '4月', sales: 12.1 },
      { month: '5月', sales: 11.4 }, { month: '6月', sales: 12.8 },
    ],
    summary: '近30天数据：销售额环比下滑8.3%，订单量稳步提升，复购率有改善迹象，新客获取仍是核心瓶颈。',
    insight: '同商圈餐饮均值月销售额¥14.2万，当前门店有¥1.4万的提升空间，重点在新客获取。',
  },
  诊断: {
    icon: Brain,
    points: [
      { icon: AlertCircle, color: 'text-destructive', severity: '高危', title: '新客获取严重不足', desc: '新客占比28%，远低于同品类均值41%。建议立即启动曝光提升套餐，预计2周内新客提升35%。' },
      { icon: TrendingUp, color: 'text-warning', severity: '中危', title: '复购率偏低', desc: '老客复购率仅18%，低于均值31%。建议推出会员专属优惠券+满减活动，提升用户粘性。' },
      { icon: ShieldAlert, color: 'text-primary', severity: '低危', title: '评分优化空间', desc: '近期差评集中在配送时效（占差评62%），建议优化备餐流程，目标评分从4.6升至4.8。' },
      { icon: MessageSquare, color: 'text-muted-foreground', severity: '建议', title: '营业时段空档', desc: '14:00-17:00下单量仅占全日9%，可推出下午茶特惠套餐填补空档，预计增收8%。' },
    ],
    score: { before: 62, after: 88, label: '综合健康度提升潜力' },
  },
  套餐: {
    icon: Package,
    packages: [
      { name: '曝光爆发包', price: '¥1,280/月', tag: '🔥最优匹配', tagColor: 'bg-destructive/10 text-destructive', desc: '解决新客不足核心问题，首页推荐位+搜索置顶，预计提升曝光量200%，新客增长35%。', roi: '预估ROI 320%', roiColor: 'text-success', highlight: true },
      { name: '新客转化包', price: '¥880/月', tag: '✨推荐', tagColor: 'bg-primary/10 text-primary', desc: '优惠券+专属活动吸引首单，配合智能Push精准触达，首单转化率提升约22%。', roi: '预估ROI 240%', roiColor: 'text-success', highlight: false },
      { name: '复购提升包', price: '¥680/月', tag: '📈增效', tagColor: 'bg-success/10 text-success', desc: '会员体系+积分兑换+专属折扣，激活沉睡用户，复购率提升目标18%→28%。', roi: '预估ROI 180%', roiColor: 'text-warning', highlight: false },
    ],
  },
  话术: {
    icon: MessageSquare,
    scripts: [
      {
        scene: '📞 电话开场白',
        tag: '黄金30秒',
        content: '您好！请问是[商家名]的[老板姓名]老板吗？我是美团阿波罗运营顾问，关注到咱们店上月外卖销售额环比下滑了8.3%，数据显示主要是新客获取量在减少。我这边有个针对您品类专门优化的方案，上个月已帮3家同商圈门店平均增收23%，方便占用您3分钟沟通一下吗？',
      },
      {
        scene: '💬 痛点切入话术',
        tag: '数据驱动',
        content: '根据后台数据，您店铺近30天新客占比只有28%，而同商圈均值是41%——这意味着每100个路过的潜在顾客，您多流失了13个。我们的曝光提升套餐专门解决这个问题，已帮该商圈[某竞品]在6周内新客从29%提升到45%，ROI达到了320%。',
      },
      {
        scene: '🤝 异议处理：价格贵',
        tag: '价格敏感型',
        content: '理解您对投入的谨慎，我们完全以效果说话。1,280元/月的投入，按保守估算新增10单/天、客单价55元计算，一个月增收约16,500元，ROI超过12倍。我们可以先做一个月试跑，效果不达预期全额退款，您完全没有风险。',
      },
    ],
    tips: ['强调数据事实，避免主观判断', '先讲结果，再讲方案', '给出具体数字，增强可信度'],
  },
  接受度: {
    icon: Star,
    score: 78,
    level: '高意向',
    levelColor: 'text-success',
    levelBg: 'bg-success/10',
    gauge: [
      { label: '极低', color: 'bg-destructive', range: '0-40' },
      { label: '低', color: 'bg-warning', range: '40-60' },
      { label: '中', color: 'bg-primary', range: '60-80' },
      { label: '高', color: 'bg-success', range: '80-100' },
    ],
    factors: [
      { label: '接通率', value: '72%', weight: '高', ok: true, desc: '高于均值' },
      { label: '历史签约', value: '1次', weight: '高', ok: true, desc: '有合作基础' },
      { label: '近期反馈', value: '积极', weight: '高', ok: true, desc: '主动咨询过' },
      { label: '当前痛点', value: '明显', weight: '中', ok: true, desc: '数据下滑明显' },
      { label: '决策周期', value: '7天', weight: '中', ok: true, desc: '偏短' },
      { label: '预算限制', value: '中等', weight: '低', ok: false, desc: '需灵活方案' },
    ],
    risk: '老板对价格敏感，建议先强调ROI数据和同商圈案例，锚定效果预期后再报价。避免一开口就说金额。',
    strategy: '建议本周内电话触达，准备3家同品类成功案例，重点对比使用前后数据变化。',
  },
};

type TabKey = keyof typeof TAB_DATA;

export function FloatingAIAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('数据');

  const hidden = ['/', '/login'].includes(location.pathname);
  if (hidden) return null;

  return (
    <>
      {/* 触发按钮 */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
          >
            <button
              onClick={() => setOpen(true)}
              className="flex flex-col items-center gap-1 bg-primary text-primary-foreground px-2 py-4 rounded-l-xl shadow-lg hover:opacity-90 transition-opacity"
            >
              <Bot className="w-5 h-5" />
              <span className="text-[10px] font-semibold" style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}>AI 助手</span>
              <ChevronLeft className="w-3.5 h-3.5 mt-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 侧边面板 */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 md:w-[360px] bg-card border-l border-border shadow-2xl flex flex-col"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">AI 运营助手</h2>
                    <p className="text-[10px] opacity-70">美团阿波罗智能插件</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab 导航 */}
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabKey)} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid grid-cols-5 h-9 rounded-none border-b border-border bg-muted/40 shrink-0 px-1">
                  {(Object.keys(TAB_DATA) as TabKey[]).map(tab => (
                    <TabsTrigger key={tab} value={tab} className="text-[11px] rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm px-1">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <ScrollArea className="flex-1 min-h-0">
                  {/* 数据 Tab */}
                  <TabsContent value="数据" className="m-0 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-sm p-2">{TAB_DATA['数据'].summary}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TAB_DATA['数据'].metrics.map(m => (
                        <div key={m.label} className="rounded-sm border border-border bg-background p-2.5 hover:border-primary/30 transition-colors">
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                          <p className="text-sm font-bold mt-0.5">{m.value}</p>
                          <p className={`text-[10px] font-medium ${m.up ? 'text-success' : 'text-destructive'}`}>{m.change} 环比</p>
                        </div>
                      ))}
                    </div>
                    {/* 趋势迷你图 */}
                    <div className="rounded-sm border border-border bg-background p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-2">近6月销售额趋势（万元）</p>
                      <div className="flex items-end gap-1 h-14">
                        {TAB_DATA['数据'].trend.map((t, i) => {
                          const max = Math.max(...TAB_DATA['数据'].trend.map(x => x.sales));
                          const h = Math.round((t.sales / max) * 100);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] text-muted-foreground">{t.sales}</span>
                              <div className="w-full rounded-t-sm bg-primary/20 relative" style={{ height: `${h}%` }}>
                                <div className={`absolute bottom-0 w-full rounded-t-sm ${i === 5 ? 'bg-primary' : 'bg-primary/50'}`} style={{ height: '100%' }} />
                              </div>
                              <span className="text-[8px] text-muted-foreground">{t.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-sm bg-primary/5 border border-primary/20 p-2.5">
                      <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Lightbulb className="w-3 h-3" />AI 洞察</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{TAB_DATA['数据'].insight}</p>
                    </div>
                  </TabsContent>

                  {/* 诊断 Tab */}
                  <TabsContent value="诊断" className="m-0 p-4 space-y-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">综合诊断报告</span>
                      <span className="text-[10px] text-muted-foreground">4项问题</span>
                    </div>
                    {TAB_DATA['诊断'].points.map((p, i) => (
                      <div key={i} className="rounded-sm border border-border bg-background p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p.icon className={`w-4 h-4 shrink-0 ${p.color}`} />
                          <span className="text-xs font-semibold flex-1">{p.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-medium ${p.severity === '高危' ? 'bg-destructive/10 text-destructive' : p.severity === '中危' ? 'bg-warning/10 text-warning' : p.severity === '低危' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{p.severity}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                    <div className="rounded-sm border border-border bg-background p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-2">健康度提升潜力</p>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-muted-foreground">{TAB_DATA['诊断'].score.before}</p>
                          <p className="text-[9px] text-muted-foreground">当前</p>
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${TAB_DATA['诊断'].score.after}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-success">{TAB_DATA['诊断'].score.after}</p>
                          <p className="text-[9px] text-muted-foreground">目标</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 套餐 Tab */}
                  <TabsContent value="套餐" className="m-0 p-4 space-y-3">
                    <p className="text-[11px] text-muted-foreground">基于当前商家数据，AI 推荐以下套餐方案：</p>
                    {TAB_DATA['套餐'].packages.map((pkg, i) => (
                      <div key={i} className={`rounded-sm border p-3 space-y-2 ${pkg.highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{pkg.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${pkg.tagColor}`}>{pkg.tag}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{pkg.desc}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-foreground">{pkg.price}</span>
                          <span className={`text-xs font-semibold ${pkg.roiColor}`}>{pkg.roi}</span>
                        </div>
                        <Button size="sm" className={`w-full rounded-sm text-xs h-7 ${pkg.highlight ? '' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                          onClick={() => toast.success(`已推荐套餐：${pkg.name}`)}>
                          <Zap className="w-3 h-3 mr-1" />推荐给商家
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  {/* 话术 Tab */}
                  <TabsContent value="话术" className="m-0 p-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {TAB_DATA['话术'].tips.map((tip, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tip}</span>
                      ))}
                    </div>
                    {TAB_DATA['话术'].scripts.map((s, i) => (
                      <div key={i} className="rounded-sm border border-border bg-background p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold">{s.scene}</span>
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">{s.tag}</span>
                          </div>
                          <Button
                            variant="ghost" size="sm" className="h-6 px-2 text-[10px] rounded-sm text-primary"
                            onClick={() => { navigator.clipboard.writeText(s.content); toast.success('话术已复制'); }}
                          >
                            <Copy className="w-3 h-3 mr-1" />复制
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.content}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* 接受度 Tab */}
                  <TabsContent value="接受度" className="m-0 p-4 space-y-3">
                    {/* 评分环 */}
                    <div className={`rounded-sm border border-border bg-background p-4 flex items-center gap-4`}>
                      <div className="relative w-16 h-16 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                          <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--success))" strokeWidth="6"
                            strokeDasharray={`${(TAB_DATA['接受度'].score / 100) * 163.4} 163.4`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-base font-bold leading-none">{TAB_DATA['接受度'].score}</span>
                          <span className="text-[9px] text-muted-foreground">分</span>
                        </div>
                      </div>
                      <div>
                        <span className={`text-base font-bold ${TAB_DATA['接受度'].levelColor}`}>{TAB_DATA['接受度'].level}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">综合意向预测评分</p>
                        <div className="flex gap-1 mt-1.5">
                          {TAB_DATA['接受度'].gauge.map(g => (
                            <div key={g.label} className={`h-1.5 flex-1 rounded-full ${g.range === '60-80' ? g.color : 'bg-muted'}`} />
                          ))}
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[9px] text-muted-foreground">极低</span>
                          <span className="text-[9px] text-muted-foreground">极高</span>
                        </div>
                      </div>
                    </div>
                    {/* 影响因素 */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground">影响因素分析</p>
                      {TAB_DATA['接受度'].factors.map(f => (
                        <div key={f.label} className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${f.ok ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className="text-xs flex-1">{f.label}</span>
                          <span className="text-xs font-medium">{f.value}</span>
                          <span className={`text-[9px] ${f.ok ? 'text-success' : 'text-muted-foreground'}`}>{f.desc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-warning/10 border border-warning/20 p-2.5">
                      <p className="text-[10px] font-semibold text-warning mb-1">⚠️ 沟通风险提示</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{TAB_DATA['接受度'].risk}</p>
                    </div>
                    <div className="rounded-sm bg-success/10 border border-success/20 p-2.5">
                      <p className="text-[10px] font-semibold text-success mb-1">✅ 建议策略</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{TAB_DATA['接受度'].strategy}</p>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
