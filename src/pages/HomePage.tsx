import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, TrendingUp, TrendingDown, Filter, ChevronRight } from 'lucide-react';
import { getMockMerchantList } from '@/services/mockData';
import type { MerchantListItem } from '@/types/merchant';

const levelColors: Record<string, string> = {
  high: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-destructive text-destructive-foreground',
};
const levelLabels: Record<string, string> = { high: '高意向', medium: '中意向', low: '低意向' };

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [merchants] = useState<MerchantListItem[]>(() => getMockMerchantList({ count: 12 }));

  const filteredMerchants = useMemo(() => {
    if (!keyword.trim()) return merchants;
    return merchants.filter(m => m.name.includes(keyword) || m.category.includes(keyword));
  }, [merchants, keyword]);

  return (
    <AppLayout title="商家工作台">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* KPI 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: '今日跟进商家', value: '23', change: '+12%', up: true },
            { label: '本月签约数', value: '8', change: '+33%', up: true },
            { label: '待处理沟通', value: '15', change: '-5%', up: false },
            { label: '高潜商家池', value: '128', change: '+8%', up: true },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <p className="text-xl md:text-2xl font-bold tracking-tight">{item.value}</p>
                    <span className={`text-[10px] md:text-xs flex items-center gap-0.5 ${item.up ? 'text-success' : 'text-destructive'}`}>
                      {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 搜索与操作 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜索商家名称或品类" value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9 rounded-sm text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={() => navigate('/merchant-filter')}>
              <Filter className="w-3.5 h-3.5 mr-1" />筛选
            </Button>
            <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={() => navigate('/merchants')}>
              <ChevronRight className="w-3.5 h-3.5 mr-1" />全部商家
            </Button>
          </div>
        </div>

        {/* 重点跟进商家列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">重点跟进商家</h3>
            <span className="text-xs text-muted-foreground">{filteredMerchants.length} 家</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredMerchants.map((merchant, i) => (
              <motion.div key={merchant.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card
                  className="rounded-sm border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/merchant/${merchant.id}`)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      {/* 头像 */}
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-muted shrink-0 border border-border">
                        {merchant.avatarUrl ? (
                          <img src={merchant.avatarUrl} alt={merchant.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                            {merchant.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{merchant.name}</h4>
                          <Badge variant="secondary" className="text-[10px] rounded-sm font-normal">{merchant.category}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          月销 ¥{(merchant.monthlySales / 10000).toFixed(1)}万 · 接通率 {merchant.connectionRate}%
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${levelColors[merchant.acceptanceLevel]}`}>
                          {levelLabels[merchant.acceptanceLevel]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">潜分 {merchant.potentialScore}</span>
                      </div>
                      <div className="flex gap-1">
                        {merchant.advantageTags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
