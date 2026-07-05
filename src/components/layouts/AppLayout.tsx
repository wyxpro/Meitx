import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  LayoutDashboard, Store, BarChart3, Phone, Settings, Menu,
  Bell, LogOut, User, Sparkles, Check, MessageSquare, TrendingUp,
  AlertCircle, ChevronRight, Calendar, Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FloatingAIAssistant } from '@/components/common/FloatingAIAssistant';

const NOTIFICATIONS = [
  { id: 1, type: 'urgent', icon: AlertCircle, color: 'text-destructive', title: '蜀香麻辣烫距离上次联系已 8 天', time: '刚刚', read: false },
  { id: 2, type: 'task', icon: Calendar, color: 'text-primary', title: '今日预约拜访：皇家湾酒店 14:00', time: '30分钟前', read: false },
  { id: 3, type: 'success', icon: Check, color: 'text-success', title: '欢乐星球亲子乐园套餐已签约 ✓', time: '2小时前', read: true },
  { id: 4, type: 'info', icon: TrendingUp, color: 'text-warning', title: '本月签约目标完成 72%，还需 4 单', time: '今天 09:00', read: true },
  { id: 5, type: 'msg', icon: MessageSquare, color: 'text-primary', title: '美颜造型新回复了沟通记录', time: '昨天 17:30', read: true },
];

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '工作台',   path: '/' },
  { icon: Store,           label: '商家管理', path: '/merchants' },
  { icon: Phone,           label: '沟通记录', path: '/communications' },
  { icon: BarChart3,       label: '数据统计', path: '/data-center' },
  { icon: Settings,        label: '个人中心', path: '/settings' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogoClick = () => { navigate('/landing'); onNavigate?.(); };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="h-14 flex items-center px-4 border-b border-border hover:bg-muted/50 transition-colors w-full text-left shrink-0"
      >
        <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center mr-2 shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight">美团阿波罗</h1>
          <p className="text-[10px] text-muted-foreground">商家智能运营</p>
        </div>
      </button>

      {/* Nav */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className="rounded-sm text-[10px] h-4 px-1 bg-primary text-primary-foreground">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="bg-muted/50 rounded-sm p-3 mb-3">
          <p className="text-xs font-medium">今日待跟进</p>
          <p className="text-lg font-bold text-primary mt-1">23</p>
          <p className="text-[10px] text-muted-foreground">高意向商家 8 家</p>
        </div>
        {profile ? (
          <div className="space-y-1">
            {/* 用户信息 */}
            <button
              className="w-full flex items-center gap-2 px-2 py-2 rounded-sm hover:bg-muted transition-colors"
              onClick={() => { navigate('/settings'); onNavigate?.(); }}
            >
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={(profile as { avatar_url?: string }).avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium truncate">{profile.display_name || profile.username || '用户'}</p>
                <p className="text-[10px] text-muted-foreground">{profile.role === 'admin' ? '管理员' : profile.role === 'manager' ? '运营经理' : '运营顾问'}</p>
              </div>
              <User className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
            {/* 退出登录 */}
            <button
              className="w-full flex items-center gap-2 px-2 py-2 rounded-sm text-destructive hover:bg-destructive/10 transition-colors text-xs"
              onClick={async () => { await signOut(); toast.success('已安全退出'); navigate('/login'); }}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>退出登录</span>
            </button>
          </div>
        ) : (
          <Button size="sm" className="w-full rounded-sm text-xs" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-sm shrink-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 rounded-sm" aria-describedby={undefined}>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            {title && <h2 className="font-semibold text-sm truncate">{title}</h2>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            {/* 通知铃铛 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 rounded-sm shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-sm">消息通知</span>
                  <Badge className="rounded-sm text-[10px] h-4 px-1.5 bg-destructive text-destructive-foreground">
                    {NOTIFICATIONS.filter(n => !n.read).length}条未读
                  </Badge>
                </div>
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                      <n.icon className={`w-4 h-4 mt-0.5 shrink-0 ${n.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{n.time}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full rounded-sm text-xs text-muted-foreground h-7" onClick={() => toast.success('已全部标记为已读')}>
                    标记全部已读
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* 头像用户弹窗 */}
            {profile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="w-7 h-7 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all">
                    <AvatarImage src={(profile as { avatar_url?: string }).avatar_url} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-0 rounded-sm shadow-xl">
                  {/* 用户信息头 */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarImage src={(profile as { avatar_url?: string }).avatar_url} />
                        <AvatarFallback className="text-sm bg-primary text-primary-foreground font-bold">
                          {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{profile.display_name || profile.username || '用户'}</p>
                        <Badge variant="outline" className="rounded-sm text-[10px] h-4 px-1.5 mt-0.5 border-primary/30 text-primary">
                          {profile.role === 'admin' ? '管理员' : profile.role === 'manager' ? '运营经理' : '运营顾问'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { label: '本月签约', value: '8' },
                        { label: '跟进商家', value: '23' },
                        { label: '完成率', value: '72%' },
                      ].map(s => (
                        <div key={s.label} className="text-center bg-background/60 rounded-sm py-1.5">
                          <p className="text-sm font-bold text-primary">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 快捷入口 */}
                  <div className="p-2">
                    {[
                      { icon: User, label: '个人资料', path: '/settings' },
                      { icon: BarChart3, label: '数据统计', path: '/data-center' },
                      { icon: MessageSquare, label: '沟通记录', path: '/communications' },
                    ].map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-muted transition-colors text-sm"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-destructive hover:bg-destructive/10 transition-colors text-sm"
                      onClick={async () => { await signOut(); toast.success('已安全退出'); }}
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      {/* 全局 AI 浮动助手 */}
      <FloatingAIAssistant />
    </div>
  );
}
