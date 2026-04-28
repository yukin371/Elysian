# MODULE

## 模块职责

- `apps/example-uniapp` 负责 `uniapp` 首轮示例应用装配。
- 当前 owner 包含：
  - `uniapp` 应用入口与页面注册
  - 首轮 `H5` 骨架与基础页面占位
  - 本地 `auth / session / notifications` 骨架落点
  - 首轮运行时最小目录结构
- 不拥有：
  - server / persistence / auth 业务规则
  - shared package 级 UI / state / adapter owner
  - `packages/*` 的通用协议与预设实现

## 当前边界

- 首轮只允许在 `apps/example-uniapp/src/pages/*`、`src/app/*`、`src/lib/*`、`src/components/*` 内收口代码。
- 不新增 `packages/frontend-uniapp`。
- 不新增 `src/shared/`、`src/utils/` 这类无边界桶目录。
- 不把后台工作区、workflow、generator 或多端平台适配提前带入本模块。

## 展示规则

- 触及 `apps/example-uniapp` 展示层时，先读 [packages/ui-enterprise-vue/DESIGN.md](/E:/Github/Elysian/packages/ui-enterprise-vue/DESIGN.md) 与 [apps/example-uniapp/DESIGN.md](/E:/Github/Elysian/apps/example-uniapp/DESIGN.md)。
- `uniapp` 页面必须沿用共享企业预设的主色、圆角、边框和层级规则，不自行扩出第二套视觉语言。
- 默认可见文案必须使用产品化中文表达，不保留 `骨架`、`占位`、`demo only`、`后续接入` 这类研发态措辞。
- 页面容器默认复用 `src/components/common/ShellPanel.vue` 的面板语义；若需要新增展示容器，先证明现有面板和浅底分组不能满足。

## 当前阶段说明

- 当前仅落最小骨架，用于验证工作区接线、`uniapp` Vite 入口和 `H5` 构建。
- 认证、通知和个人中心业务逻辑仍处于后续 `P1/P2` 待接入阶段。
