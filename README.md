# 英语表达练习

**输入 → 内化 → 输出**，一个打通英语学习闭环的工具。

> 翻译不只是翻译，日记不只是日记——让每一次练习都变成积累。

**在线体验：https://pxq-u1u1.github.io/english-app-react/**

## 为什么做这个

- 用有道的感受是「翻译完就忘」，没有笔记，也没有回顾
- 想写英文日记却坚持不下去——写了没人改，不知道哪里不对
- 每天刷到好句子截图收藏，散落各处，再也找不到
- 背了单词不会用——缺少从「输入 → 输出」的闭环

三个模块解决三个问题：**输入（语料库）+ 内化（翻译笔记）+ 输出（日记批改）**。

文档：[PRD 产品需求文档](./PRD.md) | [项目总结](./%E9%A1%B9%E7%9B%AE%E6%80%BB%E7%BB%93.md)

## 功能

- **中→英 / 英→中 双向翻译** — DeepSeek AI 翻译，历史记录可搜索、多选、导出
- **英文日记** — 每天写英文日记，AI 批改语法并显示修改对照，红笔标注原文问题
- **语料库** — 收藏好句子，AI 自动分类（职场/日常/社交等），一键翻译中文释义
- **导出 PDF / Word** — 翻译记录、日记、语料库均支持导出
- **手机电脑同步** — 自建后端，多设备数据实时同步
- **离线降级** — 服务器不可用时自动切换本地存储，不影响使用
- **PWA 支持** — 手机可添加到桌面，接近原生 App 体验

## 架构

```
手机/电脑 → GitHub Pages（前端 React）
                 ↓ API 调用
         阿里云 ECS :8080（Node.js + Express）
                 ↓
          SQLite 数据库 + DeepSeek API
```

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React 18 + Vite 6 | GitHub Pages 托管 |
| 后端 | Node.js + Express | 部署在阿里云 ECS |
| 数据库 | SQLite | 单文件，零配置 |
| AI | DeepSeek API | 翻译、批改、分类，Key 存服务器 |
| 本地缓存 | localStorage | 服务器不可用时自动降级 |

后端代码仓库：[english-app-backend](https://github.com/pxq-u1u1/english-app-backend)

## 快速开始

```bash
git clone https://github.com/pxq-u1u1/english-app-react.git
cd english-app-react
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 配置

### 本地使用

1. ⚙ 设置 → 填入 DeepSeek API Key → 保存
2. 数据存浏览器 localStorage

### 多设备同步

1. 部署后端 → [部署指南](https://github.com/pxq-u1u1/english-app-backend/blob/master/%E9%83%A8%E7%BD%B2%E6%8C%87%E5%8D%97.md)
2. ⚙ 设置 → 填服务器地址 + 密码 → 保存 → 同步
3. 所有设备打开同一网址，数据实时互通

## 项目结构

```
src/
├── App.jsx                      # 主组件
├── index.css                    # 全局样式
├── main.jsx                     # 入口
├── components/
│   ├── TranslateTab.jsx         # 翻译标签页
│   ├── DiaryTab.jsx             # 日记标签页（含红笔批改对照）
│   ├── CorpusTab.jsx            # 语料库标签页
│   ├── Header.jsx               # 顶栏 + 标签导航
│   ├── SettingsModal.jsx        # 设置弹窗
│   ├── Toast.jsx                # 消息提示
│   └── Pagination.jsx           # 分页组件
└── utils/
    ├── api.js                   # API 客户端（自动降级本地/服务器）
    ├── deepseek.js              # DeepSeek API
    ├── storage.js               # localStorage 操作
    └── helpers.js               # 工具函数 + 导出
```

## 本地开发

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run deploy    # 部署到 GitHub Pages
```

## 版本更新

### V1.0 — 2026-05-19 初始发布

- 中→英 / 英→中 双向翻译
- 英文日记 + AI 批改
- 语料库 + AI 自动分类
- 导出 PDF / Word
- PWA 支持，手机可添加到桌面
- GitHub Pages 部署

### V1.1 — 2026-05-19 后端 + 同步

- Node.js + Express + SQLite 后端
- 阿里云 ECS 部署，pm2 守护
- 手机电脑数据实时同步
- API Key 迁移到服务端
- 服务器不可用时自动降级到本地存储

### V1.2 — 2026-05-19 批改优化

- 日记批改增加「修改对照」
- 红笔标注原文问题 → 绿色修正 → 修改原因
- 后端两步 AI 调用（批改 + diff 生成）
- 移动端适配优化
