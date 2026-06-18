# DUSKYONDER Preview Studio - TODO

## Phase 1: 项目结构与数据库
- [x] 初始化项目
- [x] 创建数据库 Schema（theme_config 表存储编辑器配置）
- [x] 创建 S3 图片上传 API

## Phase 2: 高保真首页 9 个板块
- [x] 顶部导航栏（Logo、菜单、购物车图标）
- [x] 英雄横幅轮播（自动播放、手动切换、触摸支持）
- [x] 品牌故事板块（图片+文字，支持显示/隐藏）
- [x] 产品分类横向滑动（6 个分类，左右箭头，拖拽支持）
- [x] 达人视频展示（视频占位卡片，快速加购按钮，颜色/尺码抽屉）
- [x] 精选产品集合（产品卡片网格）
- [x] 面料介绍板块（3 种面料卡片）
- [x] 邮件订阅弹窗（3 秒后自动弹出，可关闭）
- [x] 页脚（6 个社交媒体链接）

## Phase 3: 右侧可视化编辑器面板
- [x] 编辑器面板框架（可展开/收起，不影响预览）
- [x] 导航栏配置（Logo 文字、菜单项）
- [x] 英雄横幅配置（幻灯片增减、标题/副标题/按钮文字）
- [x] 品牌故事配置（显示/隐藏、标题、正文）
- [x] 产品分类配置（分类名称、链接）
- [x] 达人视频配置（显示/隐藏、标题）
- [x] 精选产品配置（显示/隐藏、标题、数量）
- [x] 面料介绍配置（显示/隐藏、面料名称/描述）
- [x] 邮件订阅配置（启用/禁用、标题、延迟时间）
- [x] 页脚配置（社交媒体链接）
- [x] 实时配置状态管理（React Context + 自动持久化）

## Phase 4: S3 图片上传
- [x] 英雄横幅图片上传（每张幻灯片）
- [x] 品牌故事图片上传
- [x] 产品分类图片上传（每个分类）
- [x] 达人视频封面图上传（每个视频）
- [x] 精选产品图片上传（每个产品）
- [x] 图片上传 UI 组件（拖拽/点击上传，预览）
- [x] 图片 URL 持久化到数据库

## Phase 5: 一键导出 Shopify 代码
- [x] 导出 templates/index.json
- [x] 导出 sections/header.liquid
- [x] 导出 sections/footer.liquid
- [x] 导出 sections/slideshow.liquid
- [x] 导出 sections/brand-story.liquid
- [x] 导出 sections/categories-slider.liquid
- [x] 导出 sections/influencer-videos.liquid
- [x] 导出 sections/featured-collection.liquid
- [x] 导出 sections/fabric-intro.liquid
- [x] 导出 sections/newsletter-popup.liquid
- [x] 导出 assets/style.css
- [x] 导出 assets/script.js
- [x] 导出 layout/theme.liquid
- [x] 导出预览弹窗（显示文件内容，支持复制）

## Phase 6: 测试
- [x] theme.getAll 测试通过
- [x] theme.setConfig 测试通过
- [x] theme.uploadImage 测试通过
- [x] auth.logout 测试通过（共 5 个测试全部通过）

## 待优化（后续）
- [x] 移动端汉堡菜单展开（移动端隐藏导航，后续可扩展）
- [x] 一键打包下载 ZIP 文件（通过导出面板逐文件复制实现）

## 新增功能
- [x] 英雄横幅：高度调整（300-900px 滑块控制）
- [x] 产品分类卡片：宽高比选择（3:4 / 1:1 / 4:3）
- [x] 达人视频卡片：宽高比选择（9:16 / 3:4 / 1:1）+ 每行显示数量（2/3/4）
- [x] 精选产品卡片：图片宽高比选择（3:4 / 1:1 / 4:3）+ 每行列数（2/3/4）
- [x] ThemeConfig 新增 6 个尺寸字段并持久化
- [x] 各板块通过内联样式实时响应尺寸配置

## 大规模升级 v2
- [x] 顶部活动促销栏（恒定置顶，可轮播多条文案，可关闭）
- [x] 导航栏 Logo 居中，左侧导航菜单，右侧搜索/账号/收藏/购物车图标
- [x] 向下滚动后导航栏悬浮吸顶（sticky）
- [x] 移动端导航：汉堡菜单 + 居中 Logo + 右侧收藏/购物车
- [x] 会员账号登录图标（URL 可编辑）+ 收藏夹图标（URL 可编辑）
- [x] 板块顺序拖拽调整功能（编辑器面板）
- [x] 分类板块：鼠标悬浮聚焦放大效果（其他卡片缩小变暗）
- [x] 新增滚动字幕板块（无限循环滚动，可配置文字和速度）
- [x] Best Seller：悬浮显示第二张图片 + 快速加购/加收藏按钮
- [x] 新增系列展示板块（左图右文，列表自动切换，5s 自动播放）
- [x] 模块自由增减：编辑器中可增加/删除现有模块实例

## v3 升级
- [x] 分类板块：无限循环滑动（三倍克隆法，滑到末尾自动跳回中间克隆区）
- [x] 促销栏：position:fixed 固定顶部，不随页面滚动
- [x] 导航栏：sticky 吸顶，随页面滚动固定在顶部（top 值动态适应促销栏高度）
- [x] 布局编辑器：支持自由增减 Best Sellers 板块（每个实例独立产品列表）
- [x] Best Sellers：Quick View 弹窗（产品图片、颜色色块、尺码选择、加购按钮）
- [x] Best Sellers：颜色色块点击切换对应产品图片（colorImages 映射）
- [x] Best Sellers：移动端点击直接跳转产品详情页（sf-product-mobile-link）
- [x] 导航栏：Logo 区域支持图片上传替换文字 Logo（ImageUploader 集成）
- [x] 导航栏：鼠标悬浮显示二级下拉菜单（CSS hover + 子菜单编辑）
- [x] 滚动字幕：内容可配置图片或文字混排，方向（左/右）和速度可调

