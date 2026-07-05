import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, X, ChevronRight, ChevronLeft, Brain, Target, MessageSquare,
  TrendingUp, AlertCircle, Zap, RefreshCw, Copy, ChevronDown, Bot,
  BarChart3, Phone, ShieldAlert, Layers
} from 'lucide-react';
import { toast } from 'sonner';

// 页面类型识别
type PageType = 'home' | 'merchant-detail' | 'merchants' | 'communications' | 'data-center' | 'other';

function detectPageType(pathname: string): PageType {
  if (pathname.startsWith('/merchant/')) return 'merchant-detail';
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/merchants')) return 'merchants';
  if (pathname.startsWith('/communications')) return 'communications';
  if (pathname.startsWith('/data-center')) return 'data-center';
  return 'other';
}

// 分析结果类型
interface AnalysisInsight {
  icon: React.ElementType;
  color: string;
  title: string;
  desc: string;
}

interface AnalysisResult {
  title: string;
  capture: string;
  insights: AnalysisInsight[];
  suggestions: string[];
}

// 模拟 AI 分析结果（按页面类型定制）
function getAIAnalysis(pageType: PageType): AnalysisResult {
  const analyses: Record<PageType, AnalysisResult> = {
    home: {
      title: '工作台智能分析',
      capture: '已抓取今日跟进商家 23 家、高潜商家 128 家、本月签约 8 家',
      insights: [
        { icon: AlertCircle, color: 'text-warning', title: '今日优先跟进', desc: '有 3 家高意向商家距离上次联系超过 7 天，建议今日优先电话触达。' },
        { icon: TrendingUp, color: 'text-success', title: '本月签约趋势', desc: '本月签约数同比增长 33%，与上半月相比节奏加快，当前势头良好。' },
        { icon: Target, color: 'text-primary', title: '转化漏斗提示', desc: '高潜商家池 128 家，仅 8 家已签约，转化率约 6.3%，可聚焦提升中等意向商家。' },
      ],
      suggestions: ['为 3 家超期商家生成唤醒话术', '筛选本周未联系的高意向商家', '查看今日推荐套餐方案'],
    },
    'merchant-detail': {
      title: '商家详情深度分析',
      capture: '已抓取当前商家经营数据、沟通记录、评分、套餐等全量信息',
      insights: [
        { icon: Brain, color: 'text-primary', title: '痛点核心', desc: '检测到该商家外卖销售额近 3 月持续下滑，新客获取不足是主要原因。' },
        { icon: Target, color: 'text-warning', title: '接受度评估', desc: '综合接通率 72%、历史签约记录及老板风格，接受度预测评分 78/100（高意向）。' },
        { icon: MessageSquare, color: 'text-success', title: '话术策略', desc: '建议以数据对比切入，强调同品类提升案例，避免直接报价。' },
      ],
      suggestions: ['生成电话沟通话术', '推荐最优套餐方案', '查看同类商家对比数据'],
    },
    merchants: {
      title: '商家列表智能分析',
      capture: '已抓取当前列表筛选条件、商家数量、品类分布、意向分布',
      insights: [
        { icon: BarChart3, color: 'text-primary', title: '品类分布', desc: '当前列表餐饮占比 58%，美容美发 22%，其余品类 20%，可按品类定向运营。' },
        { icon: Zap, color: 'text-warning', title: '高潜机会', desc: '有 34 家商家意向评分超过 75 分且近期未联系，是当前最优转化机会。' },
        { icon: Phone, color: 'text-success', title: '接通策略', desc: '数据显示该列表商家最佳接触时间为 14:00-16:00，接通率高于均值 18%。' },
      ],
      suggestions: ['筛选高意向且未联系商家', '批量生成跟进计划', '导出高潜商家清单'],
    },
    communications: {
      title: '沟通数据智能分析',
      capture: '已抓取本周沟通记录、结果分布、渠道使用情况',
      insights: [
        { icon: TrendingUp, color: 'text-success', title: '本周沟通效率', desc: '本周成功沟通率 68%，较上周提升 5 个百分点，电话渠道效果最优。' },
        { icon: AlertCircle, color: 'text-destructive', title: '待跟进预警', desc: '有 4 家「待跟进」商家超过 3 天未处理，建议今日统一跟进。' },
        { icon: Brain, color: 'text-primary', title: '最佳话术洞察', desc: '本周标记「好用」的话术集中使用了价值锚定和数据对比技巧。' },
      ],
      suggestions: ['查看今日待跟进列表', '分析本周话术效果', '生成周报摘要'],
    },
    'data-center': {
      title: '数据中心智能洞察',
      capture: '已抓取当前数据大盘指标、趋势数据、排行榜信息',
      insights: [
        { icon: BarChart3, color: 'text-primary', title: '核心指标解读', desc: '本月签约转化率 8.3%，处于行业中上水平，近两周连续上升。' },
        { icon: TrendingUp, color: 'text-success', title: '增长亮点', desc: '外卖品类商家签约量环比增长 22%，是当前最活跃的增长赛道。' },
        { icon: ShieldAlert, color: 'text-warning', title: '风险预警', desc: '美容品类商家近期接通率下滑 8%，建议排查是否存在名单质量问题。' },
      ],
      suggestions: ['导出本月数据报告', '查看品类深度分析', '设置关键指标预警'],
    },
    other: {
      title: 'AI 运营助手',
      capture: '已识别当前页面，准备为您提供智能分析',
      insights: [
        { icon: Sparkles, color: 'text-primary', title: '快速导航', desc: '前往工作台查看今日跟进任务，或进入商家管理查看商家列表。' },
        { icon: Brain, color: 'text-warning', title: '每日小贴士', desc: '在商家详情页打开 AI 助手可获取该商家的精准诊断分析和话术建议。' },
        { icon: Target, color: 'text-success', title: '今日目标', desc: '建议今日完成 5-8 次高质量商家触达，重点关注高意向商家。' },
      ],
      suggestions: ['前往工作台', '查看待跟进商家', '智能套餐推荐'],
    },
  };
  return analyses[pageType] ?? analyses.other;
}

