import type { ElyPublicSelectOption } from "@elysian/ui-public-vue"

/* ── Shared locale helpers ───────────────────────────────── */

export type Locale = "en" | "zh"

export const localeItems = [
  { key: "en", label: "English", value: "en" },
  { key: "zh", label: "中文", value: "zh" },
] as const

/* ── Enterprise Data Table ────────────────────────────────── */

export const dataTableI18n = {
  en: {
    title: "Users",
    description: "Manage user accounts and permissions",
    addUser: "Add user",
    searchPlaceholder: "Search users...",
    searchLabel: "Search users",
    roleLabel: "Role",
    statusLabel: "Status",
    colName: "Name",
    colRole: "Role",
    colStatus: "Status",
    colLastActive: "Last active",
    colActions: "Actions",
    pagination: "Showing 1–6 of 128 users",
    selectAll: "Select all",
    moreActions: "More actions",
    roleOptions: [
      { label: "All Roles", value: "" },
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ] as ElyPublicSelectOption[],
    statusOptions: [
      { label: "All Status", value: "" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ] as ElyPublicSelectOption[],
  },
  zh: {
    title: "用户管理",
    description: "管理用户账户和权限",
    addUser: "添加用户",
    searchPlaceholder: "搜索用户...",
    searchLabel: "搜索用户",
    roleLabel: "角色",
    statusLabel: "状态",
    colName: "名称",
    colRole: "角色",
    colStatus: "状态",
    colLastActive: "最近活跃",
    colActions: "操作",
    pagination: "显示 1–6 / 共 128 位用户",
    selectAll: "全选",
    moreActions: "更多操作",
    roleOptions: [
      { label: "全部角色", value: "" },
      { label: "管理员", value: "admin" },
      { label: "编辑者", value: "editor" },
      { label: "查看者", value: "viewer" },
    ] as ElyPublicSelectOption[],
    statusOptions: [
      { label: "全部状态", value: "" },
      { label: "活跃", value: "active" },
      { label: "未激活", value: "inactive" },
    ] as ElyPublicSelectOption[],
  },
}

/* ── Enterprise Form Create ───────────────────────────────── */

export const formCreateI18n = {
  en: {
    breadcrumb: ["Dashboard", "Users", "New User"],
    title: "Create User",
    cancel: "Cancel",
    submit: "Create User",
    basicTitle: "Basic Information",
    basicDesc: "Core identity and contact details for the new user.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    bio: "Bio",
    roleTitle: "Role & Permissions",
    roleDesc: "Assign access level and granular permission flags.",
    role: "Role",
    isActive: "Account active",
    isActiveDesc: "Inactive users cannot sign in to the platform.",
    emailVerified: "Email verified",
    emailVerifiedDesc: "Mark this user's email address as already verified.",
    permissions: "Permissions",
    receiveReports: "Receive reports",
    receiveReportsDesc:
      "Allow this user to receive scheduled analytics reports.",
    manageUsers: "Manage users",
    manageUsersDesc:
      "Grant permission to create, edit, and deactivate other users.",
    viewAnalytics: "View analytics",
    viewAnalyticsDesc:
      "Allow access to the analytics dashboard and usage metrics.",
    prefTitle: "Preferences",
    prefDesc: "Locale and notification settings for this user.",
    timezone: "Timezone",
    language: "Language",
    notifs: "Enable notifications",
    notifsDesc: "Send email and in-app notifications for important updates.",
    roleOptions: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
      { label: "Guest", value: "guest" },
    ] as ElyPublicSelectOption[],
    timezoneOptions: [
      { label: "UTC-8 Pacific Time (PST)", value: "utc-8" },
      { label: "UTC-5 Eastern Time (EST)", value: "utc-5" },
      { label: "UTC+0 Greenwich Mean Time (GMT)", value: "utc+0" },
      { label: "UTC+8 China Standard Time (CST)", value: "utc+8" },
      { label: "UTC+9 Japan Standard Time (JST)", value: "utc+9" },
    ] as ElyPublicSelectOption[],
    languageOptions: [
      { label: "English", value: "en" },
      { label: "Japanese", value: "ja" },
      { label: "Chinese", value: "zh" },
      { label: "Korean", value: "ko" },
    ] as ElyPublicSelectOption[],
  },
  zh: {
    breadcrumb: ["控制台", "用户", "新建用户"],
    title: "新建用户",
    cancel: "取消",
    submit: "创建用户",
    basicTitle: "基本信息",
    basicDesc: "新用户的核心身份和联系方式。",
    firstName: "名",
    lastName: "姓",
    email: "邮箱",
    phone: "电话",
    bio: "简介",
    roleTitle: "角色与权限",
    roleDesc: "分配访问级别和细粒度权限。",
    role: "角色",
    isActive: "账户激活",
    isActiveDesc: "未激活的用户无法登录平台。",
    emailVerified: "邮箱已验证",
    emailVerifiedDesc: "将该用户的邮箱标记为已验证。",
    permissions: "权限",
    receiveReports: "接收报告",
    receiveReportsDesc: "允许该用户接收定期分析报告。",
    manageUsers: "管理用户",
    manageUsersDesc: "授予创建、编辑和停用其他用户的权限。",
    viewAnalytics: "查看分析",
    viewAnalyticsDesc: "允许访问分析仪表盘和使用指标。",
    prefTitle: "偏好设置",
    prefDesc: "该用户的地区和通知设置。",
    timezone: "时区",
    language: "语言",
    notifs: "启用通知",
    notifsDesc: "通过邮件和应用内通知发送重要更新。",
    roleOptions: [
      { label: "管理员", value: "admin" },
      { label: "编辑者", value: "editor" },
      { label: "查看者", value: "viewer" },
      { label: "访客", value: "guest" },
    ] as ElyPublicSelectOption[],
    timezoneOptions: [
      { label: "UTC-8 太平洋时间 (PST)", value: "utc-8" },
      { label: "UTC-5 美东时间 (EST)", value: "utc-5" },
      { label: "UTC+0 格林威治时间 (GMT)", value: "utc+0" },
      { label: "UTC+8 中国标准时间 (CST)", value: "utc+8" },
      { label: "UTC+9 日本标准时间 (JST)", value: "utc+9" },
    ] as ElyPublicSelectOption[],
    languageOptions: [
      { label: "英语", value: "en" },
      { label: "日语", value: "ja" },
      { label: "中文", value: "zh" },
      { label: "韩语", value: "ko" },
    ] as ElyPublicSelectOption[],
  },
}

/* ── Enterprise Form Wizard ───────────────────────────────── */

export const formWizardI18n = {
  en: {
    title: "Create Project",
    description: "Set up your new project in a few steps",
    steps: ["Project Info", "Team Setup", "Review"],
    back: "Back",
    next: "Next",
    submit: "Create Project",
    step1Title: "Project details",
    projectName: "Project name",
    projectDesc: "Description",
    category: "Category",
    website: "Website URL",
    configTitle: "Configuration",
    isPublic: "Make project public",
    enableNotifs: "Enable notifications",
    step2Title: "Invite members",
    memberEmail: "Email address",
    addMember: "Add",
    permTitle: "Permissions",
    defaultRole: "Default role",
    allowGuest: "Allow guest access",
    reviewTitle: "Review",
    projectDetails: "Project Details",
    teamPerms: "Team & Permissions",
    reviewName: "Name",
    reviewDesc: "Description",
    reviewCategory: "Category",
    reviewVisibility: "Visibility",
    reviewPublic: "Public",
    reviewPrivate: "Private",
    reviewMembers: "Members",
    reviewRole: "Default role",
    reviewGuest: "Guest access",
    categoryOptions: [
      { label: "Web App", value: "web" },
      { label: "Mobile App", value: "mobile" },
      { label: "API Service", value: "api" },
      { label: "Desktop App", value: "desktop" },
    ] as ElyPublicSelectOption[],
    roleOptions: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ] as ElyPublicSelectOption[],
  },
  zh: {
    title: "创建项目",
    description: "通过几个简单步骤设置新项目",
    steps: ["项目信息", "团队设置", "确认"],
    back: "上一步",
    next: "下一步",
    submit: "创建项目",
    step1Title: "项目详情",
    projectName: "项目名称",
    projectDesc: "项目描述",
    category: "分类",
    website: "网站地址",
    configTitle: "配置",
    isPublic: "公开项目",
    enableNotifs: "启用通知",
    step2Title: "邀请成员",
    memberEmail: "邮箱地址",
    addMember: "添加",
    permTitle: "权限",
    defaultRole: "默认角色",
    allowGuest: "允许访客访问",
    reviewTitle: "确认信息",
    projectDetails: "项目详情",
    teamPerms: "团队与权限",
    reviewName: "名称",
    reviewDesc: "描述",
    reviewCategory: "分类",
    reviewVisibility: "可见性",
    reviewPublic: "公开",
    reviewPrivate: "私有",
    reviewMembers: "成员",
    reviewRole: "默认角色",
    reviewGuest: "访客访问",
    categoryOptions: [
      { label: "Web 应用", value: "web" },
      { label: "移动应用", value: "mobile" },
      { label: "API 服务", value: "api" },
      { label: "桌面应用", value: "desktop" },
    ] as ElyPublicSelectOption[],
    roleOptions: [
      { label: "管理员", value: "admin" },
      { label: "编辑者", value: "editor" },
      { label: "查看者", value: "viewer" },
    ] as ElyPublicSelectOption[],
  },
}

/* ── Enterprise Detail ────────────────────────────────────── */

