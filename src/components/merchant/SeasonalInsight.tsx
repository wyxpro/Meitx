import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import type { SeasonalInsight } from '@/types/merchant';

interface SeasonalInsightProps {
  insight: SeasonalInsight;
}

export function SeasonalInsightCard({ insight }: SeasonalInsightProps) {
  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          季节 & 场景化经营推演
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="rounded-sm bg-primary text-primary-foreground">{insight.season}</Badge>
          <span className="text-xs text-muted-foreground">已结合本地消费趋势推演</span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2.5 bg-success/5 rounded-sm p-3">
            <TrendingUp className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-success">阶段性机遇</p>
              <p className="text-muted-foreground leading-relaxed mt-0.5">{insight.opportunity}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-warning/5 rounded-sm p-3">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">风险提示</p>
              <p className="text-muted-foreground leading-relaxed mt-0.5">{insight.risk}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-info/5 rounded-sm p-3">
            <Lightbulb className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-info">短期运营方案</p>
              <p className="text-muted-foreground leading-relaxed mt-0.5">{insight.shortTermPlan}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
