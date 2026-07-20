# 项目文档索引

这里集中放置项目说明、功能设计、问题修复记录和历史归档。根目录尽量只保留项目运行所需文件，详细背景文档统一进入 `docs/`。

## 当前项目

| 文档 | 用途 |
|------|------|
| [project-overview.md](./project-overview.md) | 当前项目结构、技术栈、路由、前后端关系 |
| [runbooks/local-development.md](./runbooks/local-development.md) | 本地启动、端口、常见排障 |

## 功能设计

| 文档 | 主题 |
|------|------|
| [features/auth-and-profile.md](./features/auth-and-profile.md) | 登录、注册、个人资料、认证接口设计与实施记录 |
| [features/consent-checkbox.md](./features/consent-checkbox.md) | 登录/注册页知情同意选项方案 |
| [features/judge-data-update.md](./features/judge-data-update.md) | 评委信息数据更新与字段映射方案 |
| [features/qa-square-question-modal.md](./features/qa-square-question-modal.md) | 问答广场公开提问弹窗方案 |
| [features/qa-submit-effect.md](./features/qa-submit-effect.md) | 问答广场提交特效与弹窗优化方案 |

## 修复记录

| 文档 | 问题 |
|------|------|
| [bugfixes/five-times-empty.md](./bugfixes/five-times-empty.md) | 五种时间页面筛选为空 |
| [bugfixes/templates-qa-pages.md](./bugfixes/templates-qa-pages.md) | 人生模板与问答广场页面打不开 |
| [bugfixes/particle-and-modal.md](./bugfixes/particle-and-modal.md) | 粒子交互与问答弹窗无法显示 |

## 历史归档

| 文档 | 说明 |
|------|------|
| [archive/merge-plan.md](./archive/merge-plan.md) | 粒子问答合并方案和后续修复记录 |
| [archive/old-readme-analysis.md](./archive/old-readme-analysis.md) | 早期纯前端版本的代码分析，已不代表当前项目状态 |

## 整理规则

- 当前有效的运行方式和架构说明写入 `project-overview.md` 与 `runbooks/`。
- 功能方案放入 `features/`，保留设计背景和实现状态。
- 已修复的问题放入 `bugfixes/`，作为排查参考。
- 过期但有历史价值的计划、旧分析放入 `archive/`。
- 新文档优先使用小写英文文件名，单词用连字符分隔。
