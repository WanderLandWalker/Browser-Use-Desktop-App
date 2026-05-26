<img width="1456" height="484" alt="desktop-app-banner" src="https://github.com/user-attachments/assets/550ca16a-5a61-4ded-92f0-a30421870223" />

# Browser Use Desktop App

> Run a team of browser agents on your desktop. 简体中文界面已内置。

[![中文界面](https://img.shields.io/badge/简体中文-语言包-363636?style=flat-square)](CONTRIBUTING.md#i18n-internationalization)

[![Download for macOS](https://img.shields.io/badge/Download_for_macOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-arm64.dmg)
[![Download for Windows](https://img.shields.io/badge/Download_for_Windows-0078D4?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4OCA4OCI%2BPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMTIuNCAzNiA3LjV2MzQuOEgwem00MC4zLTUuNUw4OCAwdjQxLjhINDAuM3pNMCA0NS43aDM2djM0LjhMMCA3NS42em00MC4zLjVIODhWODhsLTQ3LjctNi43eiIvPjwvc3ZnPg%3D%3D&logoColor=white)](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-Setup.exe)
[![Download for Linux](https://img.shields.io/badge/Download_for_Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-x64.AppImage)

Every AI browser tries to be both a browser *and* an agent. Keep your normal Chrome — this is just the agent half.

Ports your cookies into a fresh Chromium so agents are logged in everywhere you are, and spawns tasks from anywhere with a keyboard shortcut.

Built on [Browser Harness](https://github.com/browser-use/browser-harness).

<img width="3542" height="2298" alt="CleanShot 2026-05-01 at 12 18 27@2x" src="https://github.com/user-attachments/assets/edd4f6e0-0efe-4b16-b772-b73d5a1a6d23" />

## Download

**macOS (Apple Silicon):** [Browser-Use-arm64.dmg](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-arm64.dmg)

**Windows (x64):** [Browser-Use-Setup.exe](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-Setup.exe)

**Linux:** [Browser-Use-x64.AppImage](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-x64.AppImage) supports in-app auto-updates. `.deb` and `.rpm` packages are also published on GitHub Releases for manual installs.

The buttons and links always point to the latest release.

## Providers

- **Anthropic** - Claude Code Subscription or API Key
- **Codex** - ChatGPT Subscription or API Key

## Channels 

Inbound message channels can trigger agent sessions automatically. 

- **WhatsApp** — text yourself with `@BU` to send and receive agent messages

## Internationalization (i18n)

Browser Use Desktop ships with built-in Chinese (简体中文) and English (English) interface. Switch language in **Settings → Language**.

To contribute translations or add a new locale, see [CONTRIBUTING.md → i18n](CONTRIBUTING.md#i18n-internationalization).

## Development

Requires [Task](https://taskfile.dev) (`brew install go-task`).

```bash
task up    # Install deps and start the app
```

Linux packages are built in Docker so local distro tools do not affect the output:

```bash
task linux:make:docker
```

## 简体中文

> 在您的桌面上运行一群浏览器代理。

无需更换浏览器——保持您常用的 Chrome，这只是代理端。将您的 Cookie 导入新的 Chromium 实例，让代理在您登录过的所有地方保持登录状态，并通过全局快捷键从任何地方启动任务。

基于 [Browser Harness](https://github.com/browser-use/browser-harness) 构建。

### 下载

- **macOS (Apple Silicon):** [Browser-Use-arm64.dmg](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-arm64.dmg)
- **Windows (x64):** [Browser-Use-Setup.exe](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-Setup.exe)
- **Linux:** [Browser-Use-x64.AppImage](https://github.com/browser-use/desktop/releases/latest/download/Browser-Use-x64.AppImage)

### 提供商

- **Anthropic** - Claude Code 订阅或 API 密钥
- **Codex** - ChatGPT 订阅或 API 密钥

### 通道

入站消息通道可以自动触发代理会话。

- **WhatsApp** — 给自己发送带有 `@BU` 的短信，发送和接收代理消息

### 国际化

本应用内置简体中文和英文界面。在 **设置 → 语言** 中切换。

### 开发

需要 [Task](https://taskfile.dev)（`brew install go-task`）。

```bash
task up    # 安装依赖并启动应用
```

## License

MIT
