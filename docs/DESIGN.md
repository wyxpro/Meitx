## Vibe
- Dieter Rams functionalism × editorial SaaS precision — clean systemic grid, purposeful data hierarchy, minimal ornamentation

## Color
- Primary: #1D6BFF
- On Primary: #FFFFFF
- Accent: #F46800
- On Accent: #0F172A
- Background: #F4F5F7
- Foreground: #1A1D23
- Muted: #E8EAED
- Border: #D1D5DB
- Secondary: #1251CC

## Typography
- Heading: MiSans (family: MiSans, weight: SemiBold, url: https://resource-static.bj.bcebos.com/fonts-skill/MiSans_SemiBold.ttf)
- Body: MiSans (family: MiSans, weight: Regular, url: https://resource-static.bj.bcebos.com/fonts-skill/MiSans_Regular.ttf)

## Visual Language
- 核心视觉签名：数据行列之间用 1px 分隔线网格构建层次，色彩仅出现在激活态、数字指标、状态标签
- 材质与深度：卡片白底+轻阴影(0 1px 3px rgba(0,0,0,.08))，侧边栏深色(#1A1D23)形成明显层级分离
- 容器与按钮：卡片 4px 圆角直角感、主操作实心蓝、次操作透明描边、危险红；表格行 hover 浅蓝背景
- 布局节奏：左侧固定导航64px，内容区宽松留白，强调色集中在图表/徽章/CTA

## Animation
- 入场：页面卡片 fade+translateY(8px) 0.2s ease-out，stagger 40ms
- 交互：按钮 active scale(0.97) 100ms；侧边抽屉 slide-in 250ms ease

## Forbidden
- 禁 Primary/Accent 大色块铺底（页面背景/卡片面/操作区一律用中性色）
- 禁圆角卡片/通用渐变/毛玻璃作为唯一视觉签名
- 禁 Emoji 图标或 CSS 伪装 Logo

## Additional Notes
- 所有用户可见文案为中文
- 侧边导航栏用深色底(bg-foreground/bg-card-dark)与内容区形成高对比
