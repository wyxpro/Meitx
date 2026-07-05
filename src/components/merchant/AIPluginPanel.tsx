import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Filter, X, Bot, BarChart3, MessageSquare, Calendar, Brain } from 'lucide-react';
import { MerchantDataCard } from './MerchantDataCard';
import { PainPointCard } from './PainPointCard';
import { PackageRecommendation } from './PackageRecommendation';
import { AcceptancePredictionCard } from './AcceptancePrediction';
import { ScriptGenerator } from './ScriptGenerator';
import { SeasonalInsightCard } from './SeasonalInsight';
import type { Merchant } from '@/types/merchant';

interface AIPluginPanelProps {
  merchant: Merchant;
  loading?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function AIPluginPanel({ merchant, loading = false, isMobile = false, onClose }: AIPluginPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const panelContent = (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI 运营助手</h2>
            <p className="text-[10px] text-muted-foreground">美团阿波罗商家智能运营插件</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-4 h-9 rounded-sm shrink-0">
          <TabsTrigger value="overview" className="text-xs rounded-sm flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span>数据</span>
          </TabsTrigger>
          <TabsTrigger value="diagnose" className="text-xs rounded-sm flex items-center gap-1">
            <Brain className="w-3 h-3" />
            <span>诊断</span>
          </TabsTrigger>
          <TabsTrigger value="script" className="text-xs rounded-sm flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>话术</span>
          </TabsTrigger>
          <TabsTrigger value="season" className="text-xs rounded-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>季节</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-sm" />
                <Skeleton className="h-48 w-full rounded-sm" />
                <Skeleton className="h-40 w-full rounded-sm" />
              </div>
            ) : (
              <>
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <MerchantDataCard merchant={merchant} compact={isMobile} />
                </TabsContent>

                <TabsContent value="diagnose" className="mt-0 space-y-4">
                  <PainPointCard painPoints={merchant.painPoints} />
                  <PackageRecommendation packages={merchant.recommendedPackages} />
                  <AcceptancePredictionCard prediction={merchant.acceptancePrediction} />
                </TabsContent>

                <TabsContent value="script" className="mt-0 space-y-4">
                  <MerchantDataCard merchant={merchant} compact />
                  <ScriptGenerator merchant={merchant} />
                </TabsContent>

                <TabsContent value="season" className="mt-0 space-y-4">
                  <SeasonalInsightCard insight={merchant.seasonalInsight} />
                  <MerchantDataCard merchant={merchant} compact />
                </TabsContent>
              </>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );

  return (
    <div
      className={`h-full shrink-0 bg-background border-l border-border overflow-hidden transition-all duration-300 ${
        mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
      style={{ width: isMobile ? '100%' : 420 }}
    >
      {panelContent}
    </div>
  );
}

export function AIPluginDrawer({ merchant, loading = false }: { merchant: Merchant; loading?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-40 rounded-sm shadow-sm flex items-center gap-2"
          size="lg"
        >
          <Bot className="w-4 h-4" />
          <span>AI 运营助手</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[calc(100%-1rem)] sm:max-w-md p-0 rounded-sm">
        <AIPluginPanel merchant={merchant} loading={loading} isMobile onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function FilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-sm flex items-center gap-1.5 md:hidden">
          <Filter className="w-4 h-4" />
          筛选
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-[calc(100%-1rem)] sm:max-w-md p-4 rounded-sm">
        {children}
      </SheetContent>
    </Sheet>
  );
}
