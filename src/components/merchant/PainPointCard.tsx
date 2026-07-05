import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, TrendingDown, Users, Package } from 'lucide-react';
import type { PainPoint } from '@/types/merchant';

interface PainPointCardProps {
  painPoints: PainPoint[];
}

const severityConfig = {
  high: { label: '高', color: 'bg-destructive text-destructive-foreground' },
  medium: { label: '中', color: 'bg-warning text-warning-foreground' },
  low: { label: '低', color: 'bg-info text-info-foreground' },
};

export function PainPointCard({ painPoints }: PainPointCardProps) {
  if (painPoints.length === 0) {
    return (
      <Card className="border border-border shadow-sm rounded-sm">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          暂无显著经营痛点，数据表现良好。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          经营痛点诊断
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={[painPoints[0]?.id]} className="w-full">
          {painPoints.map((point, index) => (
            <AccordionItem key={point.id} value={point.id} className="border-b border-border last:border-b-0">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm truncate flex-1">{point.title}</span>
                  <Badge className={`text-[10px] rounded-sm shrink-0 ${severityConfig[point.severity].color}`}>
                    {severityConfig[point.severity].label}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3 pl-8 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> 成因分析
                    </p>
                    <p className="text-foreground leading-relaxed">{point.causeAnalysis}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> 增收短板
                    </p>
                    <p className="text-foreground leading-relaxed">{point.revenueShortcoming}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="w-3 h-3" /> 数据溯源
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {point.sourceData.map((source) => (
                        <Badge key={source} variant="outline" className="text-[10px] rounded-sm font-normal">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