export const detailI18n = {
  en: {
    breadcrumb: ["Dashboard", "Projects", "Elysian Platform"],
    tabs: ["Overview", "Activity Log", "Related"],
    edit: "Edit",
    archive: "Archive",
    viewSite: "View Site",
    projectDetails: "Project Details",
    description: "Description",
    status: "Status",
    owner: "Owner",
    website: "Website",
    repository: "Repository",
    created: "Created",
    lastUpdated: "Last updated",
    teamMembers: "Team Members",
    activityLog: "Recent Activity",
    relatedProjects: "Related Projects",
    statusActive: "Active",
    descValue:
      "A modern web platform for creative professionals, featuring a component library, theme system, and structured code generation.",
    activities: [
      { title: "Project created", meta: "Jan 15, 2026" },
      { title: "Added Sakura Ito", meta: "Feb 3, 2026" },
      { title: "Status changed to Active", meta: "Mar 12, 2026" },
      { title: "Updated project settings", meta: "May 1, 2026" },
      { title: "Deployed v2.0", meta: "Jun 1, 2026" },
    ],
    team: [
      { name: "Yuki Tanaka", role: "Lead" },
      { name: "Sakura Ito", role: "Design" },
      { name: "Ren Yamamoto", role: "Engineering" },
      { name: "Mei Suzuki", role: "Product" },
    ],
  },
  zh: {
    breadcrumb: ["控制台", "项目", "Elysian 平台"],
    tabs: ["概览", "活动日志", "关联项目"],
    edit: "编辑",
    archive: "归档",
    viewSite: "访问站点",
    projectDetails: "项目详情",
    description: "描述",
    status: "状态",
    owner: "负责人",
    website: "网站",
    repository: "仓库",
    created: "创建时间",
    lastUpdated: "最后更新",
    teamMembers: "团队成员",
    activityLog: "最近活动",
    relatedProjects: "关联项目",
    statusActive: "活跃",
    descValue:
      "一个面向创意专业人士的现代 Web 平台，包含组件库、主题系统和结构化代码生成功能。",
    activities: [
      { title: "创建了项目", meta: "2026年1月15日" },
      { title: "添加了 Sakura Ito", meta: "2026年2月3日" },
      { title: "状态变更为活跃", meta: "2026年3月12日" },
      { title: "更新了项目设置", meta: "2026年5月1日" },
      { title: "部署了 v2.0", meta: "2026年6月1日" },
    ],
    team: [
      { name: "Yuki Tanaka", role: "负责人" },
      { name: "Sakura Ito", role: "设计" },
      { name: "Ren Yamamoto", role: "工程" },
      { name: "Mei Suzuki", role: "产品" },
    ],
  },
}

/* ── Website Landing ──────────────────────────────────────── */

export const landingI18n = {
  en: {
    badge: "Now in Beta",
    heading: "Build beautiful apps <em>faster</em>",
    description:
      "Elysian is a structured code generation platform that helps teams ship production-grade applications with confidence.",
    getStarted: "Get Started",
    viewDemo: "View Demo",
    stats: [
      { value: "50+", label: "Components" },
      { value: "5", label: "Themes" },
      { value: "99.9%", label: "Uptime" },
      { value: "2min", label: "Setup Time" },
    ],
    featuresHeading: "Everything you need",
    featuresDesc:
      "A complete design system with the tools, tokens, and patterns your team needs to build at scale.",
    features: [
      {
        icon: "🎨",
        title: "Component Library",
        description:
          "Over 50 production-ready components with consistent APIs, accessibility baked in, and theme-aware styling out of the box.",
      },
      {
        icon: "✨",
        title: "Theme System",
        description:
          "Five governed theme families with semantic tokens, dark mode support, and a clear contract for custom overrides.",
      },
      {
        icon: "⚡",
        title: "Code Generation",
        description:
          "Structured scaffolding that produces clean, typed source files instead of lock-in boilerplate or opaque bundles.",
      },
      {
        icon: "🛡️",
        title: "Type Safety",
        description:
          "Full TypeScript coverage across props, events, slots, and tokens so the editor catches mistakes before the browser does.",
      },
      {
        icon: "🏢",
        title: "Enterprise Ready",
        description:
          "SSR-compatible rendering, bundle-size discipline, WCAG compliance, and governance patterns that scale past the prototype phase.",
      },
      {
        icon: "🚀",
        title: "Developer Experience",
        description:
          "Autocomplete, live documentation, and a review-first preset so teams ship confident UI.",
      },
    ],
    ctaHeading: "Ready to get started?",
    ctaDesc: "Start building your next project in minutes, not weeks.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Contact Sales",
  },
  zh: {
    badge: "公测中",
    heading: "更快地构建<em>精美</em>应用",
    description:
      "Elysian 是一个结构化代码生成平台，帮助团队自信地交付生产级应用。",
    getStarted: "开始使用",
    viewDemo: "查看演示",
    stats: [
      { value: "50+", label: "组件" },
      { value: "5", label: "主题" },
      { value: "99.9%", label: "可用率" },
      { value: "2分钟", label: "上手时间" },
    ],
    featuresHeading: "你所需的一切",
    featuresDesc:
      "一套完整的设计系统，包含团队大规模构建所需的工具、令牌和模式。",
    features: [
      {
        icon: "🎨",
        title: "组件库",
        description:
          "超过 50 个生产就绪的组件，具备一致的 API、内置无障碍支持和开箱即用的主题适配样式。",
      },
      {
        icon: "✨",
        title: "主题系统",
        description:
          "五个受管理的主题系列，包含语义化令牌、暗色模式支持和清晰的自定义覆盖规范。",
      },
      {
        icon: "⚡",
        title: "代码生成",
        description:
          "结构化脚手架生成整洁、类型化的源文件，而非锁定式样板或不透明的打包产物。",
      },
      {
        icon: "🛡️",
        title: "类型安全",
        description:
          "在属性、事件、插槽和令牌上提供完整的 TypeScript 覆盖，让编辑器在浏览器之前捕获错误。",
      },
      {
        icon: "🏢",
        title: "企业就绪",
        description:
          "兼容 SSR 渲染、关注包体积、符合 WCAG 标准，以及可超越原型阶段扩展的治理模式。",
      },
      {
        icon: "🚀",
        title: "开发体验",
        description:
          "自动补全、实时文档和审查优先的预设，让团队自信地交付 UI。",
      },
    ],
    ctaHeading: "准备好开始了吗？",
    ctaDesc: "几分钟内开始构建下一个项目，而不是几周。",
    ctaPrimary: "免费开始",
    ctaSecondary: "联系销售",
  },
}

/* ── Website Pricing ──────────────────────────────────────── */

export const pricingI18n = {
  en: {
    title: "Simple, transparent pricing",
    subtitle:
      "Choose the plan that fits your team. All plans include core features.",
    monthly: "Monthly",
    yearly: "Yearly",
    plans: [
      {
        name: "Starter",
        price: "$0",
        period: "/month",
        desc: "For individuals and small projects",
        features: [
          "5 components",
          "1 theme",
          "Community support",
          "Basic templates",
          "Public repos",
        ],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Pro",
        badge: "Most Popular",
        price: "$29",
        period: "/month",
        desc: "For growing teams and businesses",
        features: [
          "50+ components",
          "5 themes",
          "Priority support",
          "All templates",
          "Private repos",
          "Custom branding",
        ],
        cta: "Start Free Trial",
        highlight: true,
      },
      {
        name: "Enterprise",
        price: "$99",
        period: "/month",
        desc: "For large organizations with advanced needs",
        features: [
          "Everything in Pro",
          "Unlimited components",
          "SSO & SAML",
          "Dedicated support",
          "SLA guarantee",
          "Custom integrations",
        ],
        cta: "Contact Sales",
        highlight: false,
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        key: "q1",
        title: "Can I change plans later?",
        content:
          "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
      },
      {
        key: "q2",
        title: "What happens when my trial ends?",
        content:
          "Your account reverts to the Starter plan. No data is lost, and you can upgrade again whenever you're ready.",
      },
      {
        key: "q3",
        title: "Do you offer refunds?",
        content:
          "We offer a 30-day money-back guarantee on all paid plans. No questions asked.",
      },
      {
        key: "q4",
        title: "Is there a free tier?",
        content:
          "Yes, the Starter plan is free forever with no credit card required.",
      },
      {
        key: "q5",
        title: "Can I cancel anytime?",
        content:
          "Absolutely. No long-term contracts. Cancel from your dashboard and you'll retain access until the end of your billing period.",
      },
    ],
  },
  zh: {
    title: "简单透明的定价",
    subtitle: "选择适合你团队的方案，所有方案均包含核心功能。",
    monthly: "月付",
    yearly: "年付",
    plans: [
      {
        name: "入门版",
        price: "¥0",
        period: "/月",
        desc: "面向个人和小型项目",
        features: ["5 个组件", "1 个主题", "社区支持", "基础模板", "公开仓库"],
        cta: "开始使用",
        highlight: false,
      },
      {
        name: "专业版",
        badge: "最受欢迎",
        price: "¥199",
        period: "/月",
        desc: "面向成长中的团队和企业",
        features: [
          "50+ 组件",
          "5 个主题",
          "优先支持",
          "全部模板",
          "私有仓库",
          "自定义品牌",
        ],
        cta: "免费试用",
        highlight: true,
      },
      {
        name: "企业版",
        price: "¥699",
        period: "/月",
        desc: "面向有高级需求的大型组织",
        features: [
          "包含专业版全部功能",
          "无限组件",
          "SSO 和 SAML",
          "专属支持",
          "SLA 保障",
          "定制集成",
        ],
        cta: "联系销售",
        highlight: false,
      },
    ],
    faqTitle: "常见问题",
    faq: [
      {
        key: "q1",
        title: "可以随时更换方案吗？",
        content: "可以，你可以随时升级或降级方案。变更将在下一个计费周期生效。",
      },
      {
        key: "q2",
        title: "试用期结束后会怎样？",
        content: "你的账户将恢复为入门版方案。数据不会丢失，随时可以再次升级。",
      },
      {
        key: "q3",
        title: "有退款政策吗？",
        content: "所有付费方案提供 30 天无理由退款保障。",
      },
      {
        key: "q4",
        title: "有免费方案吗？",
        content: "有的，入门版永久免费，无需信用卡。",
      },
      {
        key: "q5",
        title: "可以随时取消吗？",
        content:
          "当然可以。无需长期合约。从仪表盘取消后，你将保留至计费期结束的访问权限。",
      },
    ],
  },
}

/* ── Website About ────────────────────────────────────────── */

