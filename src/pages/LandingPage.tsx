import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles, Brain, BarChart3, Phone, Users, Star, Check,
  ChevronRight, Zap, TrendingUp,
  MessageSquare, Target, Award, ArrowRight, Play, Bot,
} from 'lucide-react';

// ─── 数据 ───────────────────────────────────────────────────
const features = [
  { icon: Brain, title: 'AI 智能诊断', desc: '实时分析商家经营数据，自动识别 12 类经营痛点，精准定位改善机会', color: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/10 text-blue-500' },
  { icon: BarChart3, title: '数据驱动决策', desc: '多维度数据大盘，雷达图综合评估，趋势预测助您提前布局', color: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/10 text-emerald-500' },
  { icon: Phone, title: '智能话术生成', desc: '根据商家画像动态生成个性化沟通话术，支持电话/微信/面谈三种场景', color: 'from-amber-500/20 to-amber-600/5', iconBg: 'bg-amber-500/10 text-amber-500' },
  { icon: Target, title: '精准套餐推荐', desc: '结合季节、品类、历史数据，AI 推算最高 ROI 方案组合', color: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/10 text-violet-500' },
  { icon: TrendingUp, title: '签约预测引擎', desc: '基于商家行为轨迹，提前预测接受概率，让每次拜访都有的放矢', color: 'from-rose-500/20 to-rose-600/5', iconBg: 'bg-rose-500/10 text-rose-500' },
  { icon: MessageSquare, title: '全链路跟踪', desc: '沟通记录、跟进提醒、话术反馈闭环，让商机不再流失', color: 'from-cyan-500/20 to-cyan-600/5', iconBg: 'bg-cyan-500/10 text-cyan-500' },
];

const testimonials = [
  { name: '王总', role: '区域运营经理 · 华北大区', avatar: '王', rating: 5, text: '用了阿波罗 AI 插件后，我的团队签约转化率从 8% 提升到了 15%，话术生成功能太实用了，新人上手速度翻倍！', tags: ['话术生成', '转化率'] },
  { name: '李晓红', role: '高级运营顾问 · 上海', avatar: '李', rating: 5, text: '数据中心的诊断功能帮了我大忙，每次去拜访商家前都先看 AI 诊断报告，有备而来效果好多了。', tags: ['AI诊断', '数据分析'] },
  { name: '张伟', role: '城市负责人 · 成都', avatar: '张', rating: 5, text: '季节性预测功能太准了，提前两周就知道哪些商家需要夏季促销套餐，抢先布局直接拿下 12 家大单。', tags: ['套餐推荐', '精准预测'] },
  { name: '陈静', role: '运营专员 · 广州', avatar: '陈', rating: 4, text: '界面简洁，功能强大，沟通记录自动归档，再也不用手动整理了，效率提升明显，强烈推荐！', tags: ['沟通记录', '效率提升'] },
  { name: '刘明', role: '团队主管 · 武汉', avatar: '刘', rating: 5, text: '套餐推荐功能帮我们精准匹配商家需求，首次拜访签约率提升了 40%，团队业绩整体上升了两个档次。', tags: ['智能套餐', '签约提升'] },
  { name: '赵雪', role: '运营顾问 · 杭州', avatar: '赵', rating: 5, text: '接受度预测准确率令人惊讶，根据预测结果调整拜访策略后，被拒绝的概率大幅下降，省了太多时间。', tags: ['接受度预测', '拜访策略'] },
  { name: '孙宇', role: '大区总监 · 深圳', avatar: '孙', rating: 5, text: '整个团队推广使用后，月度签约数从 30 单增长到 52 单，数据驱动运营的效果真的非常显著。', tags: ['团队协作', '业绩增长'] },
  { name: '周芳', role: '商家顾问 · 北京', avatar: '周', rating: 5, text: '话术生成功能根据商家画像定制化，打电话时底气足了很多，商家也更愿意听我介绍方案了。', tags: ['个性化话术', '沟通提升'] },
  { name: '吴鹏', role: '运营主管 · 南京', avatar: '吴', rating: 4, text: '高潜商家筛选功能帮我们从 200 家池子里精准找到最值得跟进的 20 家，ROI 提升非常明显。', tags: ['商家筛选', 'ROI提升'] },
  { name: '郑婷', role: '城市运营 · 重庆', avatar: '郑', rating: 5, text: '痛点诊断功能能自动识别商家核心问题，不用我一一分析，极大节省了备单时间，拜访质量翻倍。', tags: ['痛点诊断', '时间节省'] },
];

const row1 = testimonials.slice(0, 5);
const row2 = testimonials.slice(5);

const plans = [
  {
    name: '基础版', price: '免费', period: '', badge: '',
    features: ['20 家商家管理', '基础数据大盘', '话术模板 5 个', '标准沟通记录'],
    cta: '免费开始', primary: false,
  },
  {
    name: '专业版', price: '¥299', period: '/月', badge: '最受欢迎',
    features: ['无限商家管理', '全量数据分析', 'AI 话术生成不限次', '接受度预测', '套餐智能推荐', '优先客服支持'],
    cta: '立即订阅', primary: true,
  },
  {
    name: '企业版', price: '定制', period: '', badge: '',
    features: ['多团队协作', '专属数据看板', 'API 对接支持', '专属培训服务', '私有化部署选项', '7×24 专线支持'],
    cta: '联系销售', primary: false,
  },
];

const stats = [
  { value: 2000, suffix: '+', label: '活跃运营人员', icon: Users },
  { value: 15, suffix: '%↑', label: '平均签约转化率提升', icon: TrendingUp },
  { value: 3, suffix: 'x', label: '新人成长速度', icon: Zap },
  { value: 98, suffix: '%', label: '用户满意度', icon: Award },
];

// ─── 子组件 ─────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
      ))}
    </div>
  );
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function FloatingCard3D({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 300, damping: 30 });

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={e => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

function TestimonialCard({ t }: { t: { name: string; role: string; avatar: string; rating: number; text: string; tags: string[] } }) {
  return (
    <div className="flex-shrink-0 w-64 md:w-80">
      <Card className="rounded-2xl border-border shadow-sm h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <StarRating rating={t.rating} />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 flex-1 text-pretty">"{t.text}"</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {t.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {t.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NavBar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
      <Link to="/landing" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">美团阿波罗</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        {[['功能', '#features'], ['数据', '#stats'], ['评价', '#testimonials'], ['定价', '#pricing']].map(([label, href]) => (
          <a key={label} href={href} className="hover:text-foreground transition-colors">{label}</a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="rounded-lg text-sm hidden md:flex" onClick={() => navigate('/login')}>登录</Button>
        <Button size="sm" className="rounded-lg text-sm shadow-md shadow-primary/20 gap-1.5" onClick={() => navigate('/login')}>
          免费试用 <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}

// ─── 主组件 ─────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavBar />

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Floating decorative orbs */}
        {[
          { size: 'w-3 h-3', pos: 'top-1/4 left-16', delay: 0 },
          { size: 'w-2 h-2', pos: 'top-1/3 right-24', delay: 0.5 },
          { size: 'w-4 h-4', pos: 'bottom-1/3 left-32', delay: 1 },
          { size: 'w-2.5 h-2.5', pos: 'bottom-1/4 right-20', delay: 0.8 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute ${orb.pos} ${orb.size} bg-primary/40 rounded-full`}
            animate={{ y: [-12, 12, -12], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="rounded-full px-4 py-1.5 text-xs bg-primary/10 text-primary border-primary/20 mb-6 gap-2 inline-flex">
              <Sparkles className="w-3 h-3" /> AI 驱动的新一代运营工具
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-balance"
          >
            让每次拜访<br />
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">精准高效</span>
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty"
          >
            美团阿波罗 AI 插件内嵌运营后台，AI 实时诊断商家数据、生成定制话术、预测签约概率，让 2,000+ 运营人员效率倍增。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          >
            <Button size="lg" className="rounded-xl h-16 px-8 text-base shadow-xl shadow-primary/25 gap-2.5 font-semibold" onClick={() => navigate('/login')}>
              <Bot className="w-5 h-5" /> 立即免费体验
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl h-16 px-8 text-base gap-2.5" onClick={() => navigate('/')}>
              <Play className="w-4 h-4" /> 查看演示
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {['无需信用卡', '5分钟上手', '随时取消'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-success" />{t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-black text-primary">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs mb-4">核心功能</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">AI 赋能每个运营环节</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">六大核心能力，覆盖从商机发现到签约维护的全链路</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FloatingCard3D key={f.title} delay={i * 0.08}>
                <Card className={`h-full rounded-2xl border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br ${f.color} backdrop-blur-sm overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                      <f.icon className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="font-bold text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{f.desc}</p>
                  </CardContent>
                </Card>
              </FloatingCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials 双排无限滚动 ── */}
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs mb-4">用户评价</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">听听他们怎么说</h2>
            <p className="mt-4 text-muted-foreground text-pretty">来自全国各地运营团队的真实反馈</p>
          </motion.div>
        </div>

        {/* 上排：向左滚动 */}
        <div className="relative mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
            >
              {[...row1, ...row1].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* 下排：向右滚动 */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
            >
              {[...row2, ...row2].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 bg-muted/20 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs mb-4">定价方案</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">选择适合您的方案</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col"
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="rounded-full text-[10px] px-3 bg-primary text-primary-foreground shadow-lg shadow-primary/20">{plan.badge}</Badge>
                  </div>
                )}
                <Card className={`flex-1 rounded-2xl transition-all duration-300 ${plan.primary ? 'border-primary shadow-xl shadow-primary/15 scale-[1.02]' : 'border-border shadow-sm hover:shadow-md'}`}>
                  <CardContent className="p-7 flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="font-bold text-base">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-4xl font-black text-primary">{plan.price}</span>
                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                      </div>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <div className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-success" />
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`mt-8 w-full rounded-xl text-sm font-semibold h-11 ${plan.primary ? 'shadow-lg shadow-primary/20' : ''}`}
                      variant={plan.primary ? 'default' : 'outline'}
                      onClick={() => navigate('/login')}
                    >
                      {plan.cta} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-balance">
            现在就开始<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">提升运营效率</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg text-pretty max-w-xl mx-auto">
            加入 2,000+ 位美团运营人员，体验 AI 驱动的智能运营新范式。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" className="rounded-xl px-10 h-16 text-base shadow-xl shadow-primary/25 gap-2 font-semibold" onClick={() => navigate('/login')}>
              免费开始使用 <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl px-8 h-16 text-base gap-2" onClick={() => navigate('/')}>
              进入工作台 <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold">美团阿波罗</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed text-pretty">AI 驱动的商家智能运营平台，让每次拜访更精准、更高效。</p>
            </div>
            {[
              { title: '产品', items: ['功能介绍', '价格方案', '更新日志', 'API 文档'] },
              { title: '公司', items: ['关于我们', '加入团队', '合作伙伴', '媒体资料'] },
              { title: '支持', items: ['帮助中心', '联系客服', '用户协议', '隐私政策'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item}><span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{item}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">© 2026 美团阿波罗商家智能运营 AI 平台 · 保留所有权利</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

