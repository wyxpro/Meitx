import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Target, AlertCircle, TrendingUp, Phone, History, BarChart3, Tags } from 'lucide-react';
import type { AcceptancePrediction } from '@/types/merchant';

interface AcceptancePredictionProps {
  prediction: AcceptancePrediction;
}

const levelConfig = {
  high: { label: '高意向', color: 'bg-success text-success-foreground', textColor: 'text-success' },
  medium: { label: '中意向', color: 'bg-warning text-warning-foreground', textColor: 'text-warning' },
  low: { label: '低意向', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' },
};

const factorIcons: Record<string, typeof Target> = {
  接通率: Phone,
  历史签约记录: History,
  销售额增长率: BarChart3,
  品类匹配度: Tags,
};

export function AcceptancePredictionCard({ prediction }: AcceptancePredictionProps) {
  const config = levelConfig[prediction.level];

  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          接受度智能预测
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={prediction.level === 'high' ? 'text-success' : prediction.level === 'medium' ? 'text-warning' : 'text-destructive'}
                strokeDasharray={`${prediction.score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none">{prediction.score}</span>
              <span className="text-[10px] text-muted-foreground">分</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`rounded-sm ${config.color}`}>{config.label}</Badge>
              <span className={`text-sm font-medium ${config.textColor}`}>{prediction.score >= 75 ? '建议优先跟进' : prediction.score >= 50 ? '可继续培育' : '沟通难度较高'}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">意向评分</p>
              <Progress value={prediction.score} className="h-2" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-muted/50 rounded-sm p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">沟通风险预警</p>
              <p className="text-sm leading-relaxed">{prediction.riskWarning}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">关键影响因子</p>
          <div className="grid grid-cols-2 gap-2">
            {prediction.keyFactors.map((factor) => {
              const Icon = factorIcons[factor] ?? TrendingUp;
              return (
                <div key={factor} className="flex items-center gap-2 bg-muted/30 rounded-sm p-2">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-xs truncate">{factor}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
