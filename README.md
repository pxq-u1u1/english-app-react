# 英语表达练习

一个帮助提升英语表达能力的纯前端工具，支持中英双向翻译、英文日记写作与 AI 批改、语料库积累。

**在线体验：https://pxq-u1u1.github.io/english-app-react/**

## 功能

- **中→英 / 英→中 双向翻译** — DeepSeek AI 翻译，历史记录可搜索、多选、导出
- **英文日记** — 每天写英文日记，AI 一键批改语法和表达，让写作更地道
- **语料库** — 收藏好句子，AI 自动分类（职场/日常/社交等），一键翻译中文释义
- **导出 PDF / Word** — 翻译记录、日记、语料库均支持导出
- **纯前端** — 数据存浏览器 localStorage，API Key 也只存本地，无需后端

## 快速开始

```bash
git clone https://github.com/pxq-u1u1/english-app-react.git
cd english-app-react
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 配置 API Key

1. 去 [platform.deepseek.com](https://platform.deepseek.com) 免费注册，获取 API Key
2. 打开页面，点击右上角 **⚙ 设置**
3. 填入 API Key，保存

Key 存在你浏览器的 localStorage 中，不会上传到任何服务器。

## 技术栈

- React 18 + Vite 6
- DeepSeek API（翻译、批改、分类）
- localStorage 数据持久化
- GitHub Pages 部署

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
│   ├── SettingsModal.jsx        # API Key 设置弹窗
│   ├── Toast.jsx                # 消息提示
│   └── Pagination.jsx           # 分页组件
└── utils/
    ├── deepseek.js              # DeepSeek API 封装
    ├── storage.js               # localStorage 操作
    └── helpers.js               # 工具函数 + 导出
```

## 本地开发

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run deploy    # 部署到 GitHub Pages
```
