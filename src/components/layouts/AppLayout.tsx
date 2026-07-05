import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard, Store, BarChart3, Phone, Settings, Menu,
  Bell, LogOut, User, ChevronDown, Sparkles, Brain, Target, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FloatingAIAssistant } from '@/components/common/FloatingAIAssistant';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  group?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '工作台',       path: '/' },
  { icon: Store,           label: '商家管理',     path: '/merchants' },
  { icon: Phone,           label: '沟通记录',     path: '/communications' },
  { icon: BarChart3,       label: '数据中心',     path: '/data-center' },
  { icon: Brain,           label: '诊断',         path: '/data-center', group: 'ai' },
  { icon: Target,          label: '智能套餐推荐', path: '/package-recommendation', group: 'ai' },
  { icon: Activity,        label: '接受度预测',   path: '/acceptance-prediction', group: 'ai' },
  { icon: Settings,        label: '个人中心',     path: '/settings' },
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
        className="h-14 flex items-center px-4 border-b border-border hover:bg-muted/50 transition-colors w-full text-left"
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
          {/* 主导航项（非AI工具组） */}
          {navItems.filter(i => !i.group).map((item) => {
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
          {/* AI 工具分组 */}
          <div className="pt-2 pb-1 px-3">
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AI 分析工具</span>
          </div>
          {navItems.filter(i => i.group === 'ai').map((item) => {
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
      <div className="p-3 border-t border-border">
        <div className="bg-muted/50 rounded-sm p-3 mb-3">
          <p className="text-xs font-medium">今日待跟进</p>
          <p className="text-lg font-bold text-primary mt-1">23</p>
          <p className="text-[10px] text-muted-foreground">高意向商家 8 家</p>
        </div>
        {profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-sm hover:bg-muted transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium truncate">{profile.display_name || profile.username || '用户'}</p>
                  <p className="text-[10px] text-muted-foreground">{profile.role === 'admin' ? '管理员' : profile.role === 'manager' ? '运营经理' : '运营顾问'}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-sm">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs">
                <User className="w-3.5 h-3.5 mr-2" /> 个人设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive focus:text-destructive"
                onClick={async () => { await signOut(); toast.success('已安全退出'); navigate('/login'); }}
              >
                <LogOut className="w-3.5 h-3.5 mr-2" /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  const { profile } = useAuth();

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
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm" onClick={() => {}}>
              <Bell className="w-4 h-4" />
            </Button>
            {profile && (
              <Avatar className="w-7 h-7 cursor-pointer">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {(profile.display_name || profile.username || '用')?.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
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