export const aboutI18n = {
  en: {
    heading: "About <em>Elysian</em>",
    description:
      "We're building the next generation of developer tools to help teams create beautiful, accessible, and performant applications.",
    missionTitle: "Our Mission",
    missionDesc:
      "Our mission is to make professional UI development accessible to every team, regardless of size or expertise. We believe that great design systems should not be a luxury reserved for large corporations.",
    stats: [
      { value: "2024", label: "Founded" },
      { value: "12", label: "Team Members" },
      { value: "500+", label: "Projects Built" },
      { value: "98%", label: "Satisfaction" },
    ],
    teamHeading: "Meet the Team",
    teamDesc: "The people behind Elysian",
    team: [
      { name: "Yuki Tanaka", role: "CEO & Founder" },
      { name: "Sakura Ito", role: "Head of Design" },
      { name: "Ren Yamamoto", role: "Lead Engineer" },
      { name: "Mei Suzuki", role: "Product Manager" },
      { name: "Kai Hashimoto", role: "DevOps Engineer" },
      { name: "Hana Watanabe", role: "UX Researcher" },
    ],
    journeyTitle: "Our Journey",
    timeline: [
      {
        key: "q1-2024",
        title: "Elysian founded",
        meta: "Q1 2024",
        content: "Started with a vision to simplify UI development",
      },
      {
        key: "q3-2024",
        title: "First beta release",
        meta: "Q3 2024",
        content: "Launched component library with 20 components",
      },
      {
        key: "q1-2025",
        title: "Public launch",
        meta: "Q1 2025",
        content: "Released v1.0 with full theme system",
      },
      {
        key: "q3-2025",
        title: "Enterprise tier",
        meta: "Q3 2025",
        content: "Added RBAC, multi-tenancy, and audit logs",
      },
      {
        key: "q1-2026",
        title: "AI-assisted generation",
        meta: "Q1 2026",
        content: "Integrated schema-driven code generation",
      },
    ],
  },
  zh: {
    heading: "关于 <em>Elysian</em>",
    description:
      "我们正在构建下一代开发工具，帮助团队创建美观、无障碍且高性能的应用。",
    missionTitle: "我们的使命",
    missionDesc:
      "我们的使命是让专业 UI 开发对每个团队都触手可及，无论规模或专业水平如何。我们相信优秀的设计系统不应是大企业的专属奢侈品。",
    stats: [
      { value: "2024", label: "成立年份" },
      { value: "12", label: "团队成员" },
      { value: "500+", label: "已构建项目" },
      { value: "98%", label: "满意度" },
    ],
    teamHeading: "认识团队",
    teamDesc: "Elysian 背后的人",
    team: [
      { name: "Yuki Tanaka", role: "CEO & 创始人" },
      { name: "Sakura Ito", role: "设计主管" },
      { name: "Ren Yamamoto", role: "首席工程师" },
      { name: "Mei Suzuki", role: "产品经理" },
      { name: "Kai Hashimoto", role: "DevOps 工程师" },
      { name: "Hana Watanabe", role: "UX 研究员" },
    ],
    journeyTitle: "发展历程",
    timeline: [
      {
        key: "q1-2024",
        title: "Elysian 成立",
        meta: "2024年 Q1",
        content: "以简化 UI 开发的愿景起步",
      },
      {
        key: "q3-2024",
        title: "首次 Beta 发布",
        meta: "2024年 Q3",
        content: "发布了包含 20 个组件的组件库",
      },
      {
        key: "q1-2025",
        title: "公开发布",
        meta: "2025年 Q1",
        content: "发布 v1.0，包含完整主题系统",
      },
      {
        key: "q3-2025",
        title: "企业版上线",
        meta: "2025年 Q3",
        content: "新增 RBAC、多租户和审计日志",
      },
      {
        key: "q1-2026",
        title: "AI 辅助生成",
        meta: "2026年 Q1",
        content: "集成了 Schema 驱动的代码生成",
      },
    ],
  },
}

/* ── Website Contact ──────────────────────────────────────── */

export const contactI18n = {
  en: {
    title: "Get in Touch",
    subtitle:
      "Have a question or want to learn more? We'd love to hear from you.",
    formTitle: "Send us a message",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    subjectOptions: [
      { label: "General Inquiry", value: "general" },
      { label: "Technical Support", value: "support" },
      { label: "Sales", value: "sales" },
      { label: "Partnership", value: "partnership" },
      { label: "Bug Report", value: "bug" },
    ] as ElyPublicSelectOption[],
    infoTitle: "Contact Information",
    info: [
      { key: "email", label: "Email", value: "hello@elysian.dev" },
      { key: "phone", label: "Phone", value: "+1 (555) 123-4567" },
      { key: "office", label: "Office", value: "Tokyo, Japan" },
      { key: "hours", label: "Hours", value: "Mon-Fri, 9am-6pm JST" },
    ],
    followTitle: "Follow Us",
    socials: ["Twitter / X", "GitHub", "Discord", "LinkedIn"],
  },
  zh: {
    title: "联系我们",
    subtitle: "有问题或想了解更多？期待你的来信。",
    formTitle: "发送消息",
    firstName: "名",
    lastName: "姓",
    email: "邮箱",
    subject: "主题",
    message: "消息内容",
    send: "发送消息",
    subjectOptions: [
      { label: "一般咨询", value: "general" },
      { label: "技术支持", value: "support" },
      { label: "销售", value: "sales" },
      { label: "合作", value: "partnership" },
      { label: "问题反馈", value: "bug" },
    ] as ElyPublicSelectOption[],
    infoTitle: "联系方式",
    info: [
      { key: "email", label: "邮箱", value: "hello@elysian.dev" },
      { key: "phone", label: "电话", value: "+1 (555) 123-4567" },
      { key: "office", label: "办公地点", value: "日本东京" },
      { key: "hours", label: "工作时间", value: "周一至周五 9:00-18:00 JST" },
    ],
    followTitle: "关注我们",
    socials: ["Twitter / X", "GitHub", "Discord", "LinkedIn"],
  },
}

/* ── Anime Hero Landing ──────────────────────────────────── */

export const animeHeroI18n = {
  en: {
    badge: "New Season — Limited Edition",
    heading: "Welcome to the\n<em>Elysian Collection</em>",
    description:
      "Discover curated creator collections with ceremonial elegance. Every piece tells a story worth preserving.",
    exploreBtn: "Explore collection",
    watchBtn: "Watch trailer",
    featuredBadge: "Featured Creator",
    featuredTitle: "Spring Bloom Archive",
    featuredDesc:
      "A hand-curated collection of 24 creator works celebrating the season of renewal and cherry blossoms.",
    statWorks: "Works",
    statCollectors: "Collectors",
    statRating: "Rating",
    trendingLabel: "Trending Collections",
    trendingTitle: "Curated picks from the community",
    viewAll: "View all collections",
    cards: [
      {
        title: "Midnight Aurora",
        tag: "Digital Art",
        desc: "A visual journey through light and darkness by creator Aoi.",
        stat: "340 collectors",
      },
      {
        title: "Sakura Dreams",
        tag: "Illustration",
        desc: "Delicate ink and watercolor pieces capturing spring.",
        stat: "580 collectors",
      },
      {
        title: "Neon Chronicle",
        tag: "Photography",
        desc: "City nights captured in vivid color and texture.",
        stat: "210 collectors",
      },
    ],
    ctaText:
      "Ready to create your own collection? Start building with the theme system.",
    ctaBtn: "Get started",
    // Dark mode variant
    darkBadge: "Season 02 is here",
    darkHeading: "Create worlds that <em>feel alive</em>",
    darkDesc:
      "The Elysian platform gives creators the tools to build immersive, branded experiences with ceremonial polish and anime-inspired aesthetics.",
    darkStartBtn: "Start creating",
    darkExamplesBtn: "See examples",
  },
  zh: {
    badge: "新季度 — 限量版",
    heading: "欢迎来到\n<em>Elysian 收藏馆</em>",
    description:
      "探索精心策划的创作者收藏系列，感受优雅的仪式感。每一件作品都讲述着值得珍藏的故事。",
    exploreBtn: "探索收藏",
    watchBtn: "观看预告",
    featuredBadge: "精选创作者",
    featuredTitle: "春花档案",
    featuredDesc: "一组手工策划的 24 件创作者作品，颂扬更新与樱花绽放的季节。",
    statWorks: "作品",
    statCollectors: "收藏者",
    statRating: "评分",
    trendingLabel: "热门收藏",
    trendingTitle: "社区精选推荐",
    viewAll: "查看全部收藏",
    cards: [
      {
        title: "Midnight Aurora",
        tag: "数字艺术",
        desc: "创作者 Aoi 带来的光与暗的视觉之旅。",
        stat: "340 位收藏者",
      },
      {
        title: "Sakura Dreams",
        tag: "插画",
        desc: "捕捉春日气息的精致水墨水彩作品。",
        stat: "580 位收藏者",
      },
      {
        title: "Neon Chronicle",
        tag: "摄影",
        desc: "以鲜明色彩和质感捕捉城市之夜。",
        stat: "210 位收藏者",
      },
    ],
    ctaText: "准备好创建你自己的收藏了吗？开始使用主题系统构建。",
    ctaBtn: "开始使用",
    darkBadge: "第二季度已上线",
    darkHeading: "创造<em>鲜活</em>的世界",
    darkDesc:
      "Elysian 平台为创作者提供建设沉浸式品牌体验的工具，兼具精致的仪式感和动漫风格美学。",
    darkStartBtn: "开始创作",
    darkExamplesBtn: "查看示例",
  },
}

/* ── Anime Community Forum ───────────────────────────────── */

