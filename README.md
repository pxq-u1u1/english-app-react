# 英语表达练习

**输入 → 内化 → 输出**，一个打通英语学习闭环的纯前端工具。

> 翻译不只是翻译，日记不只是日记——让每一次练习都变成积累。

**在线体验：https://pxq-u1u1.github.io/english-app-react/**

## 为什么做这个

- 用有道的感受是「翻译完就忘」，没有笔记，也没有回顾
- 想写英文日记却坚持不下去——写了没人改，不知道哪里不对
- 每天刷到好句子截图收藏，散落各处，再也找不到
- 背了单词不会用——缺少从「输入 → 输出」的闭环

这个产品就是解决这三个问题：**输入（语料库）+ 内化（翻译笔记）+ 输出（日记批改）**。

详细产品文档：[PRD.md](./PRD.md)

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
