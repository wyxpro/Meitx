import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Script, SceneType, Merchant } from '@/types/merchant';
import { SCENE_OPTIONS } from '@/types/merchant';

interface ScriptGeneratorProps {
  merchant: Merchant;
}

const sceneIcons: Record<SceneType, typeof Phone> = {
  phone: Phone,
  wechat: MessageSquare,
  face_to_face: Users,
};

export function ScriptGenerator({ merchant }: ScriptGeneratorProps) {
  const [activeScene, setActiveScene] = useState<SceneType>('phone');
  const [scripts, setScripts] = useState<Script[]>(() => merchant.scripts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const currentScript = scripts.find((s) => s.scene === activeScene);

  const handleCopy = useCallback(async (script: Script) => {
    try {
      await navigator.clipboard.writeText(script.content);
      setCopiedId(script.id);
      toast.success('话术已复制到剪贴板');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  }, []);

  const handleFeedback = useCallback((scriptId: string, feedback: 'good' | 'bad') => {
    setScripts((prev) =>
      prev.map((s) => (s.id === scriptId ? { ...s, feedback: s.feedback === feedback ? null : feedback } : s))
    );
    toast.success(feedback === 'good' ? '已标记为好用，将用于优化话术模板' : '已记录反馈，将改进生成逻辑');
  }, []);

  const handleStartEdit = useCallback((script: Script) => {
    setEditingId(script.id);
    setEditContent(script.content);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return;
    setScripts((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, content: editContent, feedback: 'good' } : s))
    );
    setEditingId(null);
    toast.success('已保存优化版本并沉淀为优质样本');
  }, [editingId, editContent]);

  const handleRegenerate = useCallback((scene: SceneType) => {
    setLoading(scene);
    setTimeout(() => {
      setScripts((prev) =>
        prev.map((s) =>
          s.scene === scene
            ? { ...s, content: s.content.replace('。', '，已根据最新数据重新优化。') + '（重生成版本）' }
            : s
        )
      );
      setLoading(null);
      toast.success('话术已重新生成');
    }, 1200);
  }, []);

  return (
    <Card className="border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          定制 AI 话术生成
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeScene} onValueChange={(v) => setActiveScene(v as SceneType)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-sm h-9">
            {SCENE_OPTIONS.map((option) => {
              const Icon = sceneIcons[option.value];
              return (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="text-xs rounded-sm flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.label.slice(0, 2)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {SCENE_OPTIONS.map((option) => {
            const script = scripts.find((s) => s.scene === option.value);
            if (!script) return null;

            return (
              <TabsContent key={option.value} value={option.value} className="space-y-3 mt-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-sm font-normal">
                      预计用时 {script.duration}
                    </Badge>
                    {script.keyPoints.map((point) => (
                      <span key={point} className="hidden sm:inline">• {point}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm"
                      onClick={() => handleRegenerate(option.value)}
                      disabled={loading === option.value}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading === option.value ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm"
                      onClick={() => handleCopy(script)}
                    >
                      {copiedId === script.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {editingId === script.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[160px] text-sm rounded-sm resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="rounded-sm text-xs" onClick={() => setEditingId(null)}>
                        取消
                      </Button>
                      <Button size="sm" className="rounded-sm text-xs" onClick={handleSaveEdit}>
                        保存优化
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-sm p-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
                    {script.content}
                  </div>
                )}

                {editingId !== script.id && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={script.feedback === 'good' ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-sm text-xs h-8"
                          onClick={() => handleFeedback(script.id, 'good')}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          好用
                        </Button>
                        <Button
                          variant={script.feedback === 'bad' ? 'destructive' : 'outline'}
                          size="sm"
                          className="rounded-sm text-xs h-8"
                          onClick={() => handleFeedback(script.id, 'bad')}
                        >
                          <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                          不好用
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-sm text-xs h-8" onClick={() => handleStartEdit(script)}>
                        手动微调
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
