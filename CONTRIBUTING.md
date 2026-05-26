# Contributing to Browser Use Desktop / 贡献指南

Install these first:

- [Task](https://taskfile.dev) (`brew install go-task` on macOS)
- Node.js 22
- Yarn

From root:

```bash
git clone https://github.com/browser-use/desktop.git
cd desktop
task up
```

`task up` installs dependencies, patches the local Electron app bundle, and
starts the desktop app. 

Useful development commands:

```bash
task --list          # show available tasks
task lint            # run ESLint
task typecheck       # run tsc --noEmit
cd app && yarn test  # run unit and integration tests
task make            # build platform installers
```

Linux packages are built in Docker:

```bash
task linux:make:docker
```

---

### 中文快速开始

1. 安装 [Task](https://taskfile.dev)、Node.js 22 和 Yarn
2. ```bash
   git clone https://github.com/browser-use/desktop.git
   cd desktop
   task up
   ```
3. `task up` 会自动安装依赖并启动应用

常用命令：
- `task --list` — 查看所有可用任务
- `task lint` — 运行 ESLint
- `task typecheck` — 运行 `tsc --noEmit`
- `cd app && yarn test` — 运行单元和集成测试

语言文件位于 `app/src/renderer/locales/`，编辑后运行 `task typecheck` 检查。

---

## Pull requests

Great PRs are focused and easy to review:

1. Explain why the change is needed.
2. Keep the PR scoped to one bug fix, feature, or cleanup.
3. Include screenshots or a short recording for UI changes.

To get your PR reviewed faster, you can message any of the Browser Use employees on discord, twitter, or email.

## Reporting bugs

Open an issue at
[browser-use/desktop/issues](https://github.com/browser-use/desktop/issues)
with enough detail for someone else to reproduce the problem.

Good bug reports include:

- The app version / git commit.
- Your operating system.
- The provider you were using, such as Claude Code or Codex.
- Clear steps to reproduce the issue.
- What you expected to happen and what happened instead.
- Screenshots or recordings when the bug is visible.
- Relevant logs, with secrets and private URLs redacted.

Helpful log commands:

```bash
task logs:all
task logs:app
task logs:browser
task logs:agent SESSION_ID=<session-id>
task logs:engine
task logs:errors
```

By default, local logs are read from:

```text
~/Library/Application Support/Browser Use/logs
```

## Feature Reuests

Please describe both a problem + solution! Include:

- Why the current app does not solve it well / atall.
- The specific outcome you want.
- Screenshots, recordings, or example sites if they clarify the request.

If you plan to send a PR for the feature, open an issue first! and tag it in your PR. 

## Internationalization (i18n) / 国际化

The app ships with English and Chinese (简体中文) interfaces. All UI strings use the **key = fallback** pattern — the English text itself serves as the translation key, so missing keys fall back gracefully to English.

本应用内置简体中文和英文界面。所有 UI 字符串采用 **key = fallback** 模式——英文原文即翻译键，缺失的键会优雅地回退为英文。

### Adding or editing strings / 添加或编辑字符串

1. Edit the component — wrap user-facing strings with `t('...')` (inside a React component) or `i18n.t('...')` (in module-level code).
   修改组件——用 `t('...')`（React 组件内）或 `i18n.t('...')`（模块级代码）包裹面向用户的字符串。
2. Add the English key to `app/src/renderer/locales/en.json` (value = key).
   将英文键添加到 `app/src/renderer/locales/en.json`（值 = 键）。
3. Add the corresponding translation to `app/src/renderer/locales/zh.json` (or your target locale).
   将对应翻译添加到 `app/src/renderer/locales/zh.json`（或您要添加的语言）。
4. Run `cd app && task typecheck` to verify.
   运行 `cd app && task typecheck` 验证。

### Adding a new locale / 添加新语言

1. Create `app/src/renderer/locales/{locale}.json` with all keys from `en.json`.
   根据 `en.json` 创建 `app/src/renderer/locales/{locale}.json`，包含所有键。
2. Add the locale option to the language dropdown in `app/src/renderer/hub/SettingsPane.tsx`.
   在 `app/src/renderer/hub/SettingsPane.tsx` 的语言下拉框中添加新语言选项。
3. Open a PR — one locale per PR please.
   提交 PR——每次只添加一种语言。

### File structure / 文件结构

```
app/src/renderer/
  i18n.ts                 # i18next initialization / i18next 初始化
  locales/
    en.json               # English source strings / 英文源字符串
    zh.json               # Chinese (simplified) translations / 简体中文翻译
```

### Adding i18n to a new file / 在新文件中使用 i18n

- **React components:** import `useTranslation` from `react-i18next`, call the `t()` function.
  **React 组件：** 从 `react-i18next` 导入 `useTranslation`，调用 `t()` 函数。
- **Module-level code (outside components):** import `i18n` from `../i18n`, call `i18n.t()`.
  **模块级代码（组件外）：** 从 `../i18n` 导入 `i18n`，调用 `i18n.t()`。
- All 5 renderer entry points (`hub/`, `onboarding/`, `pill/`, `popup/`, `logs/`) already wrap their content with `<I18nextProvider>`, so any component inside them can use the hook.
  全部 5 个渲染进程入口（`hub/`、`onboarding/`、`pill/`、`popup/`、`logs/`）已包裹 `<I18nextProvider>`，内部的任何组件均可使用该 hook。

## Where to ask questions

[Browser Use Discord](https://discord.com/invite/fqPB2NCNKV)
[Twitter](https://x.com/browser_use)
