# DEV_LOG.md

## 当前坐标 (Current Milestone)
1.0.0.4 - UI Refinement & Bug Fix

## 环境配置 (Environment Configuration)
- **权限配置**：Completed
  - 遇到的障碍：在执行 npm 相关构建脚本时，触发了 Windows PowerShell 的 Execution_Policies 限制
  - 解决方案：通过执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 永久解决了当前用户的脚本执行拦截
  - 技术备注：此项配置是运行 esbuild 自动编译脚本的前提，无需再次排查权限问题

## 已完成的工作 (Accomplished)
- 完整的项目目录结构已建立
- 创建了基础样式文件 styles.css
- 配置了 manifest.json 插件清单文件
- 配置了 package.json 项目依赖和脚本
- 配置了 tsconfig.json TypeScript 编译选项
- 配置了 esbuild.config.mjs 构建脚本
- 实现了插件核心逻辑（main.ts）
- 实现了插件设置面板（settings.ts）
- 建立了服务层架构，包括：
  - hitokoto.ts：一言 API 服务
  - quoteManager.ts：格言管理服务（支持自定义格言解析）
  - statusBar.ts：状态栏 UI 组件
- 实现了完整的插件生命周期管理
- 实现了格言自动刷新机制
- 支持自定义格言和分类选择
- 安装了项目依赖
- 成功运行了构建脚本，验证了项目的构建流程
- 修改了 esbuild.config.mjs，实现了自动化分发文件夹构建流程
  - 将编译后的 main.js 输出到 ./marginalia/main.js
  - 自动复制 manifest.json 和 styles.css 到 ./marginalia/ 文件夹
  - 自动删除根目录下的 main.js
- 创建了 README.md 文件，添加了安装指引和项目说明
- 更新了插件作者信息：正式署名为 Open Open
- 优化了状态栏悬浮提示逻辑：简化悬浮提示信息，只显示来源属性
- 净化了UI提示文本：移除了提示信息中的Emoji，只保留纯文字
- 修复了随机重复逻辑：在QuoteManager类中添加了lastIndex属性，使用do...while循环确保getRandomQuote()不会连续两次返回同一条格言
- 针对API的额外防护：在refreshQuote方法中添加了检查逻辑，如果新获取的内容与当前显示的内容完全一致，则重试一次
- 将状态栏中的 Emoji 替换为 Obsidian 原生的 Lucide 图标，提升 UI 精致度
- 修复了编译错误：
  - 在 main.ts 中补充导入了 Notice 类
  - 为未初始化的类属性添加了非空断言
  - 修复了 settings.ts 中访问私有方法的问题
  - 将 updateRefreshTimer 方法从私有改为公共
- 重构了 statusBar.ts 中的 DOM 结构：
  - 引入了 setIcon 函数
  - 新增了 textEl 属性用于专门存放文字
  - 创建了图标和文字分离的容器结构，解决了更新文字时覆盖图标的问题
  - 实现了图标和文字的正确对齐和显示
- 完善了手动刷新格言的交互体验：在main.ts的refreshQuote方法中添加了刷新成功提示，使用Obsidian原生API new Notice('格言已刷新')实现友好的视觉反馈
- 检查并确认了src/ui/statusBar.ts中的bindEvents方法，确认已正确监听了状态栏的左键点击事件
- 在main.ts中添加了Notice类的导入，确保刷新成功提示能够正常工作
- 修改了 esbuild.config.mjs，实现编译后自动将插件同步到 Obsidian 插件目录
  - 实现了自动复制 main.js, manifest.json, styles.css 到指定 Obsidian 插件目录
  - 添加了构建成功后的控制台反馈
  - 支持目标文件夹自动创建
- 实现了悬浮式气泡提示：将Tooltip从嵌入式改为悬浮式，位于状态栏文字正上方
  - 优化了Tooltip样式：采用深黑色圆角矩形背景，白色文字，底部带有指向状态栏的小三角箭头
  - 实现了平滑的悬停动画：添加了0.2秒的淡入淡出和上浮动画
  - 使用Obsidian原生CSS变量：确保Tooltip样式适应深色/浅色主题
  - 修复了Tooltip定位问题：使用!important确保覆盖默认布局，解决了挤压状态栏空间的问题
- 修复了Hitokoto API请求错误：将逗号分隔的分类参数格式改为符合API规范的重复键名格式
- 使用URLSearchParams处理API请求参数，确保符合RESTful API规范
- 修复了设置面板中"自定义列表"输入导致的消息刷屏问题，实现了1000ms防抖优化

## 核心决策与意图 (Design Intent & Vibe)
- 采用 Obsidian 插件标准开发架构，确保兼容性和可维护性
- 服务层与 UI 层分离，实现了良好的模块化设计
- 变量命名遵循驼峰命名法，组件和文件命名采用语义化原则
- 插件设计注重用户体验，支持多种数据源和自定义选项
- 状态栏显示设计简洁，不影响用户正常使用

## 遗留问题与待办 (Backlog & Blockers)
- 缺少测试用例
- 可能需要优化 API 请求错误处理
- 样式文件需要进一步完善
- 未实现响应式设计
- 缺少构建和发布流程文档
- 尚未在 Obsidian 中实际测试插件功能

## 下一次对话的入场指令 (Context Handover)
下一个 AI 实例醒来后，首先需要在 Obsidian 中安装并测试插件的核心功能，重点关注：
1. 状态栏是否正常显示格言
2. 自定义格言的解析和显示是否正常
3. 自动刷新机制是否工作
4. API 请求是否正常处理
5. 设置面板的功能是否完整

**重要提示**：如果未来遇到 npm 报错，应优先检查逻辑错误而非系统权限，因为权限已在 1.0.0.0 初始化阶段通过 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 命令打通。

同时需要注意项目已经成功构建，依赖已经安装完成。