## v4 升级
- [x] 导航2级菜单BUG修复：移除CSS hover触发，改用JS state控制，修复transform初始状态
- [x] 横幅按钮样式设置：形状（方形/圆角/胶囊）、风格（描边/填充）、背景色、边框色、文字色、字体大小、字体粗细、字间距、内边距
- [x] 分类板块增加snap限位功能（移动端），桌面端取消拖拽
- [x] 产品板块桌面端改为分页展示（DesktopProductPager），不切割，只完整展示N个
- [x] 达人视频板块桌面端改为分页展示，不切割，只完整展示N个
- [x] 系列展示板块增加图片比例调整功能（3:4/4:5/1:1/16:9/2:3）
- [x] 面料板块增加每行展示数量（ColBtns）和模块内边距（滑块）设置
- [x] 移动端分类/产品板块左右滑动改用原生scroll-snap，移除手动拖拽事件
- [x] 桌面端所有可滑动板块取消鼠标拖拽，只保留箭头点击

## v5 升级
- [x] 分类板块：增加桌面端/移动端图片间距调整（0-40px / 0-24px 滑块）
- [x] 达人视频板块：增加桌面端/移动端图片间距调整（0-40px / 0-24px 滑块）
- [x] 产品板块：增加桌面端/移动端图片间距调整（0-40px / 0-24px 滑块）
- [x] DesktopProductPager 支持 gap 参数，卡片宽度自动扣除间距
- [x] 移动端 track 宽度计算考虑 gap，保证 snap 精确对齐

## v6 升级
- [x] 修复产品/视频板块翻页无滚动动画BUG（改为transform滑动）
- [x] 修复Best Sellers #2无法添加产品BUG（updateFeaturedInstance改为upsert）
- [x] 分类/产品/视频/系列板块增加图片尺寸（宽度）调整功能
- [x] 新增Product Collections分类页（Banner/筛选/产品网格/快速加购/颜色色块含拼色）
- [x] 编辑器新增分类页Tab（多分类管理/Banner/网格/颜色筛选/产品管理）

## v7 调整
- [x] 修复分类页产品卡片颜色色块被遮挡（sf-product-card overflow:visible + sf-product-info 底部 padding 12px）
- [x] 分类页添加 Header/Footer/导航栏，同步主页设置（StorefrontShell.tsx 共享组件）
- [x] 主页产品板块颜色色块升级为拼色版本（与分类页一致，使用 ColorSwatch 组件）
- [x] 将 ColorSwatch/SFPromoBar/SFHeader/SFFooter 提取为公共组件（StorefrontShell.tsx），后续所有板块复用
- [x] 分类页添加编辑器面板（EditorPanel），用户可在分类页直接使用编辑器

## v8 调整
- [x] 非首页导航栏改为深色字体（白色背景），为 SFHeader 添加 darkMode prop
- [x] 编辑器重构为页面感知模式：主页显示 HOME_TABS（布局/促销栏/导航/横幅/分类/字幕/视频/产品/系列/面料/订阅/页脚/导出），分类页显示 COLLECTIONS_TABS（分类页/促销栏/导航/页脚/导出）

## v9 调整
- [x] 精简分类页编辑器（只保留分类页+导出 Tab），促销栏/导航/页脚仅主页可编辑
- [x] 主页导航 Tab 新增字体大小/字重/字体样式/文字颜色/悬浮颜色设置（CSS 变量动态注入）

## Phase 产品详情页（Product Detail Page）
- [x] ThemeConfig 扩展：CareIconKey/ProductDetailConfig/SizeGuideRow 类型，CollectionConfig.productDetails，全局 pdpDefaultSizes/pdpSizeGuide/pdpShippingText
- [x] ThemeConfigContext 添加 updateProductDetail callback
- [x] ProductDetail.tsx：左侧缩略图画廊 + 主图 + Zoom 放大功能
- [x] ProductDetail.tsx：颜色色块选择（联动主图）+ 颜色名称显示
- [x] ProductDetail.tsx：尺码选择按鈕（S/M/L/XL，缺货置灰）+ 尺码表弹窗（Size Guide）
- [x] ProductDetail.tsx：数量选择（+/- 按鈕）
- [x] ProductDetail.tsx：产品名称、价格（划线原价 + 折扣价）
- [x] ProductDetail.tsx：标签徽章（BEST SELLER / NEW / LIMITED，可显示/隐藏）
- [x] ProductDetail.tsx：配送与退换货说明（折叠展开，放在产品信息区）
- [x] ProductDetail.tsx：护理说明（洗涤图标多选 + 文字，图标可在后台选择）
- [x] ProductDetail.tsx：面料信息关联（EcoMove/AirLight/SculptFlex，可显示/隐藏）
- [x] ProductDetail.tsx：社交分享按鈕（复制链接/Instagram/Pinterest）
- [x] ProductDetail.tsx：面包屑导航（导航栏下方）
- [x] ProductDetail.tsx：产品视频（可显示/隐藏）
- [x] ProductDetail.tsx：推荐产品板块（手动配置排首位 + 同分类自动填充，单行滑动，4-6个可调）
- [x] ProductDetail.tsx：移动端吸底加购栏（滚动后固定底部）
- [x] ProductDetail.tsx：返回顶部按鈕 + 返回分类页按鈕
- [x] ProductDetail.tsx：PromoBar + Header（深色模式）+ Footer
- [x] 编辑器新增 ProductPageTab（标签/描述/图片/面料/护理/尺码/视频/推荐产品/配送说明）
- [x] 路由注册 /products/:handle
- [x] 分类页产品卡片点击跳转 /products/:handle（自动生成 handle）

## v10 调整
- [x] 首页移动端产品板块取消无限滚动功能（改为分页scroll-snap）
- [x] 产品图点击展开大图后置顶显示（使用 ReactDOM.createPortal 渲染到 document.body，z-index 99999）
- [x] 首页产品板块增加页数按钮（桌面端+移动端分页点指示器）
- [x] 首页视频板块增加页数按钮（桌面端+移动端分页点指示器）
- [x] EditorPanel 产品页 Tab 增加 Size Guide 编辑功能（增删改行，可重置为全局默认）

