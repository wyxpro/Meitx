import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Filter, Download, Search, Store, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { FilterDrawer } from '@/components/merchant/AIPluginPanel';
import { getMockMerchantList, filterMockMerchantList } from '@/services/mockData';
import { CATEGORIES, ACCEPTANCE_LABELS, SEASON_POTENTIAL_LABELS, type MerchantFilterParams } from '@/types/merchant';

export default function MerchantFilterPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MerchantFilterParams>({
    salesMin: 0,
    salesMax: 200000,
    category: undefined,
    connectionRateMin: 0,
    acceptanceLevel: undefined,
    seasonPotential: undefined,
    keyword: '',
  });

  const allMerchants = useMemo(() => getMockMerchantList({ count: 80 }), []);

  const filteredList = useMemo(() => {
    return filterMockMerchantList(allMerchants, {
      salesMin: filters.salesMin,
      salesMax: filters.salesMax,
      category: filters.category,
      connectionRateMin: filters.connectionRateMin,
      acceptanceLevel: filters.acceptanceLevel,
      seasonPotential: filters.seasonPotential,
      keyword: filters.keyword,
    });
  }, [allMerchants, filters]);

  const handleExport = useCallback(() => {
    const header = '商家ID,商家名称,品类,月销售额,月订单量,接通率,意向等级,潜力评分,优势标签,季节潜力\n';
    const rows = filteredList
      .map(
        (m) =>
          `${m.id},${m.name},${m.category},${m.monthlySales},${m.monthlyOrders},${m.connectionRate},${ACCEPTANCE_LABELS[m.acceptanceLevel]},${m.potentialScore},"${m.advantageTags.join(';')}",${SEASON_POTENTIAL_LABELS[m.seasonPotential]}`
      )
      .join('\n');

    const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `优质商家清单_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`已导出 ${filteredList.length} 条商家记录`);
  }, [filteredList]);

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <Label className="text-xs mb-1.5 block">关键词搜索</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="商家名称/品类"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
            className="pl-9 rounded-sm text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1.5 block">品类</Label>
        <Select value={filters.category} onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}>
          <SelectTrigger className="rounded-sm text-sm">
            <SelectValue placeholder="全部品类" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="all">全部品类</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs mb-1.5 block">月销售额区间（元）</Label>
        <div className="px-1">
          <Slider
            value={[filters.salesMin ?? 0, filters.salesMax ?? 200000]}
            min={0}
            max={200000}
            step={10000}
            onValueChange={([min, max]) => setFilters((f) => ({ ...f, salesMin: min, salesMax: max }))}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>¥{(filters.salesMin ?? 0).toLocaleString()}</span>
          <span>¥{(filters.salesMax ?? 200000).toLocaleString()}</span>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1.5 block">最低接通率 {filters.connectionRateMin}%</Label>
        <Slider
          value={[filters.connectionRateMin ?? 0]}
          min={0}
          max={100}
          step={5}
          onValueChange={([v]) => setFilters((f) => ({ ...f, connectionRateMin: v }))}
        />
      </div>

      <div>
        <Label className="text-xs mb-1.5 block">意向等级</Label>
        <Select value={filters.acceptanceLevel} onValueChange={(v) => setFilters((f) => ({ ...f, acceptanceLevel: v as any }))}>
          <SelectTrigger className="rounded-sm text-sm">
            <SelectValue placeholder="全部等级" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="all">全部等级</SelectItem>
            <SelectItem value="high">高意向</SelectItem>
            <SelectItem value="medium">中意向</SelectItem>
            <SelectItem value="low">低意向</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs mb-1.5 block">季节增长潜力</Label>
        <Select value={filters.seasonPotential} onValueChange={(v) => setFilters((f) => ({ ...f, seasonPotential: v as any }))}>
          <SelectTrigger className="rounded-sm text-sm">
            <SelectValue placeholder="全部潜力" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="all">全部潜力</SelectItem>
            <SelectItem value="high">高增长潜力</SelectItem>
            <SelectItem value="medium">稳定增长</SelectItem>
            <SelectItem value="low">潜力有限</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1 rounded-sm text-xs"
          onClick={() =>
            setFilters({
              salesMin: 0,
              salesMax: 200000,
              category: undefined,
              connectionRateMin: 0,
              acceptanceLevel: undefined,
              seasonPotential: undefined,
              keyword: '',
            })
          }
        >
          重置
        </Button>
        <Button className="flex-1 rounded-sm text-xs" onClick={() => toast.success(`筛选完成，共 ${filteredList.length} 条结果`)}>
          应用筛选
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* 桌面端筛选面板 */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-sm">优质商家筛选</h1>
        </div>
        <ScrollArea className="flex-1 -mx-4 px-4">
          {filterPanel}
        </ScrollArea>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-sm shrink-0" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold text-sm truncate">筛选结果</h2>
            <Badge variant="secondary" className="rounded-sm text-xs font-normal">
              {filteredList.length} 家
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="md:hidden">
              <FilterDrawer>{filterPanel}</FilterDrawer>
            </div>
            <Button variant="outline" size="sm" className="rounded-sm text-xs flex items-center gap-1.5" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">导出清单</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* 移动端卡片视图 */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {filteredList.slice(0, 20).map((merchant) => (
                <Card
                  key={merchant.id}
                  className="rounded-xl border-border shadow-sm cursor-pointer"
                  onClick={() => navigate(`/merchant/${merchant.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{merchant.name}</h4>
                          <Badge variant="secondary" className="text-[10px] rounded-sm font-normal">{merchant.category}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          月销售 ¥{(merchant.monthlySales / 10000).toFixed(1)}万 · 接通率 {merchant.connectionRate}%
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                        merchant.acceptanceLevel === 'high' ? 'bg-success text-success-foreground' : merchant.acceptanceLevel === 'medium' ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        {ACCEPTANCE_LABELS[merchant.acceptanceLevel]}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <TrendingUp className="w-3 h-3" />
                        潜分 {merchant.potentialScore}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 桌面端表格视图 */}
            <div className="hidden md:block overflow-x-auto bg-card rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap">商家名称</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">品类</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">月销售额</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">接通率</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">意向等级</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">潜力评分</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">优势标签</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">季节潜力</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList.map((merchant) => (
                    <TableRow
                      key={merchant.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/merchant/${merchant.id}`)}
                    >
                      <TableCell className="text-sm font-medium whitespace-nowrap">{merchant.name}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{merchant.category}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">¥{(merchant.monthlySales / 10000).toFixed(1)}万</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{merchant.connectionRate}%</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={`rounded-sm text-[10px] ${
                          merchant.acceptanceLevel === 'high' ? 'bg-success text-success-foreground' : merchant.acceptanceLevel === 'medium' ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground'
                        }`}>
                          {ACCEPTANCE_LABELS[merchant.acceptanceLevel]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-primary whitespace-nowrap">{merchant.potentialScore}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-1 flex-wrap">
                          {merchant.advantageTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{SEASON_POTENTIAL_LABELS[merchant.seasonPotential]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredList.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-3 text-muted" />
                <p>暂无符合条件的商家</p>
                <p className="text-xs mt-1">请尝试调整筛选条件</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