export const animeCommunityI18n = {
  en: {
    breadcrumb: ["Home", "Community"],
    sectionLabel: "Community",
    title: "Creator forum",
    searchPlaceholder: "Search threads...",
    newThreadBtn: "New thread",
    pinnedTitle: "Pinned",
    topContributors: "Top contributors",
    recentActivity: "Recent activity",
    viewModes: [
      { key: "recent", label: "Recent", value: "recent" },
      { key: "popular", label: "Popular", value: "popular" },
      { key: "following", label: "Following", value: "following" },
    ],
    pinned: [
      {
        key: "rules",
        title: "Community Guidelines",
        content:
          "Be respectful, credit original creators, no AI-generated submissions without disclosure. Keep discussions on-topic and constructive.",
      },
      {
        key: "season2",
        title: "Season 2 Submission Rules",
        content:
          "Submissions close June 30. Max 5 entries per creator. All mediums welcome. Tag your entries with #Season2.",
      },
    ],
    threads: [
      {
        title: "Best watercolor techniques for anime-style backgrounds",
        author: "AoiArt",
        badge: "Discussion",
        replies: 24,
        views: "312",
        time: "5 min ago",
        tags: ["Watercolor", "Tutorial", "Backgrounds"],
      },
      {
        title: "Showcase: My first digital art collection",
        author: "Sakuya",
        badge: "Showcase",
        replies: 18,
        views: "245",
        time: "2 hours ago",
        tags: ["Digital Art", "Beginner"],
      },
      {
        title: "Season 2 theme predictions and wishlist",
        author: "StellarArchive",
        badge: "Discussion",
        replies: 42,
        views: "890",
        time: "6 hours ago",
        tags: ["Season 2", "Community"],
      },
      {
        title: 'How I created the "Midnight Aurora" series',
        author: "Yukina Studio",
        badge: "Creator Blog",
        replies: 31,
        views: "620",
        time: "1 day ago",
        tags: ["Process", "Behind the Scenes"],
      },
    ],
    replies: "replies",
    views: "views",
    leaderboardColumns: [
      { key: "rank", label: "#" },
      { key: "creator", label: "Creator" },
      { key: "works", label: "Works", align: "end" },
      { key: "karma", label: "Karma", align: "end" },
    ],
    timeline: [
      {
        key: "1",
        title: 'New thread: "Best watercolor techniques"',
        meta: "5 min ago",
        tone: "primary",
      },
      {
        key: "2",
        title: 'AoiArt replied to "Color theory discussion"',
        meta: "12 min ago",
        tone: "accent",
      },
      {
        key: "3",
        title: "StellarArchive reached 1,500 karma",
        meta: "1 hour ago",
        tone: "success",
      },
    ],
  },
  zh: {
    breadcrumb: ["首页", "社区"],
    sectionLabel: "社区",
    title: "创作者论坛",
    searchPlaceholder: "搜索帖子...",
    newThreadBtn: "发新帖",
    pinnedTitle: "置顶",
    topContributors: "活跃贡献者",
    recentActivity: "最近动态",
    viewModes: [
      { key: "recent", label: "最新", value: "recent" },
      { key: "popular", label: "热门", value: "popular" },
      { key: "following", label: "关注", value: "following" },
    ],
    pinned: [
      {
        key: "rules",
        title: "社区准则",
        content:
          "尊重他人、注明原创作者、AI 生成作品需声明。保持讨论切题且建设性。",
      },
      {
        key: "season2",
        title: "第二季度投稿规则",
        content:
          "投稿截止 6 月 30 日。每位创作者最多 5 件作品。所有媒介欢迎。请标记 #Season2。",
      },
    ],
    threads: [
      {
        title: "动漫风格背景的最佳水彩技法",
        author: "AoiArt",
        badge: "讨论",
        replies: 24,
        views: "312",
        time: "5 分钟前",
        tags: ["水彩", "教程", "背景"],
      },
      {
        title: "展示：我的第一个数字艺术收藏",
        author: "Sakuya",
        badge: "展示",
        replies: 18,
        views: "245",
        time: "2 小时前",
        tags: ["数字艺术", "新手"],
      },
      {
        title: "第二季度主题预测与愿望清单",
        author: "StellarArchive",
        badge: "讨论",
        replies: 42,
        views: "890",
        time: "6 小时前",
        tags: ["第二季度", "社区"],
      },
      {
        title: '我如何创作了 "Midnight Aurora" 系列',
        author: "Yukina Studio",
        badge: "创作者博客",
        replies: 31,
        views: "620",
        time: "1 天前",
        tags: ["创作过程", "幕后"],
      },
    ],
    replies: "回复",
    views: "浏览",
    leaderboardColumns: [
      { key: "rank", label: "#" },
      { key: "creator", label: "创作者" },
      { key: "works", label: "作品", align: "end" },
      { key: "karma", label: "声望", align: "end" },
    ],
    timeline: [
      {
        key: "1",
        title: '新帖子："最佳水彩技法"',
        meta: "5 分钟前",
        tone: "primary",
      },
      {
        key: "2",
        title: 'AoiArt 回复了"色彩理论讨论"',
        meta: "12 分钟前",
        tone: "accent",
      },
      {
        key: "3",
        title: "StellarArchive 达到 1,500 声望",
        meta: "1 小时前",
        tone: "success",
      },
    ],
  },
}

/* ── Anime Creator Dashboard ─────────────────────────────── */

export const animeCreatorI18n = {
  en: {
    profileName: "Yukina Studio",
    profileRole: "Creator · Illustrator · Collector",
    seasonBadge: "Season 2 Creator",
    followBtn: "Follow",
    messageBtn: "Message",
    statWorks: "Works",
    statFollowers: "Followers",
    statFollowing: "Following",
    seasonProgress: "Season progress",
    collectionCompletion: "Collection completion",
    communityRating: "Community rating",
    achievements: "Achievements",
    achievementItems: [
      { icon: "First", label: "Debut" },
      { icon: "10", label: "10 Works" },
      { icon: "Star", label: "Top Rated" },
      { icon: "Crown", label: "Featured" },
    ],
    tabs: [
      { key: "works", label: "Works", description: "Published creations" },
      { key: "favorites", label: "Favorites", description: "Collected pieces" },
      { key: "activity", label: "Activity", description: "Recent actions" },
    ],
    recentWorks: "Recent works",
    viewAll: "View all",
    works: [
      { title: "Twilight Bloom", tag: "Illustration" },
      { title: "Ocean Memory", tag: "Watercolor" },
      { title: "Silent Garden", tag: "Digital Art" },
      { title: "Crystal Dawn", tag: "3D Render" },
      { title: "Paper Crane", tag: "Origami" },
      { title: "Moonlit Path", tag: "Photography" },
    ],
    activityFeed: "Activity feed",
    activities: [
      {
        text: 'Published "Twilight Bloom" to Spring Archive',
        time: "2 hours ago",
      },
      { text: "Received a new follower: StellarArchive", time: "5 hours ago" },
      {
        text: 'Collection "Midnight Aurora" reached 300 collectors',
        time: "1 day ago",
      },
      { text: 'Earned the "Featured" achievement', time: "3 days ago" },
    ],
  },
  zh: {
    profileName: "Yukina Studio",
    profileRole: "创作者 · 插画师 · 收藏家",
    seasonBadge: "第二季度创作者",
    followBtn: "关注",
    messageBtn: "私信",
    statWorks: "作品",
    statFollowers: "关注者",
    statFollowing: "关注中",
    seasonProgress: "季度进度",
    collectionCompletion: "收藏完成度",
    communityRating: "社区评分",
    achievements: "成就",
    achievementItems: [
      { icon: "首次", label: "出道" },
      { icon: "10", label: "10 件作品" },
      { icon: "之星", label: "最高评分" },
      { icon: "皇冠", label: "精选" },
    ],
    tabs: [
      { key: "works", label: "作品", description: "已发布的创作" },
      { key: "favorites", label: "收藏", description: "收藏的作品" },
      { key: "activity", label: "动态", description: "最近操作" },
    ],
    recentWorks: "最近作品",
    viewAll: "查看全部",
    works: [
      { title: "Twilight Bloom", tag: "插画" },
      { title: "Ocean Memory", tag: "水彩" },
      { title: "Silent Garden", tag: "数字艺术" },
      { title: "Crystal Dawn", tag: "3D 渲染" },
      { title: "Paper Crane", tag: "折纸" },
      { title: "Moonlit Path", tag: "摄影" },
    ],
    activityFeed: "动态",
    activities: [
      { text: '将 "Twilight Bloom" 发布到春季档案', time: "2 小时前" },
      { text: "收到新的关注者：StellarArchive", time: "5 小时前" },
      { text: '收藏系列 "Midnight Aurora" 达到 300 位收藏者', time: "1 天前" },
      { text: '获得了 "精选" 成就', time: "3 天前" },
    ],
  },
}

/* ── Anime Event Campaign ────────────────────────────────── */

export const animeEventI18n = {
  en: {
    badge: "Limited Time Event",
    heading: "Dreamy Sakura\nCollection Drop",
    description:
      "An exclusive seasonal collection featuring 12 limited-edition creator works. Each piece captures the fleeting beauty of cherry blossom season.",
    reserveBtn: "Reserve your spot",
    learnBtn: "Learn more",
    startsIn: "Event starts in",
    days: "Days",
    hours: "Hours",
    mins: "Mins",
    spotsLabel: "/ 1,000 spots",
    claimed: "85% claimed",
    tierLabel: "Reward tiers",
    tierTitle: "Choose your collection tier",
    tiers: [
      {
        badge: "Starter",
        price: "Free",
        features: [
          "Browse all 12 works",
          "Community gallery access",
          "Creator profiles",
        ],
        cta: "Join free",
      },
      {
        badge: "Collector",
        badgeAlt: "Popular",
        price: "2,400",
        priceUnit: "stars",
        features: [
          "Collect up to 6 works",
          "Exclusive creator commentary",
          "Early access to future drops",
          "Collector badge on profile",
        ],
        cta: "Reserve collector tier",
      },
      {
        badge: "Patron",
        price: "6,000",
        priceUnit: "stars",
        features: [
          "Collect all 12 works",
          "Signed digital prints",
          "Private creator Q&A access",
          "Patron-exclusive variant covers",
          "Lifetime season access",
        ],
        cta: "Reserve patron tier",
      },
    ],
    featuredLabel: "Featured works",
    featuredTitle: "Preview the collection",
    works: [
      {
        title: "First Light",
        tag: "Illustration",
        desc: "Dawn breaks over the petal bridge.",
      },
      {
        title: "Quiet Garden",
        tag: "Watercolor",
        desc: "A peaceful corner in the bamboo grove.",
      },
      {
        title: "Lantern Festival",
        tag: "Digital Art",
        desc: "Floating lights on the evening river.",
      },
      {
        title: "Winter Bloom",
        tag: "Photography",
        desc: "An unexpected flower in the snow.",
      },
    ],
    footerText: "Questions about the event? Check the FAQ or contact support.",
    faqBtn: "View FAQ",
    contactLink: "Contact support",
    // Dark mode
    darkBadge: "Season Finale",
    darkHeading: "The Grand Archive Opens",
    darkDesc:
      "After two seasons of creator works, the grand archive unlocks every piece in one ceremonial collection. Only patrons who complete the season journey get permanent access.",
    darkBtn: "Enter the archive",
    darkDay: "Day",
    darkStats: [
      { value: "48", label: "Total works" },
      { value: "12", label: "Featured creators" },
      { value: "3.2k", label: "Patrons waiting" },
    ],
  },
  zh: {
    badge: "限时活动",
    heading: "梦幻樱花\n收藏系列发布",
    description:
      "一组独家季节性收藏，包含 12 件限量版创作者作品。每件作品都捕捉了樱花季转瞬即逝的美丽。",
    reserveBtn: "预约名额",
    learnBtn: "了解更多",
    startsIn: "活动倒计时",
    days: "天",
    hours: "时",
    mins: "分",
    spotsLabel: "/ 1,000 个名额",
    claimed: "已预约 85%",
    tierLabel: "奖励等级",
    tierTitle: "选择你的收藏等级",
    tiers: [
      {
        badge: "入门",
        price: "免费",
        features: ["浏览全部 12 件作品", "社区画廊访问", "创作者主页"],
        cta: "免费加入",
      },
      {
        badge: "收藏家",
        badgeAlt: "热门",
        price: "2,400",
        priceUnit: "星币",
        features: [
          "收藏最多 6 件作品",
          "独家创作者点评",
          "未来发布优先访问",
          "个人主页收藏家徽章",
        ],
        cta: "预约收藏家等级",
      },
      {
        badge: "赞助者",
        price: "6,000",
        priceUnit: "星币",
        features: [
          "收藏全部 12 件作品",
          "签名数字印刷",
          "私密创作者问答",
          "赞助者专属变体封面",
          "终身季度访问",
        ],
        cta: "预约赞助者等级",
      },
    ],
    featuredLabel: "精选作品",
    featuredTitle: "预览收藏系列",
    works: [
      { title: "First Light", tag: "插画", desc: "黎明洒落在花瓣桥上。" },
      { title: "Quiet Garden", tag: "水彩", desc: "竹林中一处宁静的角落。" },
      {
        title: "Lantern Festival",
        tag: "数字艺术",
        desc: "夜晚河面上漂浮的灯火。",
      },
      { title: "Winter Bloom", tag: "摄影", desc: "雪中一朵意外的花。" },
    ],
    footerText: "对活动有疑问？查看常见问题或联系客服。",
    faqBtn: "查看常见问题",
    contactLink: "联系客服",
    darkBadge: "季度终章",
    darkHeading: "大档案馆开放",
    darkDesc:
      "经过两个季度的创作者作品积累，大档案馆以一场庄严的收藏仪式解锁所有作品。只有完成季度旅程的赞助者才能获得永久访问权限。",
    darkBtn: "进入档案馆",
    darkDay: "天",
    darkStats: [
      { value: "48", label: "总作品数" },
      { value: "12", label: "精选创作者" },
      { value: "3.2k", label: "等待中的赞助者" },
    ],
  },
}