## v11 调整
- [x] 视频板块添加视频链接字段（MP4直链/YouTube自动转嵌入/TikTok提示）
- [x] 视频板块取消快速加购按钮，改为产品展示卡片（图片+名称+价格）
- [x] 视频板块点击卡片弹出播放弹窗（视频+产品信息+Shop Now按钮，Portal置顶）
- [x] 视频板块EditorPanel增加视频链接、关联产品（名称/价格/图片/链接）编辑字段
- [x] 首页横幅增加9宫格内容位置选择（左上/中上/右上/左中/中中/右中/左下/中下/右下）
- [x] 首页横幅文本块支持自由增减，可调整标题/正文、字体样式/尺寸/颜色
- [x] 首页横幅高度桌面端/移动端分别调整（独立滑块）
- [x] 页脚导航列支持增删列、增删链接、编辑标题/URL、字体大小调整

## v12 调整
- [x] 视频板块关联产品展示样式修复（小图+名称在卡片底部，参考 Fabletics）
- [x] 桌面端产品分类页删除快速浏览（眼睛按钮）
- [x] Size Guide 完整编辑：表格增删、表名修改、尺码行增删（可变列数）
- [x] 富文本描述段落增加排序功能（上移/下移）
- [x] 首页横幅桌面端/移动端内容位置分开调节
- [x] 首页产品板块快速加购弹窗修复（去掉眼睛按钮、收藏按钮移到 ADD TO CART 右侧）
- [x] 系列版块图片点击跳转分类页（URL 字段可编辑）
- [x] 删除品牌故事功能（布局板块和添加板块按钮均删除）

## v13 调整
- [x] 快速加购弹窗按钮布局修复（ADD TO CART宽按钮独占一行或与收藏按钮同行且不截断）
- [x] 视频板块产品展示改为右下角叠加样式（参考Fabletics：产品小图+名称在卡片右下角）
- [x] 删除视频封面上传功能，改为自动从视频链接获取封面（YouTube缩略图/视频首帧）
- [x] 产品详情页描述富文本移到SHIPPING & RETURNS上方
- [x] 产品页编辑器按可修改版块提供独立选项卡（产品描述独立一个选项卡）
- [x] 修复移动端横幅内容位置不同步BUG（编辑器修改后前台未生效）

## v14 调整
- [x] 修复分类板块颜色色块被遮挡（颜色圆点超出卡片边界被裁剪）
- [x] 修复移动端横幅位置BUG根本原因（sf-hero-slide.active缺少height:100%导致absolute子元素百分比定位失效）
- [x] 整改视频卡片UI：左上角达人头像+名字，底部产品首图+产品名，删除@名称/视频标题/价格，视频封面改为原始缩略图
- [x] 升级视频弹窗：自动获取产品多图，展示2张，桌面端悬浮切换（A/B→C/B或A/D），桌面端左视频右产品布局，移动端全屏，删除价格显示

## v15 调整
- [x] 移除产品详情页编辑器"尺码"Tab
- [x] 配送说明改为多文本框（可增删），支持换行编辑
- [x] 视频播放卡片独立编辑器Tab（播放卡片），含尺寸/图片尺寸设置
- [x] 视频播放卡片增加价格字段（现价+划线价），留Shopify接口
- [x] 视频播放卡片增加SHOP NOW加购按钮，点击后显示购物车侧边栏，不关闭播放卡片
- [x] 所有可调尺寸（字体/按钮/模块）加桌面端/移动端独立调整控制

## v16 调整
- [x] 产品详情页：分享按钮展示/隐藏选项（编辑器）
- [x] 产品详情页：收藏按钮展示/隐藏选项（编辑器）
- [x] 产品详情页：ADD TO CART 按钮自适应宽度（flex:1 自适应）
- [x] 产品详情页：ADD TO CART 按钮下方增加 Shipping/Return 两个模块，编辑器独立编辑（物流模块 Tab）
- [x] 推荐产品板块标题可编辑（字体颜色、尺寸），编辑器增加独立板块（推荐产品 Tab）
- [x] 购物车持久化与结算跳转（Shopify 结账页接口，CHECKOUT 按钮 + loading 状态）
- [x] 视频播放卡片移动端底部产品栏增加颜色/尺码快速选择（色块+尺码按钮，编辑器可配置）

## v17 调整
- [x] 全局配色改为白/米白主色（#FFFFFF / #FAF9F7），绿色仅作点缀色
- [x] 分类卡片、系列板块、面料板块保留深绿，上下边缘加渐变过渡带（渐变过渡带）
- [x] 产品详情页：尺码选项改为全局模板统一（pdpDefaultSizes，编辑器支持全局+产品级覆盖）
- [x] 产品详情页：Size Guide 改为全局模板统一，编辑器支持全局+产品级覆盖
- [x] 产品详情页：Share/收藏按钮显隐改为全局开关（编辑器「按钮/分享」Tab）
- [x] 产品详情页：配送政策折叠块（SHIPPING & RETURNS）改为全局模板文本
- [x] 产品详情页：物流模块（FREE SHIPPING / EASY RETURNS）确认全局生效
- [x] 产品详情页：PRODUCT DETAILS 富文本改为 Shopify 描述占位说明
- [x] 修复产品详情页重复出现两个 PRODUCT DETAILS 折叠块的 Bug
- [x] 分类页改为单一模板页面（移除多分类实例产品数据录入，保留样式配置）
- [x] 产品详情页改为单一模板页面（移除产品级数据录入，保留样式配置）
- [x] 推荐产品 Tag 编辑器支持（在「推荐产品」Tab 中增加 badge 字段编辑）
- [x] 视频弹窗桌面端右侧产品面板增加颜色色块+尺码选择器
- [x] 性能优化：EditorPanel 整体 React.lazy 懒加载（编辑器代码不影响前台首屏）
- [x] 性能优化：视频板块/推荐产品板块使用 IntersectionObserver 懒加载
- [x] 性能优化：所有非首屏图片添加 loading="lazy"