const defaultAnalysis: AnalysisResult = getAIAnalysis('other');

export function FloatingAIAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const pageType = detectPageType(location.pathname);

  // 不在 landing/login 页显示
  const hidden = ['/landing', '/login'].includes(location.pathname);
  if (hidden) return null;

  const refresh = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setAnalysis(getAIAnalysis(pageType));
    setLoading(false);
    toast.success('AI 分析已更新');
  }, [pageType]);

  // 切换页面时自动更新分析
  useEffect(() => {
    setAnalysis(getAIAnalysis(pageType));
    setExpandedInsight(null);
  }, [pageType]);

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
              onClick={() => { setOpen(true); setAnalysis(getAIAnalysis(pageType)); }}
              className="flex flex-col items-center gap-1 bg-primary text-primary-foreground px-2 py-4 rounded-l-xl shadow-lg hover:bg-secondary transition-colors group"
            >
              <Bot className="w-5 h-5" />
              <span className="text-[10px] font-semibold writing-vertical" style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}>AI 助手</span>
              <ChevronLeft className="w-3.5 h-3.5 mt-1 group-hover:translate-x-[-2px] transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 侧边面板 */}
      <AnimatePresence>
        {open && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* 面板 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 md:w-96 bg-card border-l border-border shadow-2xl flex flex-col"
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={refresh}
                    title="刷新分析"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                  {/* 数据抓取状态 */}
                  <div className="rounded-sm bg-muted/60 border border-border p-3 flex items-start gap-2">
                    <Layers className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-success">数据已抓取</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{analysis.capture}</p>
                    </div>
                  </div>

                  {/* AI 分析 */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {loading ? '分析中...' : analysis.title}
                    </p>

                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="h-16 rounded-sm bg-muted animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      analysis.insights.map((ins: AnalysisInsight, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-sm border border-border bg-background overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                          onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                        >
                          <div className="flex items-center gap-2.5 px-3 py-2.5">
                            <ins.icon className={`w-4 h-4 shrink-0 ${ins.color}`} />
                            <span className="text-xs font-semibold flex-1">{ins.title}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedInsight === i ? 'rotate-180' : ''}`} />
                          </div>
                          <AnimatePresence>
                            {expandedInsight === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
                                  {ins.desc}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <Separator />

                  {/* 快速操作建议 */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-warning" />快速操作
                    </p>
                    {analysis.suggestions.map((s: string, i: number) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm border border-border bg-background hover:bg-muted hover:border-primary/30 text-left text-xs transition-colors"
                        onClick={() => {
                          if (s.includes('工作台')) navigate('/');
                          else if (s.includes('商家')) navigate('/merchants');
                          else if (s.includes('套餐')) navigate('/package-recommendation');
                          else if (s.includes('跟进')) navigate('/communications');
                          else if (s.includes('数据')) navigate('/data-center');
                          else toast.success(`已触发：${s}`);
                          setOpen(false);
                        }}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="flex-1">{s}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* 底部收起按钮 */}
              <div className="border-t border-border p-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-sm text-xs"
                  onClick={() => setOpen(false)}
                >
                  <ChevronRight className="w-3.5 h-3.5 mr-1" />收起 AI 助手
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
