import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone, MessageSquare, Users, Mail, Plus, Search, Clock,
  CheckCircle2, XCircle, RefreshCw, TrendingUp, AlertCircle, BarChart3,
  Bold, Italic, List, ListOrdered, Heading2, Link2, Minus as HrIcon,
  Pencil, Trash2, AlignLeft, Quote,
  Mic, ImageIcon, Paperclip, SendHorizonal, ChevronRight, Sparkles, Upload,
  BookOpen, MapPin, Utensils, Store, BarChart2, Zap, X, FileText, Play, Pause, Square,
  Brain, Package, Check,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { format, subDays, subHours } from 'date-fns';
import { streamChatCompletions } from '@/services/ai/deepseek';
import {
  getStoredCommRecords,
  saveStoredCommRecords,
  getStoredFollowUps,
  saveStoredFollowUps,
  getStoredMerchants,
  isThisMonth,
  isLastMonth
} from '@/services/mockData';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface CommRecord {
  id: string;
  merchant_name: string;
  channel: 'phone' | 'wechat' | 'face_to_face' | 'email';
  duration_minutes: number | null;
  content: string;
  result: 'connected' | 'no_answer' | 'rejected' | 'signed' | 'follow_up';
  contact_time: string;
  operator: string;
}

interface FollowUpItem {
  id: string;
  name: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  done: boolean;
}

const channelConfig = {
  phone: { label: '电话', icon: Phone, color: 'bg-primary/10 text-primary' },
  wechat: { label: '微信', icon: MessageSquare, color: 'bg-success/10 text-success' },
  face_to_face: { label: '面谈', icon: Users, color: 'bg-accent/10 text-accent' },
  email: { label: '邮件', icon: Mail, color: 'bg-info/10 text-info' },
};

const resultConfig = {
  connected: { label: '已接通', icon: CheckCircle2, color: 'text-success' },
  no_answer: { label: '未接听', icon: Clock, color: 'text-muted-foreground' },
  rejected: { label: '已拒绝', icon: XCircle, color: 'text-destructive' },
  signed: { label: '已签约', icon: TrendingUp, color: 'text-success' },
  follow_up: { label: '待跟进', icon: RefreshCw, color: 'text-warning' },
};

function genMockComms(count = 5): CommRecord[] {
  const merchants = ['四季香餐厅', '美丽时光美发', '欢乐城娱乐', '如家酒店', '快乐宝贝亲子园', '铁人健身', '洁美生活服务', '阳光口腔'];
  const channels: CommRecord['channel'][] = ['phone', 'wechat', 'face_to_face', 'email'];
  const results: CommRecord['result'][] = ['connected', 'no_answer', 'rejected', 'signed', 'follow_up'];
  const operators = ['王小明', '李晓红', '张伟', '陈静'];
  const contents = [
    '介绍了曝光提升计划，老板表示有意向，约下周再谈',
    '电话告知最新活动方案，对方未接听',
    '面谈深入了解暑期需求，签署了试用协议',
    '微信发送了数据报告，对方已查看',
    '沟通套餐价格，老板对 ROI 有疑虑，已发送案例',
    '跟进上次面谈，确认合同条款',
    '老板明确表示近期不考虑投放，标记为 3 个月后跟进',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `comm-${i}`,
    merchant_name: merchants[i % merchants.length],
    channel: channels[i % channels.length],
    duration_minutes: channels[i % channels.length] === 'phone' ? Math.round(5 + Math.random() * 25) : null,
    content: contents[i % contents.length],
    result: results[i % results.length],
    contact_time: (i < 10 ? subHours(new Date(), i * 2) : subDays(new Date(), Math.floor(i / 3))).toISOString(),
    operator: operators[i % operators.length],
  }));
}

const genInitialFollowUps = (): FollowUpItem[] => [
  { id: 'fu-1', name: '四季香餐厅', time: '今日 15:00', priority: 'high', reason: '昨日意向较强，需确认签约', done: false },
  { id: 'fu-2', name: '美丽时光美发', time: '明日 10:00', priority: 'high', reason: '对曝光套餐有疑问', done: false },
  { id: 'fu-3', name: '铁人健身', time: '后天 14:00', priority: 'medium', reason: '跟进暑期活动方案', done: false },
  { id: 'fu-4', name: '阳光口腔', time: '3天后', priority: 'low', reason: '常规季度回访', done: false },
];

const weeklyTrendData = [
  { day: '周一', count: 38 }, { day: '周二', count: 45 },
  { day: '周三', count: 52 }, { day: '周四', count: 41 },
  { day: '周五', count: 60 }, { day: '周六', count: 28 }, { day: '周日', count: 22 },
];

const statCards = [
  { label: '本月沟通', value: '286', sub: '较上月 +12%', up: true },
  { label: '接通率', value: '74%', sub: '行业均值 68%', up: true },
  { label: '本月签约', value: '18', sub: '转化率 6.3%', up: true },
  { label: '待跟进', value: '43', sub: '高优先级 12', up: false },
];

const priorityConfig = {
  high: { label: '高优', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: '中', color: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: '低', color: 'bg-muted text-muted-foreground border-border' },
};

// ──────────────────────────────────────────────
// 轻量富文本编辑器（基于 contentEditable）
// ──────────────────────────────────────────────
interface RichEditorProps { value: string; onChange: (v: string) => void; placeholder?: string; }