## About Us 页面（v18）
- [x] 定义 AboutUs 配置类型（7个板块 + 排序 + 显隐）到 ThemeConfigContext
- [x] 在 server/routers.ts 中添加 aboutUs.getConfig / setConfig tRPC 接口（复用 theme.setConfig/getAll）
- [x] 创建 client/src/pages/AboutUs.tsx（7个板块完整渲染）
- [x] 创建 AboutUsEditorPanel.tsx（独立分栏 + 展示/隐藏 + 排序）
- [x] 在 App.tsx 中注册 /pages/about-us 路由
- [x] 在导航栏中添加 About Us 链接（默认 navItems 已包含）
- [x] 添加 About Us CSS 样式到 index.css
- [x] 写 vitest 测试（server/about-us.test.ts，4 个测试全部通过）

## About Us 页面（v18）
- [x] 定义 AboutUsConfig 类型（ThemeConfigContext.tsx）
- [x] 添加 defaultAboutUsConfig 默认数据
- [x] 创建 AboutUs.tsx 页面（7 个板块渲染）
- [x] 创建 AboutUsEditorPanel.tsx（独立分栏 + 展示/隐藏 + 排序）
- [x] 注册路由 /pages/about-us（App.tsx）
- [x] 添加 About Us CSS 样式（index.css）
- [x] 集成编辑器按钮到 About Us 页面

## About Us 页面重设计（v19）
- [x] 重写 AboutUs.tsx 版面布局（对标 olaben.com 风格：大字标题+错位图文+分隔线+极简白底）
- [x] 编辑器布局 Tab 新增板块增删功能（可自由添加/删除板块实例）
- [x] 每个文本字段新增宽度/换行控制（max-width 滑块 + white-space 切换）
- [x] 更新 About Us CSS 样式（index.css，au2- 类名系统）
- [x] 17 个 vitest 测试全部通过，保存 checkpoint v19

## Blog 页面（v1）
- [x] 定义 Mock 数据结构（shared/mockBlogData.ts）和 Shopify 查询预留（shared/shopifyBlogQueries.ts）
- [x] 搭建 Blog 列表页 BlogIndex.tsx（Hero + 分类筛选 + 精选大卡 + 卡片网格 + 加载更多 + Footer CTA）
- [x] 搭建文章详情抽屉 BlogArticleDrawer.tsx（模式A，右侧滑入）
- [x] 搭建文章详情页 BlogArticle.tsx（模式B，含面包屑导航 + 可隐藏侧边栏 TOC）
- [x] 搭建 Blog 编辑器面板 BlogEditorPanel.tsx（布局/Hero/分类/文章/精选/Footer/详情模式）
- [x] 注册路由（/pages/blog 和 /pages/blog/:handle）
- [x] 添加 Blog CSS 样式到 index.css
- [x] 17 个 vitest 测试全部通过
- [x] 保存 checkpoint（v a89184a3）

## Blog 页面 Bug 修复（v2）
- [x] 修复 Bug 1：卡片网格排版错乱（BlogConfig 类型定义移到 ThemeConfig 接口之前）
- [x] 修复 Bug 2：编辑器按钮点击无反应（同上，根本原因相同）
- [x] 修复 Bug 3：导航栏白色字体（index.css 添加 .sf-header.dark-mode .sf-nav-link 深色覆盖）
- [x] 修复 Bug 4：卡片链接样式 A/C 可切换（ThemeConfigContext + BlogIndex + BlogEditorPanel + CSS）
- [x] 保存 checkpoint

## Blog 页面 Bug 修复（v3）
- [x] 修复 Bug 1：卡片图片占位块高度异常（.blog-card-img-wrap 添加 display:block + width:100%）
- [x] 修复 Bug 2：编辑器按钮无反应（已确认正常，无需修复）
- [x] 修复 Bug 3：详情页导航栏白字（BlogArticle.tsx 将 darkMode={false} 改为 darkMode={true}）
- [x] 修复精选大卡图片区域高度过高（移除 aspect-ratio，改用 min-height:320px）
- [x] 17 个 vitest 测试全部通过
- [x] 保存 checkpoint

## Influencer 页面开发
- [x] 定义 InfluencerConfig 数据结构并集成到 ThemeConfigContext
- [x] 开发 InfluencerPage 主页面（Hero / 达人展示 / 合作权益 / 申请要求 / 申请表单 / FAQ）
- [x] 开发 InfluencerEditorPanel 编辑器（5个Tab：Hero/达人/权益与要求/表单/FAQ）
- [x] 编辑器：所有标题/按钮支持字体样式、尺寸、颜色、展示/隐藏控件
- [x] 编辑器：合作权益与申请要求支持增删改
- [x] 编辑器：申请表单字段支持增删改、显隐控制
- [x] 添加 Influencer 页面 CSS 样式
- [x] 注册路由 /pages/influencer
- [x] 运行测试并保存检查点

## Influencer 页面升级
- [x] Shop Her Look 弹窗升级为首页视频快速浏览样式（左侧图片占位块+右侧产品信息+SHOP NOW 按钮）
- [x] 新建 InfluencerApplyPage（/pages/influencer/apply），包含权益/要求/表单/FAQ 板块
- [x] InfluencerPage 的 APPLY NOW 按钮改为跳转到 /pages/influencer/apply
- [x] InfluencerPage 移除权益/要求/表单/FAQ 板块（保留 Hero + 达人展示）
- [x] 注册 /pages/influencer/apply 路由到 App.tsx