/* ── Anime Gallery ───────────────────────────────────────── */

export const animeGalleryI18n = {
  en: {
    sectionLabel: "Creator collections",
    title: "Browse curated works",
    searchPlaceholder: "Search collections...",
    loadMore: "Load more collections",
    featured: "Featured",
    view: "View",
    filters: [
      "All",
      "Digital Art",
      "Illustration",
      "Photography",
      "3D Render",
      "Craft",
      "Pixel Art",
    ],
    collections: [
      {
        title: "Midnight Aurora",
        tag: "Digital Art",
        desc: "A visual journey through light and darkness.",
        collectors: "340 collectors",
      },
      {
        title: "Sakura Dreams",
        tag: "Illustration",
        desc: "Delicate ink and watercolor pieces capturing spring.",
        collectors: "580 collectors",
      },
      {
        title: "Neon Chronicle",
        tag: "Photography",
        desc: "City nights captured in vivid color and texture.",
        collectors: "210 collectors",
      },
      {
        title: "Stellar Archive",
        tag: "3D Render",
        desc: "Cosmic scenes rendered with volumetric light.",
        collectors: "425 collectors",
      },
      {
        title: "Ceramic Garden",
        tag: "Craft",
        desc: "Handmade pottery with organic glazing techniques.",
        collectors: "190 collectors",
      },
      {
        title: "Pixel Memoir",
        tag: "Pixel Art",
        desc: "Retro-inspired scenes with modern composition.",
        collectors: "310 collectors",
      },
    ],
    // Character showcase
    charLabel: "Character roster",
    charTitle: "Meet the cast",
    characters: [
      { name: "Aoi", role: "Protagonist", element: "Water" },
      { name: "Hikari", role: "Guide", element: "Light" },
      { name: "Ren", role: "Rival", element: "Fire" },
      { name: "Sakuya", role: "Ally", element: "Wind" },
      { name: "Yuki", role: "Mentor", element: "Ice" },
      { name: "Kuro", role: "Shadow", element: "Void" },
      { name: "Mei", role: "Healer", element: "Earth" },
      { name: "Sora", role: "Wanderer", element: "Sky" },
    ],
  },
  zh: {
    sectionLabel: "创作者收藏",
    title: "浏览精选作品",
    searchPlaceholder: "搜索收藏...",
    loadMore: "加载更多收藏",
    featured: "精选",
    view: "查看",
    filters: [
      "全部",
      "数字艺术",
      "插画",
      "摄影",
      "3D 渲染",
      "手工艺",
      "像素艺术",
    ],
    collections: [
      {
        title: "Midnight Aurora",
        tag: "数字艺术",
        desc: "一场穿越光与暗的视觉之旅。",
        collectors: "340 位收藏者",
      },
      {
        title: "Sakura Dreams",
        tag: "插画",
        desc: "捕捉春日气息的精致水墨水彩作品。",
        collectors: "580 位收藏者",
      },
      {
        title: "Neon Chronicle",
        tag: "摄影",
        desc: "以鲜明色彩和质感捕捉城市之夜。",
        collectors: "210 位收藏者",
      },
      {
        title: "Stellar Archive",
        tag: "3D 渲染",
        desc: "体积光渲染的宇宙场景。",
        collectors: "425 位收藏者",
      },
      {
        title: "Ceramic Garden",
        tag: "手工艺",
        desc: "采用有机釉技法的手工陶艺。",
        collectors: "190 位收藏者",
      },
      {
        title: "Pixel Memoir",
        tag: "像素艺术",
        desc: "复古灵感与现代构图结合的场景。",
        collectors: "310 位收藏者",
      },
    ],
    charLabel: "角色图鉴",
    charTitle: "认识角色阵容",
    characters: [
      { name: "Aoi", role: "主角", element: "水" },
      { name: "Hikari", role: "向导", element: "光" },
      { name: "Ren", role: "劲敌", element: "火" },
      { name: "Sakuya", role: "盟友", element: "风" },
      { name: "Yuki", role: "导师", element: "冰" },
      { name: "Kuro", role: "暗影", element: "虚空" },
      { name: "Mei", role: "治愈者", element: "地" },
      { name: "Sora", role: "旅人", element: "天" },
    ],
  },
}

/* ── Anime Work Detail ───────────────────────────────────── */

export const animeWorkDetailI18n = {
  en: {
    breadcrumb: ["Home", "Collections", "Midnight Aurora"],
    activityTitle: "Activity",
    workTitle: "Midnight Aurora",
    workDesc:
      "A visual journey through light and darkness. This piece captures the ethereal beauty of aurora borealis reflected on still water at midnight.",
    badges: ["Digital Art", "Featured"],
    ratingLabel: "Rating",
    creatorRole: "Creator · Illustrator · Collector",
    followBtn: "Follow",
    detailsTitle: "Details",
    metadata: [
      { key: "medium", label: "Medium", value: "Digital Illustration" },
      { key: "dimensions", label: "Dimensions", value: "3840 × 2160 px" },
      { key: "created", label: "Created", value: "March 2026" },
      { key: "edition", label: "Edition", value: "7 of 50", tone: "accent" },
      { key: "category", label: "Category", value: "Fantasy" },
      { key: "license", label: "License", value: "Personal Use" },
    ],
    availabilityTitle: "Availability",
    editionsLabel: "Editions claimed",
    editionsHelper: "7 of 50 remaining",
    collectBtn: "Collect this work",
    moreLabel: "More from this creator",
    relatedTitle: "Related works",
    viewAll: "View all",
    relatedWorks: [
      { title: "First Light", tag: "Illustration" },
      { title: "Quiet Garden", tag: "Watercolor" },
      { title: "Lantern Festival", tag: "Digital Art" },
      { title: "Winter Bloom", tag: "Photography" },
      { title: "Crystal Dawn", tag: "3D Render" },
    ],
    timeline: [
      {
        key: "1",
        title: "Yukina Studio published this work",
        meta: "2 days ago",
        tone: "primary",
      },
      {
        key: "2",
        title: "StellarArchive collected this piece",
        meta: "1 day ago",
        tone: "accent",
      },
      {
        key: "3",
        title: "New comment from AoiArt",
        description: "Incredible use of light and shadow!",
        meta: "5 hours ago",
        tone: "success",
      },
      {
        key: "4",
        title: 'Added to "Dreamy Picks" curated list',
        meta: "3 hours ago",
        tone: "primary",
      },
    ],
  },
  zh: {
    breadcrumb: ["首页", "收藏", "Midnight Aurora"],
    activityTitle: "活动",
    workTitle: "Midnight Aurora",
    workDesc:
      "一场穿越光与暗的视觉之旅。这件作品捕捉了午夜时分极光映照在平静水面上的空灵之美。",
    badges: ["数字艺术", "精选"],
    ratingLabel: "评分",
    creatorRole: "创作者 · 插画师 · 收藏家",
    followBtn: "关注",
    detailsTitle: "详情",
    metadata: [
      { key: "medium", label: "媒介", value: "数字插画" },
      { key: "dimensions", label: "尺寸", value: "3840 × 2160 px" },
      { key: "created", label: "创作时间", value: "2026年3月" },
      { key: "edition", label: "版本", value: "7 / 50", tone: "accent" },
      { key: "category", label: "分类", value: "奇幻" },
      { key: "license", label: "授权", value: "个人使用" },
    ],
    availabilityTitle: "可用性",
    editionsLabel: "已认领版本",
    editionsHelper: "剩余 7 / 50",
    collectBtn: "收藏此作品",
    moreLabel: "该创作者的更多作品",
    relatedTitle: "相关作品",
    viewAll: "查看全部",
    relatedWorks: [
      { title: "First Light", tag: "插画" },
      { title: "Quiet Garden", tag: "水彩" },
      { title: "Lantern Festival", tag: "数字艺术" },
      { title: "Winter Bloom", tag: "摄影" },
      { title: "Crystal Dawn", tag: "3D 渲染" },
    ],
    timeline: [
      {
        key: "1",
        title: "Yukina Studio 发布了此作品",
        meta: "2 天前",
        tone: "primary",
      },
      {
        key: "2",
        title: "StellarArchive 收藏了此作品",
        meta: "1 天前",
        tone: "accent",
      },
      {
        key: "3",
        title: "AoiArt 发表了新评论",
        description: "光影运用太出色了！",
        meta: "5 小时前",
        tone: "success",
      },
      {
        key: "4",
        title: '被添加到"梦幻精选"策划列表',
        meta: "3 小时前",
        tone: "primary",
      },
    ],
  },
}