function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const toolbarBtns = [
    { icon: Bold, title: '加粗', cmd: 'bold' },
    { icon: Italic, title: '斜体', cmd: 'italic' },
    { icon: Heading2, title: '标题', cmd: 'formatBlock', val: 'h3' },
    { icon: AlignLeft, title: '段落', cmd: 'formatBlock', val: 'p' },
    { icon: Quote, title: '引用', cmd: 'formatBlock', val: 'blockquote' },
    { icon: List, title: '无序列表', cmd: 'insertUnorderedList' },
    { icon: ListOrdered, title: '有序列表', cmd: 'insertOrderedList' },
    { icon: HrIcon, title: '分割线', cmd: 'insertHorizontalRule' },
    { icon: Link2, title: '链接', cmd: 'createLink', val: prompt as unknown as string },
  ];

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/40">
        {toolbarBtns.map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              onMouseDown={e => {
                e.preventDefault();
                const val = btn.cmd === 'createLink' ? window.prompt('请输入链接地址') ?? '' : btn.val;
                exec(btn.cmd, val);
              }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
      {/* 编辑区 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[120px] max-h-56 overflow-y-auto p-3 text-sm focus:outline-none prose-sm
          [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-2 [&_h3]:mb-1
          [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
          [&_a]:text-primary [&_a]:underline
          empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// 主页面
// ──────────────────────────────────────────────
const EMPTY_FORM = { merchant: '', channel: 'phone', content: '', result: 'connected', duration: '' };

// ──────────────────────────────────────────────
// 小琪 AI 智能助手
// ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  type?: 'trend' | 'normal' | 'image' | 'voice' | 'file';
  mediaUrl?: string;
  fileName?: string;
  duration?: number;
}

const QUICK_QUESTIONS = [
  { icon: TrendingUp, text: '东北菜的市场热度还能持续上升吗？' },
  { icon: BarChart2, text: '川菜在餐饮市场中的份额能否进一步扩大？' },
  { icon: Utensils, text: '淮扬菜在未来几年有没有增长潜力？' },
  { icon: MapPin, text: '在朝阳区开一家火锅店，选址建议是什么？' },
  { icon: Store, text: '我店评分4.6，如何快速提升到4.8以上？' },
  { icon: BookOpen, text: '夏季外卖菜品研发方向有哪些热门趋势？' },
];


const MOCK_ANSWERS: Record<string, string> = {
  '东北菜': '根据近3个月搜索数据，东北菜整体热度指数同比上升18%，尤其锅包肉、酸菜白肉相关词条搜索量增长显著。但竞争也在加剧，头部品牌占据约42%市场份额。建议差异化定位，主打家常口味+性价比，客单价控制在55-75元区间，配合外卖曝光套餐效果最佳。',
  '川菜': '川菜目前仍是外卖第一大品类，市场份额约28%，但增速放缓至每年3.2%。增量主要来自下沉市场与夜经济场景。建议针对午市（11:00-13:00）和夜宵（21:00-23:00）分别设计菜单，可有效提升全天营业额15-20%。',
  '淮扬菜': '淮扬菜近年来随着精致餐饮趋势走强，客单价和品牌溢价空间持续提升。预测未来3年复合增长率约9.5%，尤其在一、二线城市商务宴请场景潜力巨大。建议提升摆盘精致度，配合美团图文直播展示烹饪工艺，可显著提升新客转化。',
  '朝阳区': '朝阳区CBD片区（国贸/三里屯/望京）火锅密度较高，竞争激烈；推荐选址朝青板块（百子湾/双井）或太阳宫板块，这两个区域外卖需求旺盛但优质火锅供给不足。建议选择100-200㎡临街旺铺，覆盖半径控制在1.5km内，配合堂食+外卖双轮驱动。',
  '评分': '从4.6提升到4.8的核心路径：①差评管理：分析近30条差评，63%集中在配送时效，建议优化备餐时间至12分钟内；②好评引导：在小票或包装上印"扫码评价送优惠券"，可提升好评率约25%；③菜品质量：重点优化TOP3销售菜品的口味一致性。预计执行45天后评分可达4.8。',
  '夏季': '7-8月外卖热门趋势：①冷饮茶饮类（增长67%）：冷萃咖啡、鲜榨果茶、氮气冰淇淋；②轻食减脂类（增长43%）：沙拉、魔芋面、低卡套餐；③消暑主食（增长31%）：冷面、冰粉、各类凉拌。建议增加夏季限定套餐，标注"消暑/减脂"等标签，可提升曝光权重约40%。',
};

interface Skill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  enabled: boolean;
  isPreset: boolean;
}

const PRESET_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    name: '经营痛点深度诊断',
    description: '智能解析商家核心运营指标，精准识别获客、留存、复购等12类痛点并估算营收损失',
    prompt: '你已启用【经营痛点深度诊断】技能。请在分析商家时，着重诊断其经营数据中的潜在痛点，如新客获取成本、老客留存周期、点评评分等，提供专业的痛点分级与可量化的损失预估。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'skill-2',
    name: '多场景高转化话术生成',
    description: '根据商家品类与特色，定制电话口播、微信轻问候、面谈深度异议处理话术',
    prompt: '你已启用【多场景高转化话术生成】技能。在为用户生成沟通话术时，请提供三种细分方案：(1) 电话：30秒极速触达与痛点直击；(2) 微信：高接通轻量化问候与意向试探；(3) 面谈：基于商家画像的深度谈判逻辑与常见异议处理技巧。',
    enabled: true,
    isPreset: true,
  },
  {
    id: 'skill-3',
    name: '品类与季节套餐组合推荐',
    description: '结合当前品类、季节因素及历史ROI数据，推算最优推广与曝光套餐方案',
    prompt: '你已启用【品类与季节套餐组合推荐】技能。请在涉及套餐方案推荐时，深度融合商家的主营品类、商圈定位及当前季节特征（如夏季冷饮旺季、冬季热餐促销），设计高 ROI 组合，并清晰列出主推套餐与备选套餐的价格、权益及预期回报对比。',
    enabled: false,
    isPreset: true,
  },
  {
    id: 'skill-4',
    name: '签约意向行为轨迹预测',
    description: '基于接通率、沟通反馈等多维意向分析，量化签约概率，识别主要阻碍点',
    prompt: '你已启用【签约意向行为轨迹预测】技能。在评估签约倾向时，请结合商家的意向级别、历史接通频率等指标进行智能预测，量化签约概率并指出阻碍签约的关键卡点，提供针对性的推进策略。',
    enabled: false,
    isPreset: true,
  },
  {
    id: 'skill-5',
    name: '流失客户精准关怀召回',
    description: '针对长期静默的低活老商家，设计专属特惠返利方案与召回话术',
    prompt: '你已启用【流失客户精准关怀召回】技能。在生成跟进方案时，请特别针对沉默超30天的低活商家，设计专属返利套餐关怀话术与分阶段唤醒方案，提升老客户留存率。',
    enabled: false,
    isPreset: true,
  }
];

function XiaoqiAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingMedia, setPendingMedia] = useState<{ type: 'image' | 'file'; url: string; name: string } | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState('四季香餐厅');

  // Skills management state
  const [skills, setSkills] = useState<Skill[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meitx_ai_skills');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }
    return PRESET_SKILLS;
  });
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [skillsTab, setSkillsTab] = useState<'presets' | 'custom' | 'preview'>('presets');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const audioRefMap = useRef<Record<string, HTMLAudioElement>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importSkillRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('meitx_ai_skills', JSON.stringify(skills));
  }, [skills]);

  const importSkillsFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          if (!parsed.name || !parsed.prompt) {
            toast.error('JSON格式不正确，必须包含 name 和 prompt 字段');
            return;
          }
          const newSkill: Skill = {
            id: `skill-custom-${Date.now()}`,
            name: parsed.name,
            description: parsed.description || '导入的自定义技能',
            prompt: parsed.prompt,
            enabled: true,
            isPreset: false
          };
          setSkills(prev => [...prev, newSkill]);
          toast.success(`技能【${parsed.name}】导入成功！`);
        } catch {
          toast.error('JSON解析失败，请检查文件格式');
        }
      } else {
        const name = file.name.replace(/\.[^/.]+$/, "");
        const newSkill: Skill = {
          id: `skill-custom-${Date.now()}`,
          name: name,
          description: '导入的自定义技能',
          prompt: content.trim(),
          enabled: true,
          isPreset: false
        };
        setSkills(prev => [...prev, newSkill]);
        toast.success(`自定义技能【${name}】导入成功！`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  const askAssistant = useCallback(async (text: string, mediaUrl?: string, mediaType?: ChatMessage['type'], fileName?: string) => {
    const displayText = text || (mediaType === 'voice' ? '[语音消息]' : mediaType === 'image' ? '[图片]' : fileName || '[文件]');
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: displayText, type: mediaType, mediaUrl, fileName };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setPendingMedia(null);
    setIsTyping(true);
    scrollToBottom();

    const assistantId = `a-${Date.now()}`;
    let accumulatedText = '';

    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '' }]);
    setIsTyping(false);

    // Build consolidated system prompt based on enabled skills
    const enabledSkills = skills.filter(s => s.enabled);
    let systemPrompt = `你是一个美团智慧运营平台，名字叫“小琪”。`;
    if (enabledSkills.length > 0) {
      systemPrompt += `\n当前启用的运营技能（请务必严格遵循这些技能包的行为模式和策略输出回答）：\n\n` +
        enabledSkills.map(s => `【${s.name}】：\n${s.prompt}`).join('\n\n');
    }

    const apiHistory = [
      { role: 'system' as const, content: systemPrompt }
    ];

    messages.forEach(m => {
      apiHistory.push({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.text
      });
    });
    apiHistory.push({ role: 'user' as const, content: displayText });

    try {
      await streamChatCompletions(
        apiHistory,
        (chunk) => {
          accumulatedText += chunk;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: accumulatedText } : m));
          scrollToBottom();
        },
        (fullText) => {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: fullText } : m));
          scrollToBottom();
        },
        (err) => {
          console.error(err);
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: `AI助手调用失败，请检查网络设置或API_KEY配置。\n\n具体错误：${err.message || '未知错误'}` } : m));
          scrollToBottom();
        }
      );
    } catch (e: any) {
      console.error(e);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: `系统错误: ${e.message || '调用失败'}` } : m));
      scrollToBottom();
    }
  }, [messages, skills]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed && !pendingMedia) return;
    askAssistant(trimmed, pendingMedia?.url, pendingMedia?.type, pendingMedia?.name);
  }, [pendingMedia, askAssistant]);

  /* ── 语音录制 ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        askAssistant('[语音消息]', url, 'voice');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      toast.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  /* ── 图片 / 附件上传 ── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('请选择图片文件'); e.target.value = ''; return; }
    const url = URL.createObjectURL(file);
    setPendingMedia({ type: 'image', url, name: file.name });
    e.target.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingMedia({ type: 'file', url, name: file.name });
    e.target.value = '';
  };

  const formatRecordTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleVoicePlay = (msgId: string, url?: string) => {
    if (!url) return;
    const audio = audioRefMap.current[msgId] || new Audio(url);
    audioRefMap.current[msgId] = audio;
    if (playingVoiceId === msgId) {
      audio.pause();
      setPlayingVoiceId(null);
    } else {
      if (playingVoiceId && audioRefMap.current[playingVoiceId]) {
        audioRefMap.current[playingVoiceId].pause();
      }
      audio.play().then(() => setPlayingVoiceId(msgId)).catch(() => toast.error('语音播放失败'));
      audio.onended = () => setPlayingVoiceId(null);
    }
  };

  const showWelcome = messages.length === 0;

  const AI_CAPABILITIES = [
    { id: 'diagnose', title: 'AI 智能诊断', icon: Brain, desc: '自动识别 12 类经营痛点，定位改善机会', promptText: (mName: string) => `我正在跟进商家【${mName}】，请为该商家做【AI 智能诊断】。请结合其经营数据，自动识别12类经营痛点（如新客不足、老客流存差、曝光偏低等），并给出精准定位改善机会建议。` },
    { id: 'decision', title: '数据驱动决策', icon: BarChart3, desc: '雷达图综合评估，趋势预测助您提前布局', promptText: (mName: string) => `我正在跟进商家【${mName}】，请为该商家做【数据驱动决策】分析。请评估商家的多维度数据，进行雷达图综合评估，并给出趋势预测以助我提前布局。` },
    { id: 'script', title: '智能话术生成', icon: MessageSquare, desc: '动态生成个性化沟通话术，支持电话/微信/面谈', promptText: (mName: string) => `我正在跟进商家【${mName}】，请为该商家做【智能话术生成】。根据商家画像，动态生成个性化沟通话术，分别支持电话（30秒话术）、微信（轻触达话术）和面谈（深度异议处理）三种场景。` },
    { id: 'package', title: '精准套餐推荐', icon: Package, desc: '结合季节、品类、历史数据推算最高 ROI 组合', promptText: (mName: string) => `我正在跟进商家【${mName}】，请为该商家做【精准套餐推荐】。请结合其品类、当前季节和历史数据，推算最适合的、最高 ROI 的推荐套餐与备选套餐组合。` },
    { id: 'predict', title: '签约预测引擎', icon: TrendingUp, desc: '基于行为轨迹预测接受概率，让访问有的放矢', promptText: (mName: string) => `我正在跟进商家【${mName}】，请为该商家进行【签约预测引擎】意向分析。评估其签约意向概率（如高/中/低），指出正向因素与潜在风险，并给出相应的促签约跟进建议。` },
    { id: 'track', title: '全链路跟踪', icon: RefreshCw, desc: '沟通记录、跟进提醒、话术反馈闭环不丢商机', promptText: (mName: string) => `我正在跟进商家【${mName}】，请设计【全链路跟踪】跟进闭环方案。包括第一步、第二步、第三步的具体实施动作，并指导如何使用跟进提醒实现商机不流失。` }
  ];

  // Custom merchants state
  const [customMerchants, setCustomMerchants] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meitx_custom_merchants');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch { }
      }
    }
    return [];
  });

  const merchants = useMemo(() => {
    const base = ['四季香餐厅', '美丽时光美发', '欢乐城娱乐', '如家酒店', '快乐宝贝亲子园'];
    const storedMerchants = getStoredMerchants().map(m => m.name);
    return Array.from(new Set([...base, ...storedMerchants, ...customMerchants]));
  }, [customMerchants]);

  // Link parsing state
  const [linkParseOpen, setLinkParseOpen] = useState(false);
  const [merchantLink, setMerchantLink] = useState('');
  const [isParsingLink, setIsParsingLink] = useState(false);
  const importMerchantRef = useRef<HTMLInputElement>(null);

  const handleImportMerchantFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          const name = parsed.name || parsed.merchantName;
          if (!name) {
            toast.error('JSON格式不正确，必须包含 name 字段');
            return;
          }
          setCustomMerchants(prev => {
            const updated = Array.from(new Set([...prev, name]));
            localStorage.setItem('meitx_custom_merchants', JSON.stringify(updated));
            return updated;
          });
          setSelectedMerchant(name);
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: 'assistant',
              text: `### 📂 成功导入商家档案！\n\n- **商家名称**: ${name}\n- **主要品类**: ${parsed.category || '未知'}\n- **主要数据**: 月销售额: ${parsed.monthlySales ? `¥${parsed.monthlySales}` : '暂无'} / 点评评分: ${parsed.rating || '暂无'}\n\n已自动将该商家设定为当前分析目标。您可以立即使用下方的 AI 诊断与话术生成功能进行进一步分析！`
            }
          ]);
          toast.success(`成功导入并选择商家：${name}`);
        } catch {
          toast.error('JSON解析失败，请检查文件格式');
        }
      } else {
        const name = file.name.replace(/\.[^/.]+$/, "");
        setCustomMerchants(prev => {
          const updated = Array.from(new Set([...prev, name]));
          localStorage.setItem('meitx_custom_merchants', JSON.stringify(updated));
          return updated;
        });
        setSelectedMerchant(name);
        setMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'assistant',
            text: `### 📂 成功导入商家文本档案！\n\n已提取商家名称为【${name}】，并成功设定为当前分析目标。您可以立即使用下方的 AI 诊断与话术生成功能！`
          }
        ]);
        toast.success(`成功导入商家：${name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleParseMerchantLink = async () => {
    if (!merchantLink.trim()) return;
    setIsParsingLink(true);
    try {
      const apiKey = import.meta.env.VITE_PROXY_API_KEY || 'sk-02260d10c28c4bb4b65bace15ba5f754';
      const response = await fetch('/api/innoreation/v1/proxy/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Proxy-API-Key': apiKey,
          'X-Proxy-Key': apiKey,
          'Proxy API Key': apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-v4-pro',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的网页解析AI，专门解析美团和点评的商家详情页。请根据用户提供的链接或提示，智能解析并生成一个模拟 of 商家画像。返回格式必须是JSON，如：{"name":"商家店名","category":"火锅","score":4.7,"intro":"主打川味麻辣火锅，客流量大"}'
            },
            {
              role: 'user',
              content: `解析链接: ${merchantLink}`
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error('解析接口返回失败');
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '';
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.name) {
          setCustomMerchants(prev => {
            const updated = Array.from(new Set([...prev, parsed.name]));
            localStorage.setItem('meitx_custom_merchants', JSON.stringify(updated));
            return updated;
          });
          setSelectedMerchant(parsed.name);

          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: 'assistant',
              text: `### 🔗 成功解析商家链接！\n\n- **商家名称**: ${parsed.name}\n- **主要品类**: ${parsed.category || '未知'}\n- **商家评分**: ⭐️ ${parsed.score || '暂无'}\n- **经营简介**: ${parsed.intro || '无'}\n\n已自动将该商家设定为当前分析目标。您可以立即使用下方的 AI 诊断与话术生成功能进行进一步分析！`
            }
          ]);

          toast.success(`成功解析商家：${parsed.name}`);
          setLinkParseOpen(false);
          setMerchantLink('');
        } else {
          throw new Error('解析的JSON中未包含 name 字段');
        }
      } else {
        throw new Error('未在AI回复中匹配到JSON内容');
      }
    } catch (error: any) {
      console.error('Link parsing error, using mock parser:', error);
      const mockName = merchantLink.includes('meishi') ? '蜀香园老火锅' : '阿波罗咖啡馆';
      const mockCategory = merchantLink.includes('meishi') ? '火锅' : '咖啡';
      setCustomMerchants(prev => {
        const updated = Array.from(new Set([...prev, mockName]));
        localStorage.setItem('meitx_custom_merchants', JSON.stringify(updated));
        return updated;
      });
      setSelectedMerchant(mockName);
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          text: `### 🔗 成功解析商家链接（测试模拟）！\n\n- **商家名称**: ${mockName}\n- **主要品类**: ${mockCategory}\n- **商家评分**: ⭐️ 4.6\n- **经营简介**: 链接已成功提取，这是一个地道的美食/休闲商户，适合通过新客爆发套餐拓展曝光。\n\n已自动将该商家设定为当前分析目标。您可以立即使用下方的 AI 诊断与话术生成功能！`
        }
      ]);
      toast.success(`成功解析商家：${mockName}`);
      setLinkParseOpen(false);
      setMerchantLink('');
    } finally {
      setIsParsingLink(false);
    }
  };

  function renderMarkdown(text: string) {
    if (!text) return <p className="text-muted-foreground italic">正在生成中...</p>;
    return text.split('\n').map((line, idx) => {
      const content = line.trim();
      if (content.startsWith('### ')) {
        return <h3 key={idx} className="font-bold text-base mt-2 mb-1 text-primary">{content.substring(4)}</h3>;
      }
      if (content.startsWith('#### ')) {
        return <h4 key={idx} className="font-bold text-sm mt-1.5 mb-1 text-foreground">{content.substring(5)}</h4>;
      }
      if (content.startsWith('**') && content.endsWith('**')) {
        return <p key={idx} className="font-bold text-sm mt-1">{content.replace(/\*\*/g, '')}</p>;
      }
      if (content.startsWith('- ') || content.startsWith('* ')) {
        const cleanText = content.substring(2);
        if (cleanText.includes('**')) {
          const parts = cleanText.split('**');
          return (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground ml-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>
                {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{p}</strong> : p)}
              </span>
            </div>
          );
        }
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground ml-2 my-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>{cleanText}</span>
          </div>
        );
      }
      if (content.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-1.5 bg-muted/30 py-1 rounded-sm">
            {content.substring(2)}
          </blockquote>
        );
      }
      if (content.includes('**')) {
        const parts = content.split('**');
        return (
          <p key={idx} className="my-1">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{p}</strong> : p)}
          </p>
        );
      }
      return <p key={idx} className="my-1">{line}</p>;
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height: 'calc(100vh - 180px)', minHeight: 520 }}>
      {/* 滚动内容区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-4 pb-2">
        {showWelcome ? (
          <div className="pt-4 space-y-4">
            {/* 欢迎头部 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/10"
            >
              <img
                src="/person.jpg"
                alt="小琪"
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-sm shrink-0"
              />
              <div>
                <p className="text-base md:text-lg font-black text-foreground leading-snug">
                  "老板，你好！我是小琪。
                  <br />我可以为您提供全链路的智能建议服务。"
                </p>
              </div>
            </motion.div>

            {/* 商家选择器 & AI 能力矩阵 */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 bg-muted/30 p-2.5 rounded-xl border border-border">
                <span className="text-xs font-semibold text-foreground">目标分析商家：</span>
                <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                  <SelectTrigger className="w-44 h-8 text-xs rounded-md">
                    <SelectValue placeholder="选择商家" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    {merchants.map(m => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Parse/Import Actions */}
                <input
                  ref={importMerchantRef}
                  type="file"
                  accept=".txt,.json"
                  className="hidden"
                  onChange={handleImportMerchantFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-[11px] h-7 px-2.5 gap-1 hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => importMerchantRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  导入商家档案
                </Button>

                <Dialog open={linkParseOpen} onOpenChange={setLinkParseOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-[11px] h-7 px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      解析详情页
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-xl p-5">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-1.5 text-base font-bold">
                        <Link2 className="w-4.5 h-4.5 text-primary" />
                        解析美团商家详情页链接
                      </DialogTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        输入美团、点评商家详情页链接，调用 AI 解析商家档案并自动选定为当前分析目标。
                      </p>
                    </DialogHeader>
                    <div className="space-y-3.5 my-3">
                      <Input
                        placeholder="https://www.meituan.com/meishi/..."
                        value={merchantLink}
                        onChange={e => setMerchantLink(e.target.value)}
                        className="rounded-lg text-xs"
                      />
                      {isParsingLink && (
                        <div className="flex items-center justify-center gap-2 py-4 text-xs text-primary font-medium">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                          正在调用 deepseek-v4-pro 解析商家链接...
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex items-center gap-2 pt-2 border-t border-border mt-4 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-xs"
                        onClick={() => { setLinkParseOpen(false); setMerchantLink(''); }}
                        disabled={isParsingLink}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-lg text-xs"
                        onClick={handleParseMerchantLink}
                        disabled={isParsingLink || !merchantLink.trim()}
                      >
                        立即解析
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {AI_CAPABILITIES.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <motion.button
                      key={cap.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      onClick={() => askAssistant(cap.promptText(selectedMerchant))}
                      className="flex items-start gap-3 p-3 text-left rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{cap.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{cap.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <img
                      src="/favicon.png"
                      alt="AI"
                      className="w-8 h-8 rounded-md shrink-0 object-contain p-1 border border-border bg-background"
                    />
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                    {msg.type === 'image' && msg.mediaUrl ? (
                      <img src={msg.mediaUrl} alt="用户图片" className="rounded-lg max-w-[200px] max-h-[200px] w-full h-auto object-cover" />
                    ) : msg.type === 'voice' && msg.mediaUrl ? (
                      <button
                        onClick={() => toggleVoicePlay(msg.id, msg.mediaUrl)}
                        className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                      >
                        {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="text-xs">{playingVoiceId === msg.id ? '播放中' : '点击播放'}</span>
                      </button>
                    ) : msg.type === 'file' && msg.mediaUrl ? (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline break-words">
                        <FileText className="w-4 h-4 shrink-0" /> {msg.fileName || '附件文件'}
                      </a>
                    ) : msg.role === 'assistant' ? (
                      renderMarkdown(msg.text)
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <img
                  src="/favicon.png"
                  alt="AI"
                  className="w-8 h-8 rounded-md shrink-0 object-contain p-1 border border-border bg-background"
                />
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions at the bottom of messages list */}
            {!isTyping && messages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border mt-4">
                <p className="text-[10px] text-muted-foreground w-full mb-1">针对当前商家【{selectedMerchant}】快速执行：</p>
                {AI_CAPABILITIES.map(cap => {
                  const Icon = cap.icon;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => askAssistant(cap.promptText(selectedMerchant))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border bg-card hover:bg-primary/5 hover:border-primary/20 text-xs text-foreground transition-all"
                    >
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span>{cap.title.split(' ')[1] || cap.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 多模态输入区 */}
      <div className="shrink-0 border-t border-border px-4 py-3 bg-background space-y-2.5">
        {/* 语音 / 图片 / 附件 工具栏 */}
        {isRecording ? (
          <div className="flex items-center gap-3 rounded-full px-4 py-2 bg-destructive/10 text-destructive text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
            </span>
            <span>正在录音 {formatRecordTime(recordingTime)}</span>
            <button onClick={stopRecording} className="ml-auto flex items-center gap-1 text-xs bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity">
              <Square className="w-3 h-3" />停止
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              语音
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              图片
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              附件
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

            {/* Skills Button */}
            <button
              onClick={() => setSkillsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all shrink-0"
            >
              <Brain className="w-3.5 h-3.5 text-primary" />
              Skills 技能库
              {skills.filter(s => s.enabled).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-white font-bold h-4 leading-none flex items-center justify-center animate-pulse">
                  {skills.filter(s => s.enabled).length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* 待发送附件预览 */}
        {pendingMedia && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border">
            {pendingMedia.type === 'image' ? (
              <img src={pendingMedia.url} alt="待发送" className="h-12 w-12 rounded-lg object-cover border border-border" />
            ) : (
              <div className="flex items-center gap-2 text-xs text-foreground">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="max-w-[180px] truncate">{pendingMedia.name}</span>
              </div>
            )}
            <button onClick={() => setPendingMedia(null)} className="ml-auto p-1 rounded-full hover:bg-muted text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 输入框 */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-full border border-border px-3 py-2 focus-within:border-primary/40 transition-colors">
          <input
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); } }}
            placeholder="有问题随时问我..."
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() && !pendingMedia}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-primary disabled:bg-muted text-primary-foreground hover:opacity-90 transition-all ml-0.5"
          >
            <SendHorizonal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Skills 技能库管理弹窗 ── */}
      <Dialog open={skillsOpen} onOpenChange={setSkillsOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl rounded-xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="pb-2 border-b border-border shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Brain className="w-5 h-5 text-primary" />
              AI 运营技能库 (Skills)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              启用预设运营技能包或导入自定义技能文件，辅助 AI 的对话分析与精准策略输出。
            </p>
          </DialogHeader>

          <Tabs value={skillsTab} onValueChange={(v: any) => setSkillsTab(v)} className="flex-1 flex flex-col min-h-0 mt-4">
            <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted/60 p-1 shrink-0">
              <TabsTrigger value="presets" className="rounded-md text-xs font-medium py-1.5">预设技能 ({skills.filter(s => s.isPreset).length})</TabsTrigger>
              <TabsTrigger value="custom" className="rounded-md text-xs font-medium py-1.5">自定义技能 ({skills.filter(s => !s.isPreset).length})</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-md text-xs font-medium py-1.5">全局 Prompt 预览</TabsTrigger>
            </TabsList>

            {/* 预设技能 Tab */}
            <TabsContent value="presets" className="flex-1 overflow-y-auto min-h-0 py-3 space-y-3">
              {skills.filter(s => s.isPreset).map(skill => (
                <div
                  key={skill.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${skill.enabled
                    ? 'border-primary/20 bg-gradient-to-r from-primary/5 to-transparent'
                    : 'border-border bg-card'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${skill.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">{skill.name}</h4>
                      <Switch
                        checked={skill.enabled}
                        onCheckedChange={(checked) => {
                          setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, enabled: checked } : s));
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{skill.description}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* 自定义技能 Tab */}
            <TabsContent value="custom" className="flex-1 flex flex-col min-h-0 py-3">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs text-muted-foreground">支持导入 .txt 或 .json 格式的技能Prompt文件</span>
                <div className="flex gap-2">
                  <input
                    ref={importSkillRef}
                    type="file"
                    accept=".txt,.json"
                    className="hidden"
                    onChange={importSkillsFromFile}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs h-8 border-dashed"
                    onClick={() => importSkillRef.current?.click()}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    导入技能文件
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
                {skills.filter(s => !s.isPreset).length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground bg-muted/20">
                    <FileText className="w-8 h-8 text-muted-foreground/50 mb-2 stroke-[1.5]" />
                    <p className="text-xs">暂无自定义技能包</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">点击右上角按钮导入您本地的技能Prompt</p>
                  </div>
                ) : (
                  skills.filter(s => !s.isPreset).map(skill => (
                    <div
                      key={skill.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${skill.enabled
                        ? 'border-primary/20 bg-gradient-to-r from-primary/5 to-transparent'
                        : 'border-border bg-card'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${skill.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-foreground truncate">{skill.name}</h4>
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={skill.enabled}
                              onCheckedChange={(checked) => {
                                setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, enabled: checked } : s));
                              }}
                            />
                            <button
                              onClick={() => {
                                setSkills(prev => prev.filter(s => s.id !== skill.id));
                                toast.success('已删除自定义技能');
                              }}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed truncate">{skill.description}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 line-clamp-2 bg-muted/40 p-2 rounded-lg">{skill.prompt}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* 全局 Prompt 预览 Tab */}
            <TabsContent value="preview" className="flex-1 flex flex-col min-h-0 py-3">
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <span className="text-xs text-muted-foreground">当前拼接并注入给 AI Assistant 的 System Prompt 预览：</span>
                <div className="flex-1 bg-muted/60 border border-border rounded-xl p-3 font-mono text-[11px] overflow-auto leading-relaxed select-all">
                  <pre className="whitespace-pre-wrap text-foreground">
                    {`你是一个美团阿波罗智慧运营AI平台助理，名字叫“小琪”。\n\n` +
                      (skills.filter(s => s.enabled).length > 0
                        ? `当前启用的运营技能（请务必严格遵循这些技能包的行为模式和策略输出回答）：\n\n` +
                        skills.filter(s => s.enabled).map(s => `【${s.name}】：\n${s.prompt}`).join('\n\n')
                        : '（未启用任何特定运营技能包，将以基础运营助理身份进行回答）')
                    }
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t border-border shrink-0 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={() => {
                setSkills(PRESET_SKILLS);
                toast.success('已恢复为默认预设技能包');
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              恢复默认
            </Button>
            <Button
              size="sm"
              className="rounded-lg text-xs px-4"
              onClick={() => setSkillsOpen(false)}
            >
              确定并保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CommunicationPage() {
  const [records, setRecords] = useState<CommRecord[]>(() => getStoredCommRecords());
  const [keyword, setKeyword] = useState('');
  const [channel, setChannel] = useState('all');
  const [result, setResult] = useState('all');
  const [activeTab, setActiveTab] = useState('xiaoqi');

  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<CommRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => getStoredFollowUps());
  const [fuAddOpen, setFuAddOpen] = useState(false);
  const [fuForm, setFuForm] = useState({ name: '', time: '', priority: 'medium', reason: '' });
  const [fuDeleteId, setFuDeleteId] = useState<string | null>(null);
  const [fuEditTarget, setFuEditTarget] = useState<FollowUpItem | null>(null);

  // Sync state back to localStorage
  useEffect(() => {
    saveStoredCommRecords(records);
  }, [records]);

  useEffect(() => {
    saveStoredFollowUps(followUps);
  }, [followUps]);

  const filtered = useMemo(() => records.filter(r => {
    if (keyword && !r.merchant_name.includes(keyword) && !r.content.includes(keyword)) return false;
    if (channel !== 'all' && r.channel !== channel) return false;
    if (result !== 'all' && r.result !== result) return false;
    return true;
  }), [records, keyword, channel, result]);

  const pendingFollowUps = followUps.filter(f => !f.done);

  const computedStatCards = useMemo(() => {
    const thisMonthComm = records.filter(r => isThisMonth(r.contact_time)).length;
    const lastMonthComm = records.filter(r => isLastMonth(r.contact_time)).length;
    const commDiff = thisMonthComm - lastMonthComm;
    const commGrowth = lastMonthComm > 0 ? (commDiff / lastMonthComm) * 100 : 0;
    const commGrowthSign = commGrowth >= 0 ? '+' : '';
    const commSub = lastMonthComm > 0 ? `较上月 ${commGrowthSign}${commGrowth.toFixed(0)}%` : '较上月 +0%';

    const connectedRecords = records.filter(r => r.result !== 'no_answer' && isThisMonth(r.contact_time));
    const connectionRate = thisMonthComm > 0 ? (connectedRecords.length / thisMonthComm) * 100 : 0;

    const thisMonthSigned = records.filter(r => r.result === 'signed' && isThisMonth(r.contact_time)).length;
    const signedRate = thisMonthComm > 0 ? (thisMonthSigned / thisMonthComm) * 100 : 0;

    const pendingCount = followUps.filter(f => !f.done).length;
    const highPriorityCount = followUps.filter(f => !f.done && f.priority === 'high').length;

    return [
      { label: '本月沟通', value: String(thisMonthComm), sub: commSub, up: commGrowth >= 0 },
      { label: '接通率', value: `${connectionRate.toFixed(0)}%`, sub: '行业均值 68%', up: connectionRate >= 68 },
      { label: '本月签约', value: String(thisMonthSigned), sub: `转化率 ${signedRate.toFixed(1)}%`, up: true },
      { label: '待跟进', value: String(pendingCount), sub: `高优先级 ${highPriorityCount}`, up: false },
    ];
  }, [records, followUps]);

  // ── 沟通记录 CRUD ──
  const handleAddRecord = () => {
    if (!form.merchant.trim() || !form.content.trim()) { toast.error('请填写商家和沟通内容'); return; }
    const newRec: CommRecord = {
      id: `comm-new-${Date.now()}`,
      merchant_name: form.merchant,
      channel: form.channel as CommRecord['channel'],
      duration_minutes: form.duration ? Number(form.duration) : null,
      content: form.content,
      result: form.result as CommRecord['result'],
      contact_time: new Date().toISOString(),
      operator: '当前用户',
    };
    setRecords(prev => [newRec, ...prev]);
    toast.success('沟通记录已保存');
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleEditRecord = () => {
    if (!editRecord || !form.merchant.trim() || !form.content.trim()) { toast.error('请填写商家和沟通内容'); return; }
    setRecords(prev => prev.map(r => r.id === editRecord.id
      ? { ...r, merchant_name: form.merchant, channel: form.channel as CommRecord['channel'], content: form.content, result: form.result as CommRecord['result'], duration_minutes: form.duration ? Number(form.duration) : null }
      : r
    ));
    toast.success('记录已更新');
    setEditRecord(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (r: CommRecord) => {
    setEditRecord(r);
    setForm({ merchant: r.merchant_name, channel: r.channel, content: r.content, result: r.result, duration: String(r.duration_minutes ?? '') });
  };

  // ── 待跟进 CRUD ──
  const handleAddFu = () => {
    if (!fuForm.name.trim()) { toast.error('请输入商家名称'); return; }
    setFollowUps(prev => [...prev, { id: `fu-${Date.now()}`, name: fuForm.name, time: fuForm.time || '待定', priority: fuForm.priority as 'high' | 'medium' | 'low', reason: fuForm.reason, done: false }]);
    toast.success('待跟进任务已添加');
    setFuAddOpen(false);
    setFuForm({ name: '', time: '', priority: 'medium', reason: '' });
  };

  const handleEditFu = () => {
    if (!fuEditTarget) return;
    setFollowUps(prev => prev.map(f => f.id === fuEditTarget.id ? { ...f, name: fuForm.name, time: fuForm.time, priority: fuForm.priority as 'high' | 'medium' | 'low', reason: fuForm.reason } : f));
    toast.success('跟进任务已更新');
    setFuEditTarget(null);
    setFuForm({ name: '', time: '', priority: 'medium', reason: '' });
  };

  return (
    <AppLayout title="沟通记录">
      {/* ── 新增沟通弹窗 ── */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setForm(EMPTY_FORM); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-sm">
          <DialogHeader><DialogTitle>记录本次沟通</DialogTitle></DialogHeader>
          <CommFormFields form={form} setForm={setForm} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setAddOpen(false)}>取消</Button>
            <Button className="flex-1 rounded-sm" onClick={handleAddRecord}>保存记录</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 编辑沟通弹窗 ── */}
      <Dialog open={!!editRecord} onOpenChange={v => { if (!v) { setEditRecord(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-sm">
          <DialogHeader><DialogTitle>编辑沟通记录</DialogTitle></DialogHeader>
          <CommFormFields form={form} setForm={setForm} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setEditRecord(null)}>取消</Button>
            <Button className="flex-1 rounded-sm" onClick={handleEditRecord}>保存修改</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 删除沟通确认 ── */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm rounded-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">确定要删除此沟通记录吗？</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" className="flex-1 rounded-sm" onClick={() => { setRecords(p => p.filter(r => r.id !== deleteId)); toast.success('已删除'); setDeleteId(null); }}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 新增跟进弹窗 ── */}
      <Dialog open={fuAddOpen} onOpenChange={v => { setFuAddOpen(v); if (!v) setFuForm({ name: '', time: '', priority: 'medium', reason: '' }); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-sm">
          <DialogHeader><DialogTitle>新增待跟进</DialogTitle></DialogHeader>
          <FollowUpFormFields form={fuForm} setForm={setFuForm} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setFuAddOpen(false)}>取消</Button>
            <Button className="flex-1 rounded-sm" onClick={handleAddFu}>添加</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 编辑跟进弹窗 ── */}
      <Dialog open={!!fuEditTarget} onOpenChange={v => { if (!v) { setFuEditTarget(null); setFuForm({ name: '', time: '', priority: 'medium', reason: '' }); } }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-sm">
          <DialogHeader><DialogTitle>编辑跟进任务</DialogTitle></DialogHeader>
          <FollowUpFormFields form={fuForm} setForm={setFuForm} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setFuEditTarget(null)}>取消</Button>
            <Button className="flex-1 rounded-sm" onClick={handleEditFu}>保存修改</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 删除跟进确认 ── */}
      <Dialog open={!!fuDeleteId} onOpenChange={v => { if (!v) setFuDeleteId(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm rounded-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">确定要删除此跟进任务吗？</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setFuDeleteId(null)}>取消</Button>
            <Button variant="destructive" className="flex-1 rounded-sm" onClick={() => { setFollowUps(p => p.filter(f => f.id !== fuDeleteId)); toast.success('已删除'); setFuDeleteId(null); }}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-border pb-2">
            <TabsList className="rounded-sm flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger value="xiaoqi" className="rounded-sm text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />AI沟通方案
              </TabsTrigger>
              <TabsTrigger value="records" className="rounded-sm text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Phone className="w-3.5 h-3.5 mr-1" />沟通记录</TabsTrigger>
              <TabsTrigger value="followup" className="rounded-sm text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />待跟进
                {pendingFollowUps.length > 0 && (
                  <Badge className="ml-1.5 rounded-sm text-[10px] h-4 px-1 bg-destructive text-destructive-foreground">{pendingFollowUps.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-sm text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><BarChart3 className="w-3.5 h-3.5 mr-1" />本周趋势</TabsTrigger>
            </TabsList>

            <Button size="sm" className="rounded-sm text-xs h-8 px-3 gap-1 shadow-sm" onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}>
              <Plus className="w-3.5 h-3.5" />记录沟通
            </Button>
          </div>

          {/* ── 沟通记录 ── */}
          <TabsContent value="records" className="space-y-4">
            {/* KPI 卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {computedStatCards.map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="rounded-sm border-border shadow-sm">
                    <CardContent className="p-3 md:p-4">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold tracking-tight text-primary">{c.value}</p>
                        {c.up ? <TrendingUp className="w-3.5 h-3.5 text-success mb-1" /> : <AlertCircle className="w-3.5 h-3.5 text-warning mb-1" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜索商家或内容…" value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9 rounded-sm" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="沟通方式" /></SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">全部方式</SelectItem>
                    {Object.entries(channelConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={result} onValueChange={setResult}>
                  <SelectTrigger className="rounded-sm w-28 text-xs"><SelectValue placeholder="沟通结果" /></SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">全部结果</SelectItem>
                    {Object.entries(resultConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <div className="space-y-3">
                {filtered.map((record, i) => {
                  const ch = channelConfig[record.channel];
                  const rs = resultConfig[record.result];
                  const ChIcon = ch.icon;
                  const RsIcon = rs.icon;
                  return (
                    <motion.div key={record.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: i * 0.02, duration: 0.2 }}>
                      <Card className="rounded-sm border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${ch.color}`}>
                              <ChIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{record.merchant_name}</span>
                                  <Badge variant="outline" className="rounded-sm text-[10px] font-normal">{ch.label}</Badge>
                                  {record.duration_minutes && <span className="text-[10px] text-muted-foreground">{record.duration_minutes}分钟</span>}
                                </div>
                                <div className={`flex items-center gap-1 text-xs shrink-0 ${rs.color}`}>
                                  <RsIcon className="w-3.5 h-3.5" />{rs.label}
                                </div>
                              </div>
                              {/* 富文本内容渲染 */}
                              <div
                                className="text-sm text-muted-foreground mt-1.5 leading-relaxed
                                  [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:text-sm
                                  [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-2 [&_blockquote]:italic
                                  [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                                  [&_a]:text-primary [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: record.content }}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(record.contact_time), 'MM/dd HH:mm')} · {record.operator}
                                </span>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" onClick={() => openEdit(record)}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm text-destructive hover:text-destructive" onClick={() => setDeleteId(record.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 text-[10px] rounded-sm px-2" onClick={() => toast.success('已标记为待跟进')}>
                                    <RefreshCw className="w-3 h-3 mr-1" />跟进
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-sm text-muted-foreground">
                    <Phone className="w-10 h-10 mx-auto mb-3 text-muted" /><p>暂无沟通记录</p>
                  </div>
                )}
              </div>
            </AnimatePresence>
          </TabsContent>

          {/* ── 待跟进 ── */}
          <TabsContent value="followup" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" className="rounded-sm text-xs" onClick={() => { setFuForm({ name: '', time: '', priority: 'medium', reason: '' }); setFuAddOpen(true); }}>
                <Plus className="w-3.5 h-3.5 mr-1" />新增跟进
              </Button>
            </div>
            {followUps.map((item, i) => {
              const pc = priorityConfig[item.priority];
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className={`rounded-sm border shadow-sm ${item.done ? 'opacity-50' : item.priority === 'high' ? 'border-destructive/30' : 'border-border'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-medium ${pc.color}`}>{pc.label}优先</span>
                            {item.done && <span className="text-[10px] text-success">已完成</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />{item.time}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0 flex-wrap">
                          {!item.done && (
                            <>
                              <Button size="sm" variant="outline" className="rounded-sm text-xs h-7" onClick={() => toast.success('已发起呼叫')}>
                                <Phone className="w-3 h-3 mr-1" />呼叫
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-sm text-xs h-7" onClick={() => { setFuEditTarget(item); setFuForm({ name: item.name, time: item.time, priority: item.priority, reason: item.reason }); }}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button size="sm" className="rounded-sm text-xs h-7" onClick={() => { setFollowUps(p => p.map(f => f.id === item.id ? { ...f, done: true } : f)); toast.success('已标记完成'); }}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />完成
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" className="rounded-sm text-xs h-7 text-destructive hover:text-destructive" onClick={() => setFuDeleteId(item.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {followUps.length === 0 && (
              <div className="text-center py-16 text-sm text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-muted" /><p>暂无待跟进任务</p>
              </div>
            )}
          </TabsContent>

          {/* ── 本周趋势 ── */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">本周每日沟通量</CardTitle></CardHeader>
                <CardContent>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3,31.8%,91.4%)" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="沟通次数" fill="hsl(221.2,83.2%,53.3%)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">渠道使用分布</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {Object.entries(channelConfig).map(([k, v]) => {
                    const cnt = records.filter(r => r.channel === k).length;
                    const pct = Math.round((cnt / records.length) * 100);
                    const ChIcon = v.icon;
                    return (
                      <div key={k} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${v.color}`}>
                          <ChIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{v.label}</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── 小琪 ── */}
          <TabsContent value="xiaoqi" className="m-0 p-0">
            <XiaoqiAdvisor />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// ── 沟通表单子组件 ──
function CommFormFields({ form, setForm }: { form: typeof EMPTY_FORM; setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>> }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs">商家名称</Label>
        <Input placeholder="输入商家名称" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} className="rounded-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">沟通方式</Label>
          <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v }))}>
            <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-sm">
              {Object.entries(channelConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">沟通结果</Label>
          <Select value={form.result} onValueChange={v => setForm(f => ({ ...f, result: v }))}>
            <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-sm">
              {Object.entries(resultConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.channel === 'phone' && (
        <div className="space-y-1.5">
          <Label className="text-xs">通话时长（分钟）</Label>
          <Input type="number" placeholder="例如：15" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="rounded-sm" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">沟通内容</Label>
        <RichEditor
          value={form.content}
          onChange={v => setForm(f => ({ ...f, content: v }))}
          placeholder="记录本次沟通详情，支持加粗、列表、引用等格式…"
        />
      </div>
    </div>
  );
}

// ── 跟进表单子组件 ──
function FollowUpFormFields({
  form,
  setForm,
}: {
  form: { name: string; time: string; priority: string; reason: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; time: string; priority: string; reason: string }>>;
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs">商家名称</Label>
        <Input placeholder="商家名称" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">跟进时间</Label>
          <Input placeholder="今日 15:00" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="rounded-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">优先级</Label>
          <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
            <SelectTrigger className="rounded-sm text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-sm">
              <SelectItem value="high">高优先</SelectItem>
              <SelectItem value="medium">中优先</SelectItem>
              <SelectItem value="low">低优先</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">跟进原因</Label>
        <Input placeholder="简述跟进原因" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="rounded-sm" />
      </div>
    </div>
  );
}

