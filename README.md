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

详细产品文档：[PRD.md](./PRD.md)

## 功能

- **中→英 / 英→中 双向翻译** — DeepSeek AI 翻译，历史记录可搜索、多选、导出
- **英文日记** — 每天写英文日记，AI 一键批改语法和表达，让写作更地道
- **语料库** — 收藏好句子，AI 自动分类（职场/日常/社交等），一键翻译中文释义
- **导出 PDF / Word** — 翻译记录、日记、语料库均支持导出
- **手机电脑同步** — 自建后端，多设备数据实时同步
- **PWA 支持** — 手机可添加到桌面，接近原生 App 体验

## 架构

```
手机/电脑 → GitHub Pages（前端 React）
                 ↓ API 调用
         阿里云 ECS（Node.js + Express）
                 ↓
          SQLite 数据库 + DeepSeek API
```

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React 18 + Vite 6 | GitHub Pages 托管 |
| 后端 | Node.js + Express | 部署在阿里云 ECS |
| 数据库 | SQLite | 单文件，零配置 |
| AI | DeepSeek API | 翻译、批改、分类，Key 存服务器 |
| 缓存 | localStorage | 未配服务器时本地存储 |

后端代码仓库：[english-app-backend](../english-app-backend/)

## 快速开始

```bash
git clone https://github.com/pxq-u1u1/english-app-react.git
cd english-app-react
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 配置

### 本地使用（不配后端）

1. ⚙ 设置 → 填 DeepSeek API Key → 保存
2. 数据存浏览器 localStorage

### 多设备同步（配后端）

1. 服务器部署后端 → 参考[部署指南](../english-app-backend/部署指南.md)
2. ⚙ 设置 → 填服务器地址 + 密码 → 保存
3. 所有设备打开同一个网页，数据实时同步
4. API Key 存服务器，前端不再保存

## 项目结构

```
src/
├── App.jsx                      # 主组件
├── index.css                    # 全局样式
├── main.jsx                     # 入口
├── components/
│   ├── TranslateTab.jsx         # 翻译标签页
│   ├── DiaryTab.jsx             # 日记标签页
│   ├── CorpusTab.jsx            # 语料库标签页
│   ├── Header.jsx               # 顶栏 + 标签导航
│   ├── SettingsModal.jsx        # 设置弹窗（API Key / 服务器）
│   ├── Toast.jsx                # 消息提示
│   └── Pagination.jsx           # 分页组件
└── utils/
    ├── api.js                   # 后端 API 客户端（自动判断本地/服务器模式）
    ├── deepseek.js              # DeepSeek API 封装（本地模式）
    ├── storage.js               # localStorage 操作（本地模式）
    └── helpers.js               # 工具函数 + 导出
```

## 本地开发

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run deploy    # 部署到 GitHub Pages
```