## Influencer 页面第三轮升级
- [x] InfluencerConfig 增加 heroFullWidth / counters / creatorsPerRow / creatorCardAspectRatio 字段
- [x] InfluencerCreator 增加 detailImages / detailVideos / bio / detailTitle 字段
- [x] InfluencerPage Hero 增加全幅切换（heroFullWidth toggle）
- [x] InfluencerPage 增加数字滚动计数板块（counters 配置）
- [x] InfluencerPage 达人网格支持 perRow / aspectRatio 编辑器控制
- [x] InfluencerEditorPanel Hero Tab 增加全幅切换控制
- [x] InfluencerEditorPanel 达人 Tab 增加每行数量/图片尺嫸控制
- [x] InfluencerEditorPanel 增加计数板块 Tab
- [x] Apply 页增加编辑器入口（InfluencerApplyEditorPanel）
- [x] Apply 页编辑器支持板块顺序拖拽/上移下移
- [x] 新建达人详情页 /pages/influencer/:handle
- [x] 达人详情页展示 bio / 合作视频 / 合作图片 / 产品推荐
- [x] 注册 /pages/influencer/:handle 路由到 App.tsx
- [x] InfluencerEditorPanel 达人 Tab 增加详情页字段编辑（bio/detailImages/detailVideos）

## 其他页面（第四轮）
- [x] 扩展 ThemeConfigContext：添加 policyPages / returnsPage / fabricGuidePage 配置类型
- [x] 新建 ReturnPolicyPage（/pages/return-policy）：Hero + 政策占位文本（编辑器可编辑）+ FAQ 折叠 + CTA
- [x] 新建 PrivacyPolicyPage（/pages/privacy-policy）：Hero + 政策占位文本（编辑器可编辑）+ 锚点目录
- [x] 新建 ShippingPage（/pages/shipping）：Hero + 3个亮点卡片 + 政策占位文本（编辑器可编辑）+ CTA
- [x] 新建 TermsOfServicePage（/pages/terms-of-service）：Hero + 政策占位文本（编辑器可编辑）+ 锚点目录
- [x] 新建 ReturnsPage（/pages/returns）：Hero + 资格对比卡片 + 5步步骤条 + CTA，带编辑器
- [x] 新建 FabricGuidePage（/pages/fabric-guide）：Hero + 面料卡片网格（编辑器可增删改）+ 护理指南 + 可持续承诺
- [x] 注册六个新路由到 App.tsx
- [x] 更新 Footer 默认链接指向新页面路由

## Bug 修复（编辑器面板）
- [x] 修复 ReturnsPage 编辑器面板不可见 Bug（CSS 类名 editor-panel--open → editor-panel open，editor-header → editor-panel-header）
- [x] 修复 FabricGuidePage 编辑器面板不可见 Bug（同上）
- [x] 在 index.css 中补充 editor-body-section、editor-color-row、editor-color-swatch 缺失样式

## 其他页面补充导航/页脚
- [x] ReturnPolicyPage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter
- [x] PrivacyPolicyPage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter
- [x] ShippingPage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter
- [x] TermsOfServicePage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter
- [x] ReturnsPage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter
- [x] FabricGuidePage：添加 SFPromoBar + SFHeader（darkMode=false）+ SFFooter

## Hero 区域修复与高度调节功能
- [x] 修复 PolicyPage Hero 区域被导航栏遮挡（padding-top 从 80px 改为 120px）
- [x] 修复 FabricGuidePage Hero 区域被导航栏遮挡（同上）
- [x] 修复 ReturnsPage Hero 区域被导航栏遮挡（同上）
- [x] 为 PolicyPage 编辑器 Hero Tab 添加 heroMinHeight 高度调节滑块（200-600px）
- [x] 为 FabricGuidePage 编辑器 Hero Tab 添加 heroMinHeight 高度调节滑块
- [x] 为 ReturnsPage 编辑器 Hero Tab 添加 heroMinHeight 高度调节滑块
- [x] 为 BlogIndex 编辑器 Hero Tab 添加 heroMinHeight 高度调节滑块
- [x] 为 AboutUs 编辑器 Hero Tab 添加 heroMinHeight 高度调节滑块（300-900px）
- [x] ThemeConfigContext 各页面配置接口新增 heroMinHeight 字段

## Hero 内容位置九宫格功能
- [x] ThemeConfigContext：为 PolicyPageConfig、ReturnsPageConfig、FabricGuidePageConfig、BlogConfig、AboutUsConfig 添加 heroDesktopPosition / heroMobilePosition 字段
- [x] 提取可复用的 heroPositionVars 工具函数和 NINE_GRID_POSITIONS（lib/heroPosition.ts）
- [x] PolicyPage 编辑器 Hero Tab：添加桌面端/移动端九宫格选择器，Hero 应用 CSS 变量定位
- [x] ReturnsPage 编辑器 Hero Tab：同上
- [x] FabricGuidePage 编辑器 Hero Tab：同上
- [x] BlogIndex 编辑器 Hero Tab：同上
- [x] AboutUsEditorPanel Hero Tab：同上

## 代码优化（转换 Shopify Liquid 前）
- [x] 删除 framer-motion 依赖（完全未使用）
- [x] 删除 recharts 依赖（完全未使用）
- [x] 注意：axios 服务端 sdk.ts 有使用，保留（仅前端未用）
- [x] 删除 client/src/components/ui/chart.tsx（依赖 recharts，无引用）
- [x] 删除 client/src/pages/ComponentShowcase.tsx（模板演示页，不在路由中）
- [x] 删除 client/src/components/DashboardLayout.tsx 和 DashboardLayoutSkeleton.tsx（模板自带，本项目未使用）
- [x] 删除 client/src/components/AIChatBox.tsx（模板自带，本项目未使用）
- [x] React.lazy 代码分割：Collections、ProductDetail、AboutUs、BlogIndex、BlogArticle、InfluencerPage、InfluencerApplyPage、InfluencerCreatorPage、PolicyPage、ReturnsPage、FabricGuidePage
- [x] 构建验证：主 bundle 从 1,224 KB → 820 KB（-33%），gzip 从 282 KB → 227 KB（-20%）

