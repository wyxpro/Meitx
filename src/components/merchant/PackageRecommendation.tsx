import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Gift, ArrowUpRight, CheckCircle2, TrendingUp, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { MarketingPackage } from '@/types/merchant';

interface PackageRecommendationProps {
  packages: MarketingPackage[];
}

export function PackageRecommendation({ packages }: PackageRecommendationProps) {
  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          智能套餐推荐
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border border-border rounded-sm p-3 space-y-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm">{pkg.name}</h4>
                  <Badge variant="secondary" className="text-[10px] rounded-sm font-normal">
                    {pkg.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{pkg.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-primary">¥{pkg.price}</p>
                <p className="text-[10px] text-muted-foreground">/周期</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/50 rounded-sm p-2">
                <TrendingUp className="w-3.5 h-3.5 text-success mx-auto mb-1" />
                <p className="text-xs font-bold text-success">+{pkg.estimatedOrderLift}%</p>
                <p className="text-[10px] text-muted-foreground">订单提升</p>
              </div>
              <div className="bg-muted/50 rounded-sm p-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
                <p className="text-xs font-bold text-accent">+{pkg.estimatedSalesLift}%</p>
                <p className="text-[10px] text-muted-foreground">销售提升</p>
              </div>
              <div className="bg-muted/50 rounded-sm p-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-info mx-auto mb-1" />
                <p className="text-xs font-bold text-info">{pkg.estimatedRoi}%</p>
                <p className="text-[10px] text-muted-foreground">预估 ROI</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p><span className="text-muted-foreground">适配理由：</span>{pkg.adaptReason}</p>
              <p><span className="text-muted-foreground">优化方向：</span>{pkg.optimizationDirection}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-sm text-xs"
              onClick={() => toast.success(`已打开「${pkg.name}」详情`)}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              查看套餐详情
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