/* ── Anime Settings & Profile ────────────────────────────── */

export const animeSettingsI18n = {
  en: {
    pageTitle: "Settings",
    navSections: [
      { key: "profile", label: "Profile" },
      { key: "appearance", label: "Appearance" },
      { key: "notifications", label: "Notifications" },
      { key: "account", label: "Account" },
    ],
    profileSection: "Profile",
    changeAvatar: "Change avatar",
    avatarHint: "JPG, PNG or GIF. Max 2 MB.",
    personalInfo: "Personal information",
    displayName: "Display name",
    email: "Email",
    bio: "Bio",
    language: "Language",
    timezone: "Timezone",
    appearanceSection: "Appearance",
    themeLabel: "Theme",
    selectTheme: "Select theme",
    darkMode: "Dark mode",
    darkModeDesc: "Use dark color scheme across the platform",
    contentDensity: "Content density",
    densityDesc: "Adjust spacing and compactness",
    notificationsSection: "Notifications",
    notifPrefs: "Notification preferences",
    emailNotifs: "Email notifications",
    emailNotifsDesc: "Receive updates via email",
    pushNotifs: "Push notifications",
    pushNotifsDesc: "Browser push alerts for new activity",
    weeklyDigest: "Weekly digest",
    weeklyDigestDesc: "Get a summary of community activity every Monday",
    accountSection: "Account",
    publicProfile: "Public profile",
    publicProfileDesc: "Allow others to see your profile and collections",
    cancelBtn: "Cancel",
    saveBtn: "Save changes",
    themeOptions: [
      { key: "default", label: "Elysian Default", value: "elysian-default" },
      { key: "rose", label: "Rose Nocturne", value: "rose-nocturne" },
      { key: "azure", label: "Azure Aria", value: "azure-aria" },
      { key: "enterprise", label: "Enterprise Calm", value: "enterprise-calm" },
      { key: "sakura", label: "Dreamy Sakura", value: "dreamy-sakura" },
    ],
    languageOptions: [
      { label: "English", value: "en" },
      { label: "Japanese", value: "ja" },
      { label: "Chinese (Simplified)", value: "zh" },
      { label: "Korean", value: "ko" },
    ],
    timezoneOptions: [
      { label: "UTC+9 (JST)", value: "asia-tokyo" },
      { label: "UTC+8 (CST)", value: "asia-shanghai" },
      { label: "UTC-5 (EST)", value: "us-eastern" },
      { label: "UTC-8 (PST)", value: "us-pacific" },
    ],
    accountItems: [
      { key: "member", label: "Member since", value: "January 2026" },
      { key: "plan", label: "Plan", value: "Collector Pro", tone: "accent" },
      { key: "id", label: "Account ID", value: "ELY-2026-04821" },
      { key: "storage", label: "Storage used", value: "2.4 GB of 10 GB" },
    ],
  },
  zh: {
    pageTitle: "设置",
    navSections: [
      { key: "profile", label: "个人资料" },
      { key: "appearance", label: "外观" },
      { key: "notifications", label: "通知" },
      { key: "account", label: "账户" },
    ],
    profileSection: "个人资料",
    changeAvatar: "更换头像",
    avatarHint: "JPG、PNG 或 GIF，最大 2 MB。",
    personalInfo: "个人信息",
    displayName: "显示名称",
    email: "邮箱",
    bio: "简介",
    language: "语言",
    timezone: "时区",
    appearanceSection: "外观",
    themeLabel: "主题",
    selectTheme: "选择主题",
    darkMode: "暗色模式",
    darkModeDesc: "在全平台使用暗色配色方案",
    contentDensity: "内容密度",
    densityDesc: "调整间距和紧凑程度",
    notificationsSection: "通知",
    notifPrefs: "通知偏好",
    emailNotifs: "邮件通知",
    emailNotifsDesc: "通过邮件接收更新",
    pushNotifs: "推送通知",
    pushNotifsDesc: "新活动的浏览器推送提醒",
    weeklyDigest: "每周摘要",
    weeklyDigestDesc: "每周一获取社区活动摘要",
    accountSection: "账户",
    publicProfile: "公开资料",
    publicProfileDesc: "允许他人查看你的资料和收藏",
    cancelBtn: "取消",
    saveBtn: "保存更改",
    themeOptions: [
      { key: "default", label: "Elysian 默认", value: "elysian-default" },
      { key: "rose", label: "玫瑰夜曲", value: "rose-nocturne" },
      { key: "azure", label: "蔚蓝咏叹", value: "azure-aria" },
      { key: "enterprise", label: "企业从容", value: "enterprise-calm" },
      { key: "sakura", label: "梦幻樱花", value: "dreamy-sakura" },
    ],
    languageOptions: [
      { label: "英语", value: "en" },
      { label: "日语", value: "ja" },
      { label: "简体中文", value: "zh" },
      { label: "韩语", value: "ko" },
    ],
    timezoneOptions: [
      { label: "UTC+9 日本标准时间 (JST)", value: "asia-tokyo" },
      { label: "UTC+8 中国标准时间 (CST)", value: "asia-shanghai" },
      { label: "UTC-5 美东时间 (EST)", value: "us-eastern" },
      { label: "UTC-8 美西时间 (PST)", value: "us-pacific" },
    ],
    accountItems: [
      { key: "member", label: "注册时间", value: "2026年1月" },
      { key: "plan", label: "方案", value: "收藏家专业版", tone: "accent" },
      { key: "id", label: "账户 ID", value: "ELY-2026-04821" },
      { key: "storage", label: "已用存储", value: "2.4 GB / 10 GB" },
    ],
  },
}

/* ── Website Blog List ──────────────────────────────────── */

export const websiteBlogListI18n = {
  en: {
    breadcrumb: ["Home", "Blog"],
    title: "Blog",
    subtitle: "Insights, tutorials, and updates from the team",
    searchPlaceholder: "Search articles...",
    searchLabel: "Search",
    categories: [
      { key: "all", label: "All", value: "all" },
      { key: "engineering", label: "Engineering", value: "engineering" },
      { key: "design", label: "Design", value: "design" },
      { key: "product", label: "Product", value: "product" },
    ],
    posts: [
      {
        key: "post-1",
        title: "Building Accessible Components at Scale",
        excerpt:
          "How we designed a component library that meets WCAG 2.2 AA standards across 200+ components, with automated testing baked into CI.",
        category: "engineering",
        author: "Sakura Ito",
        authorRole: "Head of Design",
        readTime: "8 min read",
        date: "May 28, 2026",
      },
      {
        key: "post-2",
        title: "Design Tokens: From Figma to Production",
        excerpt:
          "A deep dive into our design token pipeline — from Figma variables through Style Dictionary to runtime CSS custom properties.",
        category: "design",
        author: "Yuki Tanaka",
        authorRole: "Design Engineer",
        readTime: "6 min read",
        date: "May 22, 2026",
      },
      {
        key: "post-3",
        title: "Code Generation for Vue Components",
        excerpt:
          "How we built a code generator that turns component specs into type-safe Vue 3 SFCs with proper props, emits, and slot definitions.",
        category: "engineering",
        author: "Ren Hashimoto",
        authorRole: "Senior Engineer",
        readTime: "10 min read",
        date: "May 15, 2026",
      },
      {
        key: "post-4",
        title: "The Case for Gradual Theming",
        excerpt:
          "Why we chose a progressive theming strategy instead of a big-bang redesign — and how it let us ship new themes every sprint.",
        category: "product",
        author: "Mai Kimura",
        authorRole: "Product Manager",
        readTime: "5 min read",
        date: "May 8, 2026",
      },
      {
        key: "post-5",
        title: "Performance Budgets for Component Libraries",
        excerpt:
          "We set hard limits on bundle size, render time, and memory. Here's the toolchain and dashboard we built to enforce them.",
        category: "engineering",
        author: "Sakura Ito",
        authorRole: "Head of Design",
        readTime: "7 min read",
        date: "Apr 30, 2026",
      },
      {
        key: "post-6",
        title: "Color Systems That Actually Work",
        excerpt:
          "Building perceptually uniform color palettes with OKLCH, and why HSL let us down in dark mode.",
        category: "design",
        author: "Yuki Tanaka",
        authorRole: "Design Engineer",
        readTime: "9 min read",
        date: "Apr 22, 2026",
      },
    ],
    pagination: "Showing 1–6 of 24 articles",
    loadMore: "Load more",
  },
  zh: {
    breadcrumb: ["首页", "博客"],
    title: "博客",
    subtitle: "来自团队的洞察、教程与最新动态",
    searchPlaceholder: "搜索文章...",
    searchLabel: "搜索",
    categories: [
      { key: "all", label: "全部", value: "all" },
      { key: "engineering", label: "工程", value: "engineering" },
      { key: "design", label: "设计", value: "design" },
      { key: "product", label: "产品", value: "product" },
    ],
    posts: [
      {
        key: "post-1",
        title: "大规模构建无障碍组件",
        excerpt:
          "我们如何设计一套满足 WCAG 2.2 AA 标准的组件库，覆盖 200+ 组件，并将自动化测试融入 CI 流程。",
        category: "engineering",
        author: "伊藤樱",
        authorRole: "设计主管",
        readTime: "8 分钟阅读",
        date: "2026年5月28日",
      },
      {
        key: "post-2",
        title: "设计令牌：从 Figma 到生产环境",
        excerpt:
          "深入解析我们的设计令牌管线——从 Figma 变量到 Style Dictionary，再到运行时 CSS 自定义属性。",
        category: "design",
        author: "田中雪",
        authorRole: "设计工程师",
        readTime: "6 分钟阅读",
        date: "2026年5月22日",
      },
      {
        key: "post-3",
        title: "Vue 组件的代码生成实践",
        excerpt:
          "我们如何构建一个代码生成器，将组件规格转化为类型安全的 Vue 3 SFC，包含完整的 props、emits 和 slot 定义。",
        category: "engineering",
        author: "桥本莲",
        authorRole: "高级工程师",
        readTime: "10 分钟阅读",
        date: "2026年5月15日",
      },
      {
        key: "post-4",
        title: "渐进式主题化方案",
        excerpt:
          "为什么我们选择渐进式主题化策略而非全面重设计——以及它如何让我们每个冲刺周期都能发布新主题。",
        category: "product",
        author: "木村舞",
        authorRole: "产品经理",
        readTime: "5 分钟阅读",
        date: "2026年5月8日",
      },
      {
        key: "post-5",
        title: "组件库的性能预算",
        excerpt:
          "我们为打包体积、渲染时间和内存设定了硬性限制。以下是实现这些限制的工具链和仪表板。",
        category: "engineering",
        author: "伊藤樱",
        authorRole: "设计主管",
        readTime: "7 分钟阅读",
        date: "2026年4月30日",
      },
      {
        key: "post-6",
        title: "真正可用的色彩系统",
        excerpt:
          "使用 OKLCH 构建感知均匀的色彩调色板，以及为什么 HSL 在暗色模式中表现不佳。",
        category: "design",
        author: "田中雪",
        authorRole: "设计工程师",
        readTime: "9 分钟阅读",
        date: "2026年4月22日",
      },
    ],
    pagination: "显示第 1–6 篇，共 24 篇文章",
    loadMore: "加载更多",
  },
}