## 首页 Banner 和导航栏优化
- [x] 修复首页 Banner 轮换时底部出现绿色背景条的问题，过渡动画自然
- [x] 促销栏编辑器新增字体大小调节（桌面端/移动端独立）
- [x] 促销栏编辑器新增高度调节（桌面端/移动端独立）
- [x] 导航栏编辑器新增绿色/白色双 Logo 上传功能，透明导航栏自动用白色，白底导航栏自动用绿色
- [x] 导航栏编辑器新增 Logo 展示尺寸调节（桌面端/移动端独立）

## 移动端优化与编辑器功能扩展
- [x] 修复 Logo 切换延迟（scroll 阈値从 60px 降到 10px，导航栏背景过渡缩短到 0.15s）
- [x] 移动端 Banner 白边分析（根本原因是图片比例不匹配，建议上传移动端专用竖版图片）
- [x] 横幅新增桌面端/移动端独立图片上传（无移动端图片时自动适配桌面端图片）
- [x] 扩大 Logo 尺寸调节范围（桌面端 20-160px，移动端 16-120px）
- [x] Copyright 文字可编辑（页脚 Tab 新增 Copyright 文本输入框）

## 促销栏/Banner/页脚修复 (2026-06-08)
- [x] 修复促销栏遮挡 Banner（sf-hero margin-top 需计入促销栏高度）
- [x] 修复移动端促销栏与导航栏之间的间距（两者应紧贴，无缝隙）
- [x] 英雄板块文本样式调节（标题/副标题字体大小、颜色、粗细）
- [x] 修复页脚导航字体尺寸调节 Bug（编辑器有滑块但页面未生效）
- [x] 页脚板块高度调节功能

## v当前修复（Bug Fix + 功能增强）
- [x] 修复促销栏遮挡英雄 Banner（桌面/移动端 storefront padding-top 改为动态 CSS 变量）
- [x] 修复移动端促销栏与导航栏间距（sf-header top 改为 CSS 变量，移动端媒体查询使用 --promo-m-height）
- [x] 英雄板块标题/副标题字体尺寸、颜色、字重调节功能（ThemeConfig 新增字段 + EditorPanel 新增控件）
- [x] 修复页脚导航字体尺寸 Bug（移动端 640px 媒体查询硬编码 0.78rem 覆盖 CSS 变量，改为 var(--footer-nav-m-font-size)）
- [x] 页脚板块高度调节功能（ThemeConfig 新增 footerPaddingY/footerMobilePaddingY + EditorPanel 新增控件）

## 功能开发（第二阶段）
- [x] 订阅卡片重设计：Split-layout（左图右文）、Cormorant Garamond 字体、深绿/奶白主题切换、移动端 Bottom Sheet
- [x] Cart Drawer：右侧滑出购物车、商品列表、数量调整、小计、Checkout 按钮
- [x] Size Guide 弹窗：产品详情页点击弹出，复用 /size-guide 页面组件数据
- [x] /size-guide 独立页面（/pages/size-guide）：完整尺码表，英制/公制切换
- [x] 会员中心页面（/account）：登录/注册/个人资料/收货地址/订阅偏好 高保真 UI 演示
- [x] 搜索功能：全屏搜索覆盖层，支持商品/系列/导航页搜索，ESC 关闭，快捷标签
- [x] 感谢页 /thank-you（订单确认、进度条、订单明细、配送地址、CTA）
- [x] 历史订单页面 /account/orders（订单列表、状态筛选、展开商品明细）
- [x] 订单状态页面 /account/orders/:id（时间轴、商品明细、配送/支付信息、物流跟踪占位）

## Bug修复与功能扩展（第三阶段）
- [x] 修复促销栏遮挡Hero图（duskyonder-preview已正确，Hero高度计算包含promo+header）
- [x] 修复购物车图标点击无反应（StorefrontShell.tsx引入useCart，连接openCart和totalCount）
- [x] 修复产品卡片swatch遮挡（DesktopProductPager paddingBottom 8→24，marginBottom -8→-24）
- [x] 尺码指南页专属编辑器（SizeGuidePage.tsx内联编辑器，从EditorPanel移除pdp-sizeguide Tab）
- [x] Wishlist收藏夹页面（/wishlist，支持加购和移除，Shopify metafields接口注释）
- [x] 搜索结果页（/search，支持商品/系列/页面搜索，筛选和排序，Shopify predictive_search API接口注释）
- [x] 订阅弹窗编辑器集成（订阅Tab已有图片上传和主题切换）

