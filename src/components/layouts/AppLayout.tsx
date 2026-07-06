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
  { icon: LayoutDashboard, label: '工作台',   path: '/dashboard' },
  { icon: Store,           label: '商家管理', path: '/merchants' },
  { icon: Phone,           label: '沟通记录', path: '/communications' },
  { icon: BarChart3,       label: '数据统计', path: '/data-center' },
  { icon: Settings,        label: '个人中心', path: '/settings' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogoClick = () => { navigate('/'); onNavigate?.(); };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="h-16 flex items-center px-5 border-b border-border hover:bg-muted/50 transition-colors w-full text-left shrink-0"
      >
        <img src="/favicon.png" alt="美团阿波罗" className="w-9 h-9 object-contain mr-2.5 shrink-0" />
        <div>
          <h1 className="font-bold text-base leading-tight">美团阿波罗</h1>
          <p className="text-xs text-muted-foreground mt-0.5">商家智能运营</p>
        </div>
      </button>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-base transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className="rounded-md text-xs h-5 px-1.5 bg-primary text-primary-foreground font-semibold">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-4 border-t border-border shrink-0">
        {profile ? (
          <div className="space-y-1.5">
            {/* 用户信息 */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border/30"
              onClick={() => { navigate('/settings'); onNavigate?.(); }}
            >
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={(profile as { avatar_url?: string }).avatar_url} />
                <AvatarFallback className="text-sm bg-primary text-primary-foreground font-bold">
                  {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate text-foreground">{profile.display_name || profile.username || '用户'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{profile.role === 'admin' ? '管理员' : profile.role === 'manager' ? '运营经理' : '运营顾问'}</p>
              </div>
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            {/* 退出登录 */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
              onClick={async () => { await signOut(); toast.success('已安全退出'); navigate('/login'); }}
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              <span>退出登录</span>
            </button>
          </div>
        ) : (
          <Button size="default" className="w-full rounded-xl text-sm font-semibold" onClick={() => navigate('/login')}>
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
      <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen overflow-hidden">
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
              <SheetContent side="left" className="p-0 w-72 rounded-sm" aria-describedby={undefined}>
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

            {/* Popover Removed */}
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
