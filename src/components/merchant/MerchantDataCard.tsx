import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, TrendingUp, TrendingDown, Minus, Store, Calendar, User, MapPin } from 'lucide-react';
import type { Merchant } from '@/types/merchant';

interface MerchantDataCardProps {
  merchant: Merchant;
  compact?: boolean;
}

export function MerchantDataCard({ merchant, compact = false }: MerchantDataCardProps) {
  const { basicInfo, operationData, communicationData, benchmark, dataQualityNotes } = merchant;

  const formatWan = (num: number) => `${(num / 10000).toFixed(1)}万`;

  const TrendIcon = operationData.salesGrowthRate > 0 ? TrendingUp : operationData.salesGrowthRate < 0 ? TrendingDown : Minus;
  const trendColor = operationData.salesGrowthRate > 0 ? 'text-success' : operationData.salesGrowthRate < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2 truncate">
              <Store className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{basicInfo.name}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs font-normal rounded-sm">
                {basicInfo.category}
              </Badge>
              <span>•</span>
              <span>开店 {Math.floor(basicInfo.openDays / 365)} 年</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">月销售额</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{formatWan(operationData.monthlySales)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">月订单量</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{operationData.monthlyOrders}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">客单价</p>
            <p className="text-xl font-bold text-foreground tracking-tight">¥{operationData.averageOrderValue}</p>
          </div>
        </div>

        {!compact && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">环比增长</p>
                <p className={`font-medium flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  {operationData.salesGrowthRate >= 0 ? '+' : ''}{operationData.salesGrowthRate}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">门店评分</p>
                <p className="font-medium">{operationData.rating} / 5.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">接通率</p>
                <p className="font-medium">{communicationData.connectionRate}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">历史签约</p>
                <p className="font-medium">{communicationData.historicalContracts} 次</p>
              </div>
            </div>

            <Separator />
            <div className="space-y-2 text-sm">
              <p className="text-xs text-muted-foreground font-medium">同品类基准</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 p-2 rounded-sm">
                  <p className="text-xs text-muted-foreground">品类月均销售</p>
                  <p className="font-semibold">{formatWan(benchmark.categoryAverageSales)}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded-sm">
                  <p className="text-xs text-muted-foreground">季节因子</p>
                  <p className="font-semibold">{benchmark.seasonFactor}</p>
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>{basicInfo.managerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>{basicInfo.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{basicInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>偏好联系时间：{communicationData.preferredContactTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {dataQualityNotes.map((note) => (
                <Badge key={note} variant="outline" className="text-[10px] rounded-sm font-normal">
                  {note}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