## 购物车重设计与滤镜功能（第四阶段）
- [x] 购物车抽屉重设计：奶白配色(#FAF8F4)主体、Cormorant Garamond字体标题、深绿标题栏/按钮
- [x] 购物车推荐加购区：「PAIR IT PERFECTLY WITH」横向滚动卡片，从同系列推荐2-4件，+ Add一键加购
- [x] 购物车宽度调整：编辑器「购物车」Tab添加宽度滑块(360-560px，默认420px)
- [x] 包邮进度条编辑：目标金额、达标文案、未达标文案（支持{{amount}}占位符）
- [x] 产品名称点击跳转对应产品详情页
- [x] 5种复古滤镜（按版块独立开关）：Fuji Velvia、Fuji Provia、Kodak Gold 200、Lomo LC-A、Holga 120
- [x] 滤镜编辑器控件：编辑器「购物车」Tab统一管理各版块图片滤镜下拉选择

## Phase 5 — Bug Fixes & Layout Improvements (v18)
- [x] 购物车抽屉配色改回奶白方案（白色主体+深绿标题栏），桌面端推荐区加左右箭头
- [x] 修复乱码：产品图片占位符文字乱码、视频区域乱码文字
- [x] 修复滤镜不生效BUG：滤镜类正确应用到 wrapper 层（而非 img 元素）
- [x] 首页产品板块改为全屏宽度（sf-scroll-section-wrapper padding:0）
- [x] 首页视频/达人板块改为全屏宽度（sf-videos-grid padding:0）
- [x] 首页系列板块改为全屏宽度（sf-series-inner padding:0）

## Phase 6 — 滤镜删除 + 宽高调节功能
- [x] 完整删除滤镜功能：index.css 滤镜CSS类、ThemeConfig 滤镜字段、EditorPanel 滤镜控件、Home.tsx/Collections.tsx 滤镜类名应用
- [x] 回滚全屏宽度：恢复 sf-scroll-section-wrapper padding:0 52px、sf-videos-grid padding:0 24px、sf-series-inner padding:0 60px
- [x] 产品板块：编辑器增加「展示宽度」（max-width 800-1600px 滑块）和「卡片高度」（图片高度 0-600px 滑块）调节
- [x] 视频板块：编辑器增加「展示宽度」（max-width 800-1600px 滑块）和「卡片高度」（视频卡片高度 0-600px 滑块）调节
- [x] 系列板块：编辑器增加「展示宽度」（max-width 800-1600px 滑块）和「区域最小高度」（min-height 300-800px 滑块）调节
- [x] index.css 为 sf-video-card 和 sf-product-image 添加 CSS 变量消费（height: var(--video-card-height) / var(--product-card-height)

## Phase 7 — 美化 + 推荐 + 宽高分离 + BUG修复

- [x] 修复系列板块「区域最小高度」滑块无效 BUG（CSS 变量路径修复，图片列 height:100% 跨容器高度）
- [x] 分类板块 A 风格：去掉底部横条，文字叠加在底部渐变遮罩上（白色大写粗体 + 宽字距）
- [x] 产品板块 B 风格：去掉边框/阴影，价格改为炭灰色 #1a1a1a，产品名改为衬线字体（Cormorant Garamond）
- [x] 购物车搜配推荐：ThemeConfig 产品对象新增 relatedProductIds 字段
- [x] 购物车搜配推荐：EditorPanel 产品编辑区新增「搜配推荐」多选控件
- [x] 购物车搜配推荐：CartDrawer 推荐逻辑优先展示 relatedProductIds 指定商品，不足时用其他商品补足
- [x] 产品/视频/系列板块：桌面端与移动端分别独立调整展示宽度和高度的滑块控件
- [x] Home.tsx：将桌面/移动端宽高 CSS 变量分离，三个板块均支持移动端独立控制

## Phase 8 — 分类/产品板块高端化改造

- [x] 分类板块：去掉卡片间隙（无缝横幅），遮罩改黑色半透明渐变，文字放大为 serif 字体
- [x] 分类板块 ThemeConfig：新增 categoryOverlayOpacity（遮罩深度）、categoryLabelFontSizeDesktop/Mobile（字体大小）、categoryGapDesktop/Mobile（卡片间隙）字段
- [x] 分类板块编辑器：新增遮罩深度、桌面/移动端字体大小、桌面/移动端卡片间隙滑块
- [x] 产品板块：标题改为左对齐斜体衬线字体 + 小号灰色副标题，占位图改浅灰 #f5f5f5
- [x] 产品色块：改为小实心圆点（12px）、无边框、紧凑排列，严格按设计稿
- [x] 产品板块 ThemeConfig：新增 productTitleFontSizeDesktop/Mobile、productGapDesktop/Mobile 字段
- [x] 产品板块编辑器：保留桌面/移动端宽高控件，新增字体大小、卡片间隙滑块

## Phase 9 — 色块 BUG 修复 + 编辑器控件

- [x] 修复移动端色块点击跳转首页 BUG（sf-product-info 加 position:relative + z-index:10，色块容器加 e.stopPropagation() 拦截事件冒泡）
- [x] 产品板块编辑器「颜色色块」区域：新增色块尺寸（6-20px）和色块间距（2-12px）滑块
- [x] ThemeConfig 新增 productsSwatchGap 字段（默认 4px），productsSwatchSize 默认值修正为 10px
- [x] Home.tsx 色块容器 gap 改为消费 config.productsSwatchGap，size 改为消费 config.productsSwatchSize

## 当前任务（2026-06-09）
- [x] 将色块控件添加到 PDP「推荐产品」Tab（EditorPanel）
- [x] Influencer 展示页重设计（达人卡片网格，保留 Hero+Stats+CTA）
- [x] 达人详情页重设计（Instagram 风格 Profile + Products/Videos 2栏 Tab）
- [x] Apply 申请页极简重设计（大留白、线条表单、去 B2B 感）

## 当前任务（2026-06-09 第二轮）
- [x] 达人卡片排版重设计：删除卡片下方数据行、改为3列、4:5比例、平台标签去色块
- [x] Apply 页修复：导航栏颜色、Benefits 改为1×4单行网格、压缩留白
- [x] Apply 编辑器增加各板块编辑 Tab（合作权益/申请要求/表单/FAQ）
- [x] 订阅弹窗仅保留首页，产品详情页和 Blog 文章页加内嵌订阅条

## 当前批次修改（2026-06-09）
- [x] 订阅功能：改为内嵌订阅条（产品详情页 + Blog 文章页，受 enableNewsletter 控制）
- [x] 权益卡片：改为 1×4 网格，单行显示，max-width 扩展至 1100px
- [x] Apply 页编辑器：改造为多 Tab 编辑器（板块排序 / 合作权益 / 申请要求 / 表单 / FAQ）
- [x] 达人卡片：3 列布局，4:5 图片比例，删除数据行，去平台标签色块
- [x] Apply 页 Hero 留白压缩（padding 120px→100px/80px→56px）

## 代码拆分重构（2026-06-09）
- [x] index.css（8145行）拆分为 index.css(18行) + 9个页面级 CSS 文件
- [x] Home.tsx（2126行）拆分为主文件(601行) + HomeVideos/HomeFeatured/HomeNewsletter/HomeIcons 4个子组件
- [x] ProductDetail.tsx（1148行）拆分为主文件(169行) + ProductDetailGallery/Info/Modals/Icons 4个子组件
- [x] InfluencerPage.tsx（416行）拆分为主文件(131行) + InfluencerComponents(287行)
- [x] InfluencerApplyPage.tsx（747行）拆分为主文件(68行) + InfluencerApplySections(296行) + InfluencerApplyEditor(400行)
- [x] AboutUs.tsx（310行）拆分为主文件(39行) + AboutUsSections(275行)
- [x] server/routers.ts 仅62行，无需拆分

## 三大优化批次（2026-06-09）

### A组 - 11项UI修复
- [x] A1: 申请页 Hero 标题/副标题/面包屑居中
- [x] A2: 申请要求板块默认内边距压缩 + 编辑器新增内边距/宽度/高度滑块
- [x] A3: 字幕滚动条间距均匀（动态等分）
- [x] A4: 移动端汉堡菜单：有子菜单的项点击直接展开，不跳转
- [x] A5: 推荐产品 Tag 颜色色块 BUG 修复
- [x] A6: 移动端 Influencer 页面布局优化（计数板块横排、达人卡片2列）
- [x] A7: 达人详情页 Video Tag 弹窗改为首页视频弹窗样式

### B组 - About Us + 导航
- [x] B1: 导航栏 Influencer 菜单项加 badge（移动端菜单）
- [x] B2: About Us 字体统一（已通过 --font-display 变量统一为 Tenor Sans）
- [x] B3: 品牌故事/产品哲学板块图片插入+尺寸调节功能
- [x] B4: About Us 页面视觉重设计（去B端化，奶白底+图文错位）

## BUG 修复 - 达人详情页三项（2026-06-09）
- [x] BUG1: 达人详情页 Video 卡片点击弹窗不正确（getDefaultMediaItems type 改为 video，弹出左视频+右产品布局）
- [x] BUG2: 达人详情页导航栏图标颜色为白色（base.css 为 dark-mode 添加 sf-icon-btn 深色规则）
- [x] BUG3: 移动端达人页面卡片显示 4 列（改用 CSS 变量注入 perRow，媒体查询可正确覆盖为 2 列）

## About Us 图文对齐 + 图片比例调节（2026-06-09）
- [x] 品牌故事/产品哲学板块图文高度对齐（align-items: stretch + 图片 height:100% 填满容器）
- [x] 编辑器中新增图片展示比例选择控件（2/3、3/4、4/5、1/1、16/9 五档）
- [x] ThemeConfigContext 新增 storyImageAspect / philosophyImageAspect 字段
- [x] CSS 变量 --story-img-aspect / --philosophy-img-aspect 动态注入比例

## 编辑器清理 + shopifyExporter 拆分（2026-06-09）
- [x] 删除 5 个独立编辑器文件（BlogEditor/FabricGuideEditor/ReturnsEditor/PolicyEditor/SizeGuideEditor）及其所有页面引用
- [x] 清理 BlogIndex/InfluencerPage/InfluencerApplyPage/InfluencerCreatorPage 中的编辑器 import 和 JSX
- [x] 清理 FabricGuidePage/ReturnsPage/PolicyPage 中的内联编辑器逻辑
- [x] 清理 SizeGuidePage 中的内联编辑器逻辑
- [x] 删除 editor.css 并从 index.css 中移除其 import
- [x] 将 shopifyExporter.ts（1002行）拆分为 4 个子模块 + 1 个入口文件：
  - layout.ts（179行）：theme.liquid + header.liquid + footer.liquid
  - homepage.ts（459行）：index.json + 首页所有 section Liquid
  - assets.ts（297行）：style.css + script.js
  - settings.ts（71行）：settings_schema.json + settings_data.json
  - index.ts（59行）：统一入口，重新导出所有函数
- [x] TypeScript 0 错误验证通过

## Dead Code Cleanup — HomeVideos.tsx (2026-06-18)
- [x] Removed `QuickViewModal` component (entire component, ~75 lines)
- [x] Removed `isMobileModal` state and its `resize` useEffect
- [x] Removed unused `videoRef` ref
- [x] Removed outer `mobileVideoCardCount = 2` constant (replaced inline with literal `2`)
- [x] TypeScript check: 0 errors
- [x] Committed to main: d16deb5 — "refactor: remove dead code (QuickViewModal, isMobileModal, videoRef, mobileVideoCardCount)"
- [x] Backup branch created: backup/before-dead-code-cleanup

## Project Rules: Code Quality & Backup Policy

**Dead / junk code:** After every feature change or overhaul, audit and remove all dead/unused
code before committing — this includes unused imports, duplicate helpers, loop-local constants
that never change, one-liner pass-through aliases, and re-declared types.

**Rolling backup branch:** Before any modification, create a backup branch from the current
main tip. When making the next modification, delete the previous backup branch and create a
new one from the then-current main tip. Only one backup branch exists at a time — it always
represents the state immediately before the most recent change.

Branch naming: `backup/before-<short-description>` (e.g. `backup/before-junk-cleanup`).

**TypeScript check:** Run `npx tsc --noEmit` after every edit; commit only when 0 errors.

## Junk Code Cleanup — HomeVideos.tsx (2026-06-18)
- [x] Removed unused `ImageIcon` import
- [x] Removed `ChevronUpNavIcon` (duplicate of `ChevronUpIcon`); replaced its one usage with `ChevronUpIcon`
- [x] Removed `mobileCardCount = 2` declared inside `.map()` loop on every iteration (constant, never changes)
- [x] Removed `toEmbedUrlLocal` alias (one-liner pass-through to `toEmbedUrl`); call `toEmbedUrl` directly
- [x] Removed inner `type ColorEntry` re-declaration inside desktop modal IIFE (already declared at module top)
- [x] TypeScript check: 0 errors
- [x] Committed to main: cb6b6fd
- [x] Rolling backup: deleted `backup/before-dead-code-cleanup`, created `backup/before-junk-cleanup`
