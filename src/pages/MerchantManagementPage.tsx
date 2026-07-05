import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Download, TrendingUp, TrendingDown, Star, Phone, Eye, ChevronRight, Pencil, Trash2, Upload } from 'lucide-react';
import { getMockMerchantList, filterMockMerchantList } from '@/services/mockData';
import { CATEGORIES, ACCEPTANCE_LABELS } from '@/types/merchant';
import type { MerchantListItem } from '@/types/merchant';
import { exportMerchantsToExcel, ExcelImportButton } from '@/lib/excel';
import type { MerchantExcelRow } from '@/lib/excel';
import { toast } from 'sonner';

const statCards = [
  { label: '商家总数', value: '1,280', change: '+5.2%', up: true },
  { label: '本月新增', value: '48', change: '+18%', up: true },
  { label: '活跃商家', value: '892', change: '-2.1%', up: false },
  { label: '高意向池', value: '234', change: '+12%', up: true },
];

const levelColors: Record<string, string> = {
  high: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-destructive text-destructive-foreground',
};

const levelLabels: Record<string, string> = { high: '高意向', medium: '中意向', low: '低意向' };

const EMPTY_FORM = { name: '', managerName: '', contactPhone: '', address: '', category: '餐饮' };

export default function MerchantManagementPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MerchantListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [merchants, setMerchants] = useState<MerchantListItem[]>(() => getMockMerchantList({ count: 60 }));

  const filtered = useMemo(() =>
    filterMockMerchantList(merchants, {
      category: category === 'all' ? undefined : category,
      acceptanceLevel: level === 'all' ? undefined : (level as 'high' | 'medium' | 'low'),
      keyword,
    }),
    [merchants, category, level, keyword]
  );

  const handleExport = () => {
    const rows: MerchantExcelRow[] = filtered.map(m => ({
      商家名称: m.name,
      品类: m.category,
      联系人: m.managerName ?? '',
      联系电话: m.contactPhone ?? '',
      地址: m.address ?? '',
      月销售额: m.monthlySales,
      接通率: m.connectionRate,
      意向等级: levelLabels[m.acceptanceLevel],
    }));
    exportMerchantsToExcel(rows, '商家列表');
  };

  const handleImport = (rows: MerchantExcelRow[]) => {
    const newItems: MerchantListItem[] = rows.map((r, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: r.商家名称 ?? '',
      category: r.品类 ?? '其他',
      monthlySales: Number(r.月销售额) || 0,
      monthlyOrders: Math.round((Number(r.月销售额) || 0) / 60),
      connectionRate: Number(r.接通率) || 50,
      acceptanceLevel: (r.意向等级 === '高意向' ? 'high' : r.意向等级 === '低意向' ? 'low' : 'medium') as 'high' | 'medium' | 'low',
      potentialScore: 60,
      advantageTags: ['导入'],
      seasonPotential: 'medium' as const,
      address: r.地址,
      contactPhone: r.联系电话,
      managerName: r.联系人,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.商家名称 ?? 'X')}&backgroundColor=1D6BFF&fontWeight=700`,
    }));
    setMerchants(prev => [...newItems, ...prev]);
  };

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('请输入商家名称'); return; }
    const newItem: MerchantListItem = {
      id: `new-${Date.now()}`,
      name: form.name,
      category: form.category,
      monthlySales: 50000,
      monthlyOrders: 800,
      connectionRate: 60,
      acceptanceLevel: 'medium',
      potentialScore: 65,
      advantageTags: ['新增'],
      seasonPotential: 'medium',
      address: form.address,
      contactPhone: form.contactPhone,
      managerName: form.managerName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=1D6BFF&fontWeight=700`,
    };
    setMerchants(prev => [newItem, ...prev]);
    toast.success('商家已添加');
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleEdit = () => {
    if (!editTarget || !form.name.trim()) { toast.error('请输入商家名称'); return; }
    setMerchants(prev => prev.map(m => m.id === editTarget.id ? { ...m, name: form.name, category: form.category, address: form.address, contactPhone: form.contactPhone, managerName: form.managerName } : m));
    toast.success('已更新商家信息');
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    setMerchants(prev => prev.filter(m => m.id !== id));
    toast.success('已删除商家');
    setDeleteTarget(null);
  };

  const openEdit = (m: MerchantListItem) => {
    setEditTarget(m);
    setForm({ name: m.name, managerName: m.managerName ?? '', contactPhone: m.contactPhone ?? '', address: m.address ?? '', category: m.category });
  };

  return (
    <AppLayout title="商家管理" actions={
      <div className="flex items-center gap-2">
        <ExcelImportButton
          onImport={handleImport}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm border border-border bg-background text-xs hover:bg-muted transition-colors"
          label="导入"
        />
        <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1" />导出
        </Button>
        <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setForm(EMPTY_FORM); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-sm text-xs"><Plus className="w-3.5 h-3.5 mr-1" />新增商家</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-sm">
            <DialogHeader><DialogTitle>新增商家</DialogTitle></DialogHeader>
            <MerchantFormFields form={form} setForm={setForm} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setAddOpen(false)}>取消</Button>
              <Button className="flex-1 rounded-sm" onClick={handleAdd}>确认添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    }>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* 编辑弹窗 */}
        <Dialog open={!!editTarget} onOpenChange={v => { if (!v) { setEditTarget(null); setForm(EMPTY_FORM); } }}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-sm">
            <DialogHeader><DialogTitle>编辑商家</DialogTitle></DialogHeader>
            <MerchantFormFields form={form} setForm={setForm} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setEditTarget(null)}>取消</Button>
              <Button className="flex-1 rounded-sm" onClick={handleEdit}>保存修改</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 删除确认弹窗 */}
        <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm rounded-sm">
            <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">确定要删除该商家吗？此操作不可恢复。</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-sm" onClick={() => setDeleteTarget(null)}>取消</Button>
              <Button variant="destructive" className="flex-1 rounded-sm" onClick={() => deleteTarget && handleDelete(deleteTarget)}>确认删除</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-muted-foreground">{card.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <p className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</p>
                    <span className={`text-[10px] flex items-center gap-0.5 ${card.up ? 'text-success' : 'text-destructive'}`}>
                      {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {card.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 筛选栏 */}
        <Card className="rounded-sm border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜索商家名称..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9 rounded-sm" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-sm w-28 md:w-32 text-xs"><SelectValue placeholder="全部品类" /></SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">全部品类</SelectItem>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="rounded-sm w-28 md:w-32 text-xs"><SelectValue placeholder="意向等级" /></SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">全部意向</SelectItem>
                    <SelectItem value="high">高意向</SelectItem>
                    <SelectItem value="medium">中意向</SelectItem>
                    <SelectItem value="low">低意向</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 桌面表格 */}
        <div className="hidden md:block overflow-x-auto bg-card rounded-sm border border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap text-xs">商家名称</TableHead>
                <TableHead className="whitespace-nowrap text-xs">品类</TableHead>
                <TableHead className="whitespace-nowrap text-xs">月销售额</TableHead>
                <TableHead className="whitespace-nowrap text-xs">月订单</TableHead>
                <TableHead className="whitespace-nowrap text-xs">接通率</TableHead>
                <TableHead className="whitespace-nowrap text-xs">意向等级</TableHead>
                <TableHead className="whitespace-nowrap text-xs">潜力分</TableHead>
                <TableHead className="whitespace-nowrap text-xs">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/merchant/${m.id}`)}
                >
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-sm overflow-hidden border border-border shrink-0 bg-muted">
                        {m.avatarUrl
                          ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">{m.name.slice(0, 1)}</div>
                        }
                      </div>
                      <span className="font-medium text-sm">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="secondary" className="rounded-sm text-[10px] font-normal">{m.category}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">¥{(m.monthlySales / 10000).toFixed(1)}万</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{m.monthlyOrders}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Progress value={m.connectionRate} className="h-1.5 w-16" />
                      <span className="text-xs text-muted-foreground">{m.connectionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className={`rounded-sm text-[10px] ${levelColors[m.acceptanceLevel]}`}>
                      {ACCEPTANCE_LABELS[m.acceptanceLevel]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-sm font-semibold text-primary">{m.potentialScore}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => navigate(`/merchant/${m.id}`)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => openEdit(m)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 移动端卡片 */}
        <div className="md:hidden space-y-3">
          {filtered.slice(0, 30).map(m => (
            <Card key={m.id} className="rounded-sm border-border shadow-sm cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate(`/merchant/${m.id}`)}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-sm overflow-hidden border border-border shrink-0 bg-muted">
                    {m.avatarUrl
                      ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">{m.name.slice(0, 1)}</div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{m.name}</span>
                      <Badge variant="secondary" className="rounded-sm text-[10px] font-normal">{m.category}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ¥{(m.monthlySales / 10000).toFixed(1)}万 · {m.monthlyOrders}单 · 接通{m.connectionRate}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`rounded-sm text-[10px] ${levelColors[m.acceptanceLevel]}`}>
                      {ACCEPTANCE_LABELS[m.acceptanceLevel]}
                    </Badge>
                    <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => openEdit(m)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-destructive" onClick={() => setDeleteTarget(m.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 text-muted" />
            <p>暂无符合条件的商家</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// 表单子组件
function MerchantFormFields({
  form,
  setForm,
}: {
  form: { name: string; managerName: string; contactPhone: string; address: string; category: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
}) {
  return (
    <div className="space-y-3 pt-2">
      {[
        { key: 'name' as const, label: '商家名称', placeholder: '请输入商家名称' },
        { key: 'managerName' as const, label: '联系人', placeholder: '老板姓名' },
        { key: 'contactPhone' as const, label: '联系电话', placeholder: '手机号码' },
        { key: 'address' as const, label: '门店地址', placeholder: '详细地址' },
      ].map(f => (
        <div key={f.key} className="space-y-1.5">
          <Label className="text-xs">{f.label}</Label>
          <Input placeholder={f.placeholder} className="rounded-sm" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
        </div>
      ))}
      <div className="space-y-1.5">
        <Label className="text-xs">品类</Label>
        <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
          <SelectTrigger className="rounded-sm"><SelectValue placeholder="选择品类" /></SelectTrigger>
          <SelectContent className="rounded-sm">
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