/* ── Website Blog Detail ────────────────────────────────── */

export const websiteBlogDetailI18n = {
  en: {
    breadcrumb: ["Home", "Blog", "Building Accessible Components at Scale"],
    title: "Building Accessible Components at Scale",
    author: "Sakura Ito",
    authorRole: "Head of Design",
    publishedDate: "May 28, 2026",
    readTime: "8 min read",
    tags: ["Accessibility", "Components", "Design Systems"],
    tableOfContents: [
      { key: "toc-1", title: "Why accessibility matters" },
      { key: "toc-2", title: "Our testing strategy" },
      { key: "toc-3", title: "Keyboard navigation patterns" },
      { key: "toc-4", title: "Screen reader compatibility" },
      { key: "toc-5", title: "Results and next steps" },
    ],
    sections: [
      {
        key: "sec-1",
        heading: "Why accessibility matters",
        content:
          "Over 1 billion people worldwide live with some form of disability. When we build inaccessible components, we exclude a significant portion of our potential users. Beyond the ethical imperative, accessibility is increasingly a legal requirement — and it benefits everyone through better design patterns.",
      },
      {
        key: "sec-2",
        heading: "Our testing strategy",
        content:
          "We adopted a three-layer testing approach: automated axe-core scans in every PR, keyboard-only manual testing for interactive components, and quarterly screen reader audits using NVDA and VoiceOver. This combination catches 95% of accessibility issues before they reach production.",
      },
      {
        key: "sec-3",
        heading: "Keyboard navigation patterns",
        content:
          "Every interactive component follows WAI-ARIA authoring practices. We use roving tabindex for composite widgets, implement proper focus trapping in modals, and ensure focus indicators are always visible. The Tab key should never get stuck.",
      },
      {
        key: "sec-4",
        heading: "Screen reader compatibility",
        content:
          "We provide meaningful aria-labels, use semantic HTML elements by default, and test with multiple screen readers. Live regions announce dynamic changes, and complex widgets include instructions via aria-describedby.",
      },
      {
        key: "sec-5",
        heading: "Results and next steps",
        content:
          "After six months, our WCAG 2.2 AA compliance rate rose from 67% to 98%. User satisfaction scores from assistive technology users increased by 40%. Next, we're tackling WCAG 2.2 AAA compliance and adding motion sensitivity support.",
      },
    ],
    relatedTitle: "Related articles",
    relatedPosts: [
      {
        key: "rel-1",
        title: "Design Tokens: From Figma to Production",
        tag: "Design",
      },
      {
        key: "rel-2",
        title: "Performance Budgets for Component Libraries",
        tag: "Engineering",
      },
      {
        key: "rel-3",
        title: "Color Systems That Actually Work",
        tag: "Design",
      },
    ],
    backToBlog: "Back to Blog",
  },
  zh: {
    breadcrumb: ["首页", "博客", "大规模构建无障碍组件"],
    title: "大规模构建无障碍组件",
    author: "伊藤樱",
    authorRole: "设计主管",
    publishedDate: "2026年5月28日",
    readTime: "8 分钟阅读",
    tags: ["无障碍", "组件", "设计系统"],
    tableOfContents: [
      { key: "toc-1", title: "为什么无障碍很重要" },
      { key: "toc-2", title: "我们的测试策略" },
      { key: "toc-3", title: "键盘导航模式" },
      { key: "toc-4", title: "屏幕阅读器兼容性" },
      { key: "toc-5", title: "成果与下一步" },
    ],
    sections: [
      {
        key: "sec-1",
        heading: "为什么无障碍很重要",
        content:
          "全球有超过 10 亿人生活在某种形式的残疾中。当我们构建不可访问的组件时，就排除了很大一部分潜在用户。除了道德义务之外，无障碍正日益成为法律要求——并且它通过更好的设计模式惠及所有用户。",
      },
      {
        key: "sec-2",
        heading: "我们的测试策略",
        content:
          "我们采用了三层测试方法：每个 PR 中运行自动化 axe-core 扫描，对交互组件进行纯键盘手动测试，以及使用 NVDA 和 VoiceOver 进行季度屏幕阅读器审计。这种组合能在问题进入生产环境之前捕获 95% 的无障碍问题。",
      },
      {
        key: "sec-3",
        heading: "键盘导航模式",
        content:
          "每个交互组件都遵循 WAI-ARIA 创作实践。我们在复合小部件中使用轮播 tabindex，在模态框中实现正确的焦点捕获，并确保焦点指示器始终可见。Tab 键不应该卡住。",
      },
      {
        key: "sec-4",
        heading: "屏幕阅读器兼容性",
        content:
          "我们提供有意义的 aria-labels，默认使用语义化 HTML 元素，并使用多种屏幕阅读器进行测试。实时区域会播报动态变化，复杂小部件通过 aria-describedby 包含使用说明。",
      },
      {
        key: "sec-5",
        heading: "成果与下一步",
        content:
          "六个月后，我们的 WCAG 2.2 AA 合规率从 67% 提升到 98%。辅助技术用户的满意度得分提高了 40%。下一步，我们将追求 WCAG 2.2 AAA 合规并添加动效敏感度支持。",
      },
    ],
    relatedTitle: "相关文章",
    relatedPosts: [
      { key: "rel-1", title: "设计令牌：从 Figma 到生产环境", tag: "设计" },
      { key: "rel-2", title: "组件库的性能预算", tag: "工程" },
      { key: "rel-3", title: "真正可用的色彩系统", tag: "设计" },
    ],
    backToBlog: "返回博客",
  },
}

/* ── Website FAQ ────────────────────────────────────────── */

