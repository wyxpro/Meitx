import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', password: '', confirm: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) { toast.error('请填写账号和密码'); return; }
    setLoading(true);
    const { error } = await signInWithUsername(loginForm.username, loginForm.password);
    setLoading(false);
    if (error) { toast.error('登录失败：账号或密码错误'); return; }
    toast.success('登录成功，欢迎回来！');
    navigate('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.username || !regForm.password) { toast.error('请填写账号和密码'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(regForm.username)) { toast.error('账号只能包含字母、数字和下划线'); return; }
    if (regForm.password.length < 8) { toast.error('密码至少 8 位'); return; }
    if (regForm.password !== regForm.confirm) { toast.error('两次密码不一致'); return; }
    if (!agreed) { toast.error('请先同意用户协议和隐私政策'); return; }
    setLoading(true);
    const { error } = await signUpWithUsername(regForm.username, regForm.password);
    setLoading(false);
    if (error) { toast.error(`注册失败：${error.message}`); return; }
    toast.success('注册成功，正在登录...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* 返回官网 */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回官网
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[calc(100%-2rem)] md:max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="美团阿波罗" className="w-12 h-12 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold">美团阿波罗</h1>
          <p className="text-muted-foreground text-sm mt-1">智慧运营AI平台 AI 平台</p>
        </div>

        <Card className="rounded-2xl border-border/80 shadow-xl shadow-black/5 bg-card/90 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">欢迎使用</CardTitle>
            <CardDescription>登录或注册以开始智能运营之旅</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full rounded-xl mb-6 p-1 bg-muted/60">
                <TabsTrigger value="login" className="rounded-lg py-2">登录</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg py-2">注册</TabsTrigger>
              </TabsList>

              {/* 登录 */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">账号</Label>
                    <Input
                      placeholder="请输入账号（字母/数字/下划线）"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(f => ({ ...f, username: e.target.value }))}
                      className="rounded-xl h-11 border-border/70 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">密码</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? 'text' : 'password'}
                        placeholder="请输入密码"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        className="rounded-xl h-11 border-border/70 focus-visible:ring-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-lg transition-all" disabled={loading}>
                    {loading ? '登录中...' : '立即登录'}
                  </Button>
                </form>
              </TabsContent>

              {/* 注册 */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">账号</Label>
                    <Input
                      placeholder="字母、数字、下划线，3-20位"
                      value={regForm.username}
                      onChange={(e) => setRegForm(f => ({ ...f, username: e.target.value }))}
                      className="rounded-xl h-11 border-border/70 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">密码</Label>
                    <Input
                      type="password"
                      placeholder="至少8位"
                      value={regForm.password}
                      onChange={(e) => setRegForm(f => ({ ...f, password: e.target.value }))}
                      className="rounded-xl h-11 border-border/70 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">确认密码</Label>
                    <Input
                      type="password"
                      placeholder="再次输入密码"
                      value={regForm.confirm}
                      onChange={(e) => setRegForm(f => ({ ...f, confirm: e.target.value }))}
                      className="rounded-xl h-11 border-border/70 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agree"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(Boolean(v))}
                      className="mt-0.5"
                    />
                    <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      我已阅读并同意
                      <span className="text-primary mx-1 cursor-pointer hover:underline">《用户协议》</span>
                      和
                      <span className="text-primary mx-1 cursor-pointer hover:underline">《隐私政策》</span>
                    </label>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-lg transition-all" disabled={loading}>
                    {loading ? '注册中...' : '立即注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground shrink-0">或者</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 gap-2 text-sm font-semibold border-border/80 hover:bg-muted/50 transition-all"
            onClick={() => navigate('/dashboard')}
          >
            <User className="w-4 h-4" /> 游客一键体验
          </Button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">无需注册，直接进入工作台体验核心功能</p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 美团阿波罗智能运营平台 · 保留所有权利
        </p>
      </motion.div>
    </div>
  );
}
