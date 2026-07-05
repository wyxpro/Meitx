import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import MerchantDetailPage from './pages/MerchantDetailPage';
import MerchantFilterPage from './pages/MerchantFilterPage';
import MerchantManagementPage from './pages/MerchantManagementPage';
import DataCenterPage from './pages/DataCenterPage';
import CommunicationPage from './pages/CommunicationPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import PackageRecommendationPage from './pages/PackageRecommendationPage';
import AcceptancePredictionPage from './pages/AcceptancePredictionPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: '官网',
    path: '/landing',
    element: <LandingPage />,
    public: true,
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: '工作台',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: '商家管理',
    path: '/merchants',
    element: <MerchantManagementPage />,
    public: true,
  },
  {
    name: '数据中心',
    path: '/data-center',
    element: <DataCenterPage />,
    public: true,
  },
  {
    name: '沟通记录',
    path: '/communications',
    element: <CommunicationPage />,
    public: true,
  },
  {
    name: '个人中心',
    path: '/settings',
    element: <SettingsPage />,
    public: true,
  },
  {
    name: '智能套餐推荐',
    path: '/package-recommendation',
    element: <PackageRecommendationPage />,
    public: true,
  },
  {
    name: '接受度智能预测',
    path: '/acceptance-prediction',
    element: <AcceptancePredictionPage />,
    public: true,
  },
  {
    name: '商家详情',
    path: '/merchant/:id',
    element: <MerchantDetailPage />,
    public: true,
  },
  {
    name: '优质商家筛选',
    path: '/merchant-filter',
    element: <MerchantFilterPage />,
    public: true,
  },
];