export const websiteFAI18n = {
  en: {
    breadcrumb: ["Home", "FAQ"],
    title: "Frequently Asked Questions",
    subtitle:
      "Find answers to common questions about our products and services",
    searchPlaceholder: "Search questions...",
    searchLabel: "Search FAQ",
    categories: [
      { key: "all", label: "All", value: "all" },
      { key: "general", label: "General", value: "general" },
      { key: "billing", label: "Billing", value: "billing" },
      { key: "technical", label: "Technical", value: "technical" },
      { key: "account", label: "Account", value: "account" },
    ],
    groups: [
      {
        key: "general",
        heading: "General",
        items: [
          {
            key: "g-1",
            question: "What is Elysian?",
            answer:
              "Elysian is a comprehensive UI component library and design system built for modern web applications. It provides 60+ production-ready components across multiple theme families, with full accessibility support and internationalization built in.",
          },
          {
            key: "g-2",
            question: "Which frameworks are supported?",
            answer:
              "We currently ship native packages for Vue 3, React, and Svelte. Each package is built from a shared design spec, ensuring visual and behavioral consistency across frameworks.",
          },
          {
            key: "g-3",
            question: "Is Elysian free to use?",
            answer:
              "Yes! The core component library is open-source under the MIT license. We also offer a Pro tier with premium templates, priority support, and advanced theming tools.",
          },
        ],
      },
      {
        key: "billing",
        heading: "Billing & Pricing",
        items: [
          {
            key: "b-1",
            question: "What payment methods do you accept?",
            answer:
              "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfer for enterprise plans. All payments are processed securely through Stripe.",
          },
          {
            key: "b-2",
            question: "Can I cancel my subscription anytime?",
            answer:
              "Absolutely. You can cancel your subscription at any time from your account settings. Your access continues until the end of the current billing period. No cancellation fees.",
          },
          {
            key: "b-3",
            question: "Do you offer discounts for teams?",
            answer:
              "Yes, we offer volume discounts for teams of 5 or more. Contact our sales team for a custom quote. Educational institutions and open-source projects qualify for special pricing.",
          },
        ],
      },
      {
        key: "technical",
        heading: "Technical",
        items: [
          {
            key: "t-1",
            question: "How do I install Elysian components?",
            answer:
              "Install the package for your framework (e.g., npm install @elysian/ui-public-vue), import the components you need, and you're ready to go. Our quick-start guide walks you through setup in under 5 minutes.",
          },
          {
            key: "t-2",
            question: "Can I customize the theme?",
            answer:
              "Elysian ships with 5 built-in theme families and a comprehensive set of CSS custom properties. You can override any token to match your brand. The Pro tier includes a visual theme builder.",
          },
          {
            key: "t-3",
            question: "Are the components accessible?",
            answer:
              "All components meet WCAG 2.2 AA standards out of the box. We follow WAI-ARIA authoring practices, support keyboard navigation, and test with major screen readers.",
          },
          {
            key: "t-4",
            question: "What's the bundle size impact?",
            answer:
              "Each component is individually tree-shakeable. A typical project using 15–20 components adds less than 35KB gzipped to the bundle. We publish size data for every release.",
          },
        ],
      },
      {
        key: "account",
        heading: "Account",
        items: [
          {
            key: "a-1",
            question: "How do I reset my password?",
            answer:
              "Click 'Forgot password' on the login page and enter your email address. You'll receive a reset link within 2 minutes. The link expires after 1 hour for security.",
          },
          {
            key: "a-2",
            question: "Can I change my email address?",
            answer:
              "Yes, go to Account Settings and update your email. You'll need to verify the new address before the change takes effect. Your old email will remain active for 7 days as a safety measure.",
          },
          {
            key: "a-3",
            question: "How do I delete my account?",
            answer:
              "Navigate to Account Settings and select 'Delete Account'. This action is permanent and will remove all your data. We recommend exporting your data first. Deletion is processed within 30 days.",
          },
        ],
      },
    ],
    contactTitle: "Still have questions?",
    contactDesc:
      "Can't find what you're looking for? Our support team is here to help.",
    contactBtn: "Contact Support",
  },
  zh: {
    breadcrumb: ["首页", "常见问题"],
    title: "常见问题",
    subtitle: "查找关于我们产品和服务的常见问题解答",
    searchPlaceholder: "搜索问题...",
    searchLabel: "搜索",
    categories: [
      { key: "all", label: "全部", value: "all" },
      { key: "general", label: "通用", value: "general" },
      { key: "billing", label: "账单", value: "billing" },
      { key: "technical", label: "技术", value: "technical" },
      { key: "account", label: "账户", value: "account" },
    ],
    groups: [
      {
        key: "general",
        heading: "通用问题",
        items: [
          {
            key: "g-1",
            question: "Elysian 是什么？",
            answer:
              "Elysian 是一个为现代 Web 应用构建的综合 UI 组件库和设计系统。它提供 60+ 个生产就绪的组件，涵盖多个主题系列，内置完整的无障碍支持和国际化功能。",
          },
          {
            key: "g-2",
            question: "支持哪些框架？",
            answer:
              "我们目前为 Vue 3、React 和 Svelte 提供原生包。每个包都基于共享的设计规格构建，确保跨框架的视觉和行为一致性。",
          },
          {
            key: "g-3",
            question: "Elysian 是免费的吗？",
            answer:
              "是的！核心组件库在 MIT 许可下开源。我们还提供 Pro 版本，包含高级模板、优先支持和高级主题工具。",
          },
        ],
      },
      {
        key: "billing",
        heading: "账单与定价",
        items: [
          {
            key: "b-1",
            question: "你们接受哪些支付方式？",
            answer:
              "我们接受所有主要信用卡（Visa、Mastercard、American Express）、PayPal 以及企业方案的电汇。所有付款通过 Stripe 安全处理。",
          },
          {
            key: "b-2",
            question: "我可以随时取消订阅吗？",
            answer:
              "当然可以。您可以随时从账户设置中取消订阅。您的访问权限将持续到当前计费周期结束。无取消费用。",
          },
          {
            key: "b-3",
            question: "团队有折扣吗？",
            answer:
              "有的，我们为 5 人及以上的团队提供批量折扣。请联系我们的销售团队获取定制报价。教育机构和开源项目享有特殊定价。",
          },
        ],
      },
      {
        key: "technical",
        heading: "技术问题",
        items: [
          {
            key: "t-1",
            question: "如何安装 Elysian 组件？",
            answer:
              "安装您对应框架的包（例如 npm install @elysian/ui-public-vue），导入所需组件即可使用。我们的快速入门指南可在 5 分钟内完成设置。",
          },
          {
            key: "t-2",
            question: "我可以自定义主题吗？",
            answer:
              "Elysian 提供 5 个内置主题系列和全面的 CSS 自定义属性。您可以覆盖任何令牌以匹配您的品牌。Pro 版本包含可视化主题构建器。",
          },
          {
            key: "t-3",
            question: "组件是否无障碍？",
            answer:
              "所有组件开箱即满足 WCAG 2.2 AA 标准。我们遵循 WAI-ARIA 创作实践，支持键盘导航，并使用主流屏幕阅读器进行测试。",
          },
          {
            key: "t-4",
            question: "对包体积有什么影响？",
            answer:
              "每个组件都支持独立的 tree-shaking。使用 15-20 个组件的典型项目会增加不到 35KB（gzip 压缩后）。我们在每次发布时公布体积数据。",
          },
        ],
      },
      {
        key: "account",
        heading: "账户问题",
        items: [
          {
            key: "a-1",
            question: "如何重置密码？",
            answer:
              "在登录页面点击「忘记密码」并输入您的邮箱地址。您将在 2 分钟内收到重置链接。出于安全考虑，链接在 1 小时后过期。",
          },
          {
            key: "a-2",
            question: "可以更改邮箱地址吗？",
            answer:
              "可以，进入账户设置更新您的邮箱。您需要验证新地址，更改才会生效。旧邮箱将保留 7 天作为安全措施。",
          },
          {
            key: "a-3",
            question: "如何删除账户？",
            answer:
              "进入账户设置并选择「删除账户」。此操作是永久性的，将删除您的所有数据。我们建议您先导出数据。删除将在 30 天内完成。",
          },
        ],
      },
    ],
    contactTitle: "还有疑问？",
    contactDesc: "找不到您要找的内容？我们的支持团队随时为您提供帮助。",
    contactBtn: "联系支持",
  },
}

/* ── Website Team ───────────────────────────────────────── */

export const websiteTeamI18n = {
  en: {
    breadcrumb: ["Home", "Team"],
    title: "Meet the Team",
    subtitle: "The people building the future of UI development",
    departmentFilter: [
      { key: "all", label: "All", value: "all" },
      { key: "engineering", label: "Engineering", value: "engineering" },
      { key: "design", label: "Design", value: "design" },
      { key: "product", label: "Product", value: "product" },
    ],
    stats: [
      { value: "32", label: "Team members" },
      { value: "5", label: "Countries" },
      { value: "63", label: "Components" },
      { value: "4.9", label: "Satisfaction" },
    ],
    members: [
      {
        key: "mem-1",
        name: "Sakura Ito",
        role: "Head of Design",
        department: "design",
        bio: "Leading design system architecture with 10+ years in accessible UI design.",
      },
      {
        key: "mem-2",
        name: "Yuki Tanaka",
        role: "Design Engineer",
        department: "design",
        bio: "Bridging design and code — tokens, theming, and component APIs.",
      },
      {
        key: "mem-3",
        name: "Ren Hashimoto",
        role: "Senior Engineer",
        department: "engineering",
        bio: "Core framework architect specializing in render performance and tree-shaking.",
      },
      {
        key: "mem-4",
        name: "Mai Kimura",
        role: "Product Manager",
        department: "product",
        bio: "Driving product strategy with data-informed decisions and user research.",
      },
      {
        key: "mem-5",
        name: "Kai Yamamoto",
        role: "Frontend Engineer",
        department: "engineering",
        bio: "Building interactive components with a focus on animation and motion design.",
      },
      {
        key: "mem-6",
        name: "Hana Sato",
        role: "UX Designer",
        department: "design",
        bio: "Crafting intuitive user flows through research-driven interaction design.",
      },
      {
        key: "mem-7",
        name: "Riku Watanabe",
        role: "DevOps Engineer",
        department: "engineering",
        bio: "Managing CI/CD pipelines, automated testing infrastructure, and releases.",
      },
      {
        key: "mem-8",
        name: "Aoi Nakamura",
        role: "Technical Writer",
        department: "product",
        bio: "Translating complex technical concepts into clear, actionable documentation.",
      },
    ],
  },
  zh: {
    breadcrumb: ["首页", "团队"],
    title: "认识团队",
    subtitle: "正在构建 UI 开发未来的人们",
    departmentFilter: [
      { key: "all", label: "全部", value: "all" },
      { key: "engineering", label: "工程", value: "engineering" },
      { key: "design", label: "设计", value: "design" },
      { key: "product", label: "产品", value: "product" },
    ],
    stats: [
      { value: "32", label: "团队成员" },
      { value: "5", label: "国家" },
      { value: "63", label: "组件" },
      { value: "4.9", label: "满意度" },
    ],
    members: [
      {
        key: "mem-1",
        name: "伊藤樱",
        role: "设计主管",
        department: "design",
        bio: "领导设计系统架构，拥有 10 年以上无障碍 UI 设计经验。",
      },
      {
        key: "mem-2",
        name: "田中雪",
        role: "设计工程师",
        department: "design",
        bio: "连接设计与代码——令牌、主题和组件 API。",
      },
      {
        key: "mem-3",
        name: "桥本莲",
        role: "高级工程师",
        department: "engineering",
        bio: "核心框架架构师，专注于渲染性能和 tree-shaking。",
      },
      {
        key: "mem-4",
        name: "木村舞",
        role: "产品经理",
        department: "product",
        bio: "以数据驱动决策和用户研究推动产品战略。",
      },
      {
        key: "mem-5",
        name: "山本魁",
        role: "前端工程师",
        department: "engineering",
        bio: "构建交互组件，专注于动画和动效设计。",
      },
      {
        key: "mem-6",
        name: "佐藤花",
        role: "UX 设计师",
        department: "design",
        bio: "通过研究驱动的交互设计打造直觉化的用户流程。",
      },
      {
        key: "mem-7",
        name: "渡边陆",
        role: "DevOps 工程师",
        department: "engineering",
        bio: "管理 CI/CD 流水线、自动化测试基础设施和发布流程。",
      },
      {
        key: "mem-8",
        name: "中村葵",
        role: "技术文档工程师",
        department: "product",
        bio: "将复杂的技术概念转化为清晰、可操作的文档。",
      },
    ],
  },
}

/* ── Website Error 404 ──────────────────────────────────── */

export const websiteError404I18n = {
  en: {
    title: "Page not found",
    subtitle:
      "The page you're looking for doesn't exist or has been moved. Try searching or head back to the homepage.",
    searchPlaceholder: "Search for a page...",
    searchLabel: "Search",
    popularLinksTitle: "Popular pages",
    popularLinks: ["Home", "Blog", "Pricing", "Documentation", "Contact"],
    goHome: "Go Home",
    goBack: "Go Back",
  },
  zh: {
    title: "页面未找到",
    subtitle: "您访问的页面不存在或已被移动。请尝试搜索或返回首页。",
    searchPlaceholder: "搜索页面...",
    searchLabel: "搜索",
    popularLinksTitle: "热门页面",
    popularLinks: ["首页", "博客", "定价", "文档", "联系我们"],
    goHome: "返回首页",
    goBack: "返回上页",
  },
}
