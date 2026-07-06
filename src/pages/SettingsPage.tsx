import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Palette, Save, Upload, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// 内置5种女生头像（插画风格）
const BUILTIN_AVATARS = [
  { id: 'a1', url: 'https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_1b74c70f-cdb9-4aa1-8982-85d7771bbe55.jpg', label: '清新可爱' },
  { id: 'a2', url: 'https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_c986d189-0211-419e-88bd-cd5787fe6e9f.jpg', label: '活泼元气' },
  { id: 'a3', url: 'https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_c5d0884c-449b-458b-a9f7-4658b2b3130b.jpg', label: '甜美温柔' },
  { id: 'a4', url: 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_700a5eaf-1422-4ef1-9067-00ec2cb3024f.jpg', label: '知性优雅' },
  { id: 'a5', url: 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_f688d7eb-524f-40a9-8763-b0206a7af199.jpg', label: '时尚潮流' },
];

const DEFAULT_AVATAR_URL = BUILTIN_AVATARS[1].url; // 活泼元气

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const isBuiltinAvatar = (url?: string | null) => BUILTIN_AVATARS.some(a => a.url === url);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    isBuiltinAvatar(profile?.avatar_url) ? profile?.avatar_url || DEFAULT_AVATAR_URL : DEFAULT_AVATAR_URL
  );
  const [uploadedAvatar, setUploadedAvatar] = useState<string>(
    profile?.avatar_url && !isBuiltinAvatar(profile.avatar_url) ? profile.avatar_url : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, dailyReport: true, weeklyDigest: false,
  });
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name || '',
    department: profile?.department || '',
    region: profile?.region || '',
  });

  const currentAvatar = uploadedAvatar || selectedAvatar;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('请上传图片格式文件'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedAvatar(ev.target?.result as string);
      setSelectedAvatar('');
      toast.success('头像已更新');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    const { error } = await updateProfile({
      display_name: profileForm.display_name,
      department: profileForm.department,
      region: profileForm.region,
      avatar_url: currentAvatar || DEFAULT_AVATAR_URL,
    });
    if (error) {
      toast.error('保存失败：' + error.message);
      return;
    }
    setSaved(true);
    toast.success('设置已保存');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout title="个人中心">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Quick Profile Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-xl border-border shadow-sm overflow-hidden bg-card">
              <div className="h-20 bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15" />
              <CardContent className="p-5 -mt-10 text-center relative z-10">
                <Avatar className="w-20 h-20 ring-4 ring-background mx-auto shadow-sm">
                  <AvatarImage src={currentAvatar} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                    {(profile?.display_name || profile?.username || '用')?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-base mt-4 text-foreground truncate">{profile?.display_name || profile?.username || '未设置昵称'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile?.role === 'admin' ? '系统管理员' : profile?.role === 'manager' ? '运营经理' : '运营顾问'}
                </p>
                <div className="mt-2.5 flex justify-center">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] font-normal">
                    {profile?.region || '全国地区'} · {profile?.department || '美团运营'}
                  </Badge>
                </div>
                
                <Separator className="my-5" />
                
                <div className="space-y-3 text-left text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>账号名</span>
                    <span className="font-medium text-foreground">{profile?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>所属大区</span>
                    <span className="font-medium text-foreground">{profile?.department || '未设置'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>办公城市</span>
                    <span className="font-medium text-foreground">{profile?.region || '未设置'}</span>
                  </div>
                </div>
                
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button variant="outline" size="sm" className="mt-6 w-full rounded-xl text-xs h-9 gap-1.5" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" /> 上传新头像
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="rounded-xl p-1 bg-muted/60 mb-6 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="profile" className="rounded-lg text-xs gap-1.5 py-2"><User className="w-3.5 h-3.5" />个人资料</TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-lg text-xs gap-1.5 py-2"><Bell className="w-3.5 h-3.5" />通知设置</TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg text-xs gap-1.5 py-2"><Shield className="w-3.5 h-3.5" />账号安全</TabsTrigger>
                <TabsTrigger value="appearance" className="rounded-lg text-xs gap-1.5 py-2"><Palette className="w-3.5 h-3.5" />界面偏好</TabsTrigger>
              </TabsList>

              {/* 个人资料 */}
              <TabsContent value="profile" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-semibold">资料详情</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 内置头像选择 */}
                      <div className="space-y-3">
                        <Label className="text-xs text-muted-foreground">快速选用系统头像</Label>
                        <div className="grid grid-cols-5 gap-3">
                          {BUILTIN_AVATARS.map(av => (
                            <button
                              key={av.id}
                              onClick={() => { setSelectedAvatar(av.url); setUploadedAvatar(''); }}
                              className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${
                                selectedAvatar === av.url ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-border'
                              }`}
                            >
                              <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                              {selectedAvatar === av.url && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {BUILTIN_AVATARS.map(av => (
                            <p key={av.id} className="text-[10px] text-center text-muted-foreground truncate">{av.label}</p>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs">显示名称</Label>
                          <Input
                            placeholder="设置显示名称"
                            value={profileForm.display_name}
                            onChange={e => setProfileForm(f => ({ ...f, display_name: e.target.value }))}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">所属部门</Label>
                          <Select value={profileForm.department} onValueChange={v => setProfileForm(f => ({ ...f, department: v }))}>
                            <SelectTrigger className="rounded-xl text-xs"><SelectValue placeholder="选择部门" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
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
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button className="rounded-xl text-xs px-5 h-10 shadow-sm" onClick={handleSave}>
                          {saved ? <><Check className="w-3.5 h-3.5 mr-1" />已保存</> : <><Save className="w-3.5 h-3.5 mr-1" />保存修改</>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* 通知设置 */}
              <TabsContent value="notifications" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-semibold">通知提醒设置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-xl border border-muted/50 p-4 space-y-4">
                          <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">系统实时通知</h4>
                          {[
                            { key: 'push', label: '系统推送', desc: '商家动态、签约提醒等实时通知' },
                            { key: 'email', label: '邮件通知', desc: '重要事件和周报邮件提醒' },
                            { key: 'sms', label: '短信提醒', desc: '紧急通知和验证码短信' },
                          ].map((item, i) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <div className="pr-4">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                              </div>
                              <Switch
                                checked={notifications[item.key as keyof typeof notifications]}
                                onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                              />
                            </div>
                          ))}
                        </Card>

                        <Card className="rounded-xl border border-muted/50 p-4 space-y-4">
                          <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-sans">数据及简报推送</h4>
                          {[
                            { key: 'dailyReport', label: '日报推送', desc: '每日工作总结和数据简报' },
                            { key: 'weeklyDigest', label: '周度摘要', desc: '每周大区经营数据汇总' },
                          ].map((item, i) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <div className="pr-4">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                              </div>
                              <Switch
                                checked={notifications[item.key as keyof typeof notifications]}
                                onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                              />
                            </div>
                          ))}
                        </Card>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button className="rounded-xl text-xs px-5 h-10 shadow-sm" onClick={handleSave}>
                          <Save className="w-3.5 h-3.5 mr-1" />保存设置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* 账号安全 */}
              <TabsContent value="security" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-xl border-border shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold">修改登录密码</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: '当前密码', placeholder: '请输入当前密码' },
                          { label: '新密码', placeholder: '至少8位，包含字母和数字' },
                          { label: '确认新密码', placeholder: '再次输入新密码' },
                        ].map(f => (
                          <div key={f.label} className="space-y-1.5">
                            <Label className="text-xs">{f.label}</Label>
                            <Input type="password" placeholder={f.placeholder} className="rounded-xl" />
                          </div>
                        ))}
                        <Button className="rounded-xl text-xs h-10 px-5 shadow-sm mt-2" onClick={() => toast.success('密码修改成功')}>确认修改</Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold">活动设备管理</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3.5">
                        {[
                          { device: 'Chrome / Windows 11', time: '当前设备在线', ip: '127.0.0.1', current: true },
                          { device: 'Safari / iPhone 15', time: '2天前活跃', ip: '192.168.1.120', current: false },
                        ].map((d) => (
                          <div key={d.device} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl">
                            <div>
                              <p className="text-xs font-semibold">{d.device}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{d.time} · IP: {d.ip}</p>
                            </div>
                            {d.current
                              ? <Badge className="rounded-full text-[9px] bg-success/15 text-success border-transparent px-2.5 py-0.5">当前</Badge>
                              : <Button variant="outline" size="sm" className="rounded-xl text-xs h-7 px-2.5" onClick={() => toast.success('已退出该设备')}>下线</Button>
                            }
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              {/* 界面偏好 */}
              <TabsContent value="appearance" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-semibold">界面与偏好设置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs">系统语言</Label>
                            <Select defaultValue="zh">
                              <SelectTrigger className="rounded-xl text-xs w-full"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="zh">简体中文 (Chinese)</SelectItem>
                                <SelectItem value="en">English (US)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">默认进入首页</Label>
                            <Select defaultValue="dashboard">
                              <SelectTrigger className="rounded-xl text-xs w-full"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="dashboard">工作台</SelectItem>
                                <SelectItem value="merchants">商家管理</SelectItem>
                                <SelectItem value="data">数据中心</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Card className="rounded-xl border border-muted/50 p-4 space-y-4">
                          <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">系统交互特性</h4>
                          {[
                            { label: '紧凑模式', desc: '缩减表格及卡片间距，呈现更多内容' },
                            { label: '动画效果', desc: '开启页面无缝过渡及动效反馈' },
                            { label: '自动更新数据', desc: '保持后台数据每 5 分钟自动拉取刷新' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <div className="pr-4">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                              </div>
                              <Switch defaultChecked={item.label !== '紧凑模式'} />
                            </div>
                          ))}
                        </Card>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button className="rounded-xl text-xs px-5 h-10 shadow-sm" onClick={handleSave}>
                          <Save className="w-3.5 h-3.5 mr-1" />保存偏好
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
