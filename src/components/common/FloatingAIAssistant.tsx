import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, ChevronLeft, Brain, Target, MessageSquare,
  TrendingUp, AlertCircle, Zap, Copy, Bot,
  BarChart3, ShieldAlert, CheckCircle2, Star, Package
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
    ],
    summary: '近30天数据：销售额出现波动，订单量稳步提升，接通率略有下滑，需重点关注销售趋势。',
  },
  诊断: {
    icon: Brain,
    points: [
      { icon: AlertCircle, color: 'text-destructive', title: '外卖销售下滑', desc: '近3月销售额环比持续下滑，新客获取不足是主要原因，建议通过曝光套餐扩大流量。' },
      { icon: TrendingUp, color: 'text-warning', title: '复购率偏低', desc: '老客户复购率仅 18%，低于同品类均值 31%，建议推出会员专属优惠提升粘性。' },
      { icon: ShieldAlert, color: 'text-primary', title: '评分有优化空间', desc: '近期差评集中在配送时效，建议优化备餐流程，目标评分从 4.6 提升至 4.8。' },
    ],
  },
  套餐: {
    icon: Package,
    packages: [
      { name: '曝光提升包', price: '¥1,280/月', tag: '最优匹配', desc: '适合销售下滑、新客不足场景，预计提升曝光 200%，订单增长 35%。', roi: '+35%' },
      { name: '新客专享包', price: '¥880/月', tag: '推荐', desc: '针对新客转化率低，通过优惠券+专属活动吸引首单，转化率提升约 22%。', roi: '+22%' },
    ],
  },
  话术: {
    icon: MessageSquare,
    scripts: [
      {
        scene: '电话开场',
        content: '您好，我是美团运营顾问小李，看到您店铺最近外卖销售有些波动，我们这边有一套针对餐饮商家的专属方案，效果不错，方便聊3分钟吗？',
      },
      {
        scene: '痛点切入',
        content: '根据数据，您店铺近30天新客占比只有28%，行业均值是41%。我们的曝光提升套餐专门解决这个问题，上个月帮同品类商家提升了38%的新客。',
      },
    ],
  },
  接受度: {
    icon: Star,
    score: 78,
    level: '高意向',
    levelColor: 'text-success',
    factors: [
      { label: '接通率', value: '72%', weight: '高', ok: true },
      { label: '历史签约', value: '1次', weight: '中', ok: true },
      { label: '近期反馈', value: '积极', weight: '高', ok: true },
      { label: '当前痛点', value: '明显', weight: '中', ok: true },
    ],
    risk: '老板对价格敏感，建议先强调效果数据，再报价。',
  },
};

type TabKey = keyof typeof TAB_DATA;

export function FloatingAIAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('数据');

  const hidden = ['/landing', '/login'].includes(location.pathname);
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
                    <p className="text-xs text-muted-foreground leading-relaxed">{TAB_DATA['数据'].summary}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TAB_DATA['数据'].metrics.map(m => (
                        <div key={m.label} className="rounded-sm border border-border bg-background p-2.5">
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                          <p className="text-sm font-bold mt-0.5">{m.value}</p>
                          <p className={`text-[10px] font-medium ${m.up ? 'text-success' : 'text-destructive'}`}>{m.change}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* 诊断 Tab */}
                  <TabsContent value="诊断" className="m-0 p-4 space-y-2.5">
                    {TAB_DATA['诊断'].points.map((p, i) => (
                      <div key={i} className="rounded-sm border border-border bg-background p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <p.icon className={`w-4 h-4 shrink-0 ${p.color}`} />
                          <span className="text-xs font-semibold">{p.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">{p.desc}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* 套餐 Tab */}
                  <TabsContent value="套餐" className="m-0 p-4 space-y-3">
                    {TAB_DATA['套餐'].packages.map((pkg, i) => (
                      <div key={i} className="rounded-sm border border-border bg-background p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{pkg.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-medium">{pkg.tag}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{pkg.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{pkg.price}</span>
                          <span className="text-xs font-semibold text-success">预估提升 {pkg.roi}</span>
                        </div>
                        <Button size="sm" className="w-full rounded-sm text-xs h-7" onClick={() => toast.success(`已推荐套餐：${pkg.name}`)}>
                          <Zap className="w-3 h-3 mr-1" />推荐给商家
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  {/* 话术 Tab */}
                  <TabsContent value="话术" className="m-0 p-4 space-y-3">
                    {TAB_DATA['话术'].scripts.map((s, i) => (
                      <div key={i} className="rounded-sm border border-border bg-background p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">{s.scene}</span>
                          <Button
                            variant="ghost" size="sm" className="h-6 px-2 text-[10px] rounded-sm"
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
                    <div className="rounded-sm border border-border bg-background p-4 flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{TAB_DATA['接受度'].score}</p>
                        <p className="text-[10px] text-muted-foreground">满分100</p>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${TAB_DATA['接受度'].levelColor}`}>{TAB_DATA['接受度'].level}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">综合意向评估</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {TAB_DATA['接受度'].factors.map(f => (
                        <div key={f.label} className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${f.ok ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className="text-xs flex-1">{f.label}</span>
                          <span className="text-xs font-medium">{f.value}</span>
                          <span className="text-[10px] text-muted-foreground">权重{f.weight}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-warning/10 border border-warning/20 p-3">
                      <p className="text-[10px] font-semibold text-warning mb-1">沟通风险提示</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{TAB_DATA['接受度'].risk}</p>
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
