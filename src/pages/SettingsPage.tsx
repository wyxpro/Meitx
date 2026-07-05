import { useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Palette, Globe, Save, Upload, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, dailyReport: true, weeklyDigest: false,
  });
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name || '',
    department: profile?.department || '',
    region: profile?.region || '',
  });

  const handleSave = () => {
    setSaved(true);
    toast.success('设置已保存');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout title="个人中心">
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="rounded-sm mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="rounded-sm text-xs gap-1.5"><User className="w-3.5 h-3.5" />个人资料</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-sm text-xs gap-1.5"><Bell className="w-3.5 h-3.5" />通知设置</TabsTrigger>
            <TabsTrigger value="security" className="rounded-sm text-xs gap-1.5"><Shield className="w-3.5 h-3.5" />账号安全</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-sm text-xs gap-1.5"><Palette className="w-3.5 h-3.5" />界面偏好</TabsTrigger>
          </TabsList>

          {/* 个人资料 */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">个人资料</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* 头像 */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {(profile?.display_name || profile?.username || '用')?.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profile?.display_name || profile?.username || '未设置昵称'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile?.role === 'admin' ? '管理员' : profile?.role === 'manager' ? '运营经理' : '运营顾问'}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 rounded-sm text-xs h-7" onClick={() => {}}>
                        <Upload className="w-3 h-3 mr-1" /> 更换头像
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">登录账号</Label>
                      <Input value={profile?.username || ''} disabled className="rounded-sm bg-muted/30 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">显示名称</Label>
                      <Input
                        placeholder="设置显示名称"
                        value={profileForm.display_name}
                        onChange={e => setProfileForm(f => ({ ...f, display_name: e.target.value }))}
                        className="rounded-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">所属部门</Label>
                      <Select value={profileForm.department} onValueChange={v => setProfileForm(f => ({ ...f, department: v }))}>
                        <SelectTrigger className="rounded-sm text-xs"><SelectValue placeholder="选择部门" /></SelectTrigger>
                        <SelectContent className="rounded-sm">
                          {['华北大区', '华东大区', '华南大区', '华中大区', '西南大区', '西北大区'].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">所在城市</Label>
                      <Input
                        placeholder="如：北京"
                        value={profileForm.region}
                        onChange={e => setProfileForm(f => ({ ...f, region: e.target.value }))}
                        className="rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button className="rounded-sm text-xs" onClick={handleSave}>
                      {saved ? <><Check className="w-3.5 h-3.5 mr-1" />已保存</> : <><Save className="w-3.5 h-3.5 mr-1" />保存修改</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">通知设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'push', label: '系统推送', desc: '商家动态、签约提醒等实时推送' },
                    { key: 'email', label: '邮件通知', desc: '重要事件和周报邮件提醒' },
                    { key: 'sms', label: '短信提醒', desc: '紧急通知和验证码短信' },
                    { key: 'dailyReport', label: '日报推送', desc: '每日工作总结报告' },
                    { key: 'weeklyDigest', label: '周度摘要', desc: '每周数据分析汇总' },
                  ].map((item, i) => (
                    <div key={item.key}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button className="rounded-sm text-xs" onClick={handleSave}>
                      <Save className="w-3.5 h-3.5 mr-1" />保存设置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 账号安全 */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">修改密码</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: '当前密码', placeholder: '请输入当前密码' },
                    { label: '新密码', placeholder: '至少8位，包含字母和数字' },
                    { label: '确认新密码', placeholder: '再次输入新密码' },
                  ].map(f => (
                    <div key={f.label} className="space-y-1.5">
                      <Label className="text-xs">{f.label}</Label>
                      <Input type="password" placeholder={f.placeholder} className="rounded-sm" />
                    </div>
                  ))}
                  <Button className="rounded-sm text-xs" onClick={() => toast.success('密码修改成功')}>确认修改</Button>
                </CardContent>
              </Card>

              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">登录设备管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: 'Chrome / Windows 11', time: '当前设备', ip: '127.0.0.1', current: true },
                    { device: 'Safari / iPhone 15', time: '2天前', ip: '192.168.1.x', current: false },
                  ].map((d) => (
                    <div key={d.device} className="flex items-center justify-between p-3 bg-muted/40 rounded-sm">
                      <div>
                        <p className="text-sm font-medium">{d.device}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{d.time} · {d.ip}</p>
                      </div>
                      {d.current
                        ? <Badge className="rounded-sm text-[10px] bg-success text-success-foreground">当前</Badge>
                        : <Button variant="outline" size="sm" className="rounded-sm text-xs h-7" onClick={() => toast.success('已退出该设备')}>退出</Button>
                      }
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 界面偏好 */}
          <TabsContent value="appearance">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-sm border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">界面偏好</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs">语言</Label>
                    <Select defaultValue="zh">
                      <SelectTrigger className="rounded-sm text-xs w-48"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-sm">
                        <SelectItem value="zh">简体中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs">默认首页</Label>
                    <Select defaultValue="dashboard">
                      <SelectTrigger className="rounded-sm text-xs w-48"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-sm">
                        <SelectItem value="dashboard">工作台</SelectItem>
                        <SelectItem value="merchants">商家管理</SelectItem>
                        <SelectItem value="data">数据中心</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {[
                      { label: '紧凑模式', desc: '减少内边距，显示更多内容' },
                      { label: '动画效果', desc: '页面切换和交互动画' },
                      { label: '数据自动刷新', desc: '每5分钟自动刷新数据' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={item.label !== '紧凑模式'} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="rounded-sm text-xs" onClick={handleSave}>
                      <Save className="w-3.5 h-3.5 mr-1" />保存偏好
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
