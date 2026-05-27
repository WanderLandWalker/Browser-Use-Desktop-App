<img width="1456" height="484" alt="desktop-app-banner" src="https://github.com/user-attachments/assets/550ca16a-5a61-4ded-92f0-a30421870223" />

[**English**](README.md) | [**简体中文**](README.zh.md)

# Browser Use Desktop App

> 在桌面上运行一群浏览器代理。

其他 AI 浏览器总想把浏览器和代理合二为一。你不用换 Chrome——这个只是代理端。

把你的 Cookie 导入全新的 Chromium，代理就能在你登录过的网站保持登录。还可以用全局快捷键从任何地方启动任务。

基于 [Browser Harness](https://github.com/browser-use/browser-harness) 构建。

<img width="3542" height="2298" alt="CleanShot 2026-05-01 at 12 18 27@2x" src="https://github.com/user-attachments/assets/edd4f6e0-0efe-4b16-b772-b73d5a1a6d23" />

## 下载

**macOS (Apple Silicon):** [Browser-Use-arm64.dmg](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-arm64.dmg)

**Windows (x64):** [Browser-Use-Setup.exe](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-Setup.exe)

**Linux:** [Browser-Use-x64.AppImage](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-x64.AppImage) 支持应用内自动更新。`.deb` 和 `.rpm` 包也发布在 GitHub Releases 中，可手动安装。

上述按钮和链接始终指向最新版本。

## 提供商

- **Anthropic** - Claude Code 订阅或 API 密钥
- **Codex** - ChatGPT 订阅或 API 密钥

## 通道

消息通道可以自动触发代理会话。

- **WhatsApp** — 给自己发一条带 `@BU` 的消息，即可收发代理消息

## 国际化

本应用支持简体中文和 English 界面。在 **设置 → 语言** 中切换。

## 开发

需要 [Task](https://taskfile.dev)（`brew install go-task`）。

```bash
task up    # 安装依赖并启动应用
```

Linux 包在 Docker 中构建，避免本地系统工具影响构建结果：

```bash
task linux:make:docker
```

## 许可证

MIT
