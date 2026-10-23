# Hammerspoon API Documentation Browser

A fast, clean, and 100% offline desktop-style reference documentation browser for [Hammerspoon](https://www.hammerspoon.org/) (macOS automation engine).

Built with React, Vite, and Tailwind CSS. Contains the complete official documentation dataset comprising **140 modules** and **2,057+ API signatures** (Variables, Functions, Constructors, and Methods).

---

## ⚡ Zero API Key Requirement

**No external APIs, accounts, tokens, or network services are needed.**

- **100% Offline**: All documentation, signatures, parameters, return values, and source links are bundled locally (`src/data/officialDocs.json`).
- **No Backend / Database**: Runs as a lightweight client-side Single Page Application (SPA).
- **No API Keys**: You do **not** need Gemini keys, OpenAI keys, or any third-party credentials.

---

## 🚀 Quick Start (Local Use)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended), or [Bun](https://bun.sh/), or [pnpm](https://pnpm.io/).

### 1. Install Dependencies

Using `npm`:
```bash
npm install
```

Or using `bun`:
```bash
bun install
```

Or using `pnpm`:
```bash
pnpm install
```

### 2. Start Local Development Server

```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 📦 Production Build & Static Hosting

Since this is a fully static client-side application, you can build it once and host it anywhere (e.g. GitHub Pages, Cloudflare Pages, Netlify, Vercel, or a local file server):

```bash
# Build production bundle to ./dist
npm run build

# Preview production build locally
npm run preview
```

You can also serve the `dist/` folder using any static HTTP server:
```bash
npx serve dist -l 3000
```

---

## 🌐 Deploy to GitHub Pages (via GitHub Actions)

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the site automatically whenever changes are pushed.

### One-Time Setup in GitHub:

1. Push your repository to GitHub.
2. Go to **Settings** → **Pages** (in the left sidebar under *Code and automation*).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push a commit to `main` (or `master`), or click **Actions** → **Deploy to GitHub Pages** → **Run workflow**.
5. Your site will automatically go live at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## ✨ Features

- **Complete Official Coverage**: 140 modules including submodules (`hs.window`, `hs.application`, `hs.fs`, `hs.hotkey`, `hs.audiodevice`, `hs.canvas`, `hs.axuielement`, `hs.httpserver.hsminweb.cgilua.urlcode`, etc.).
- **Canonical API Hierarchy**: Organizes items strictly according to official Hammerspoon conventions:
  1. `Variables` — Configurable values
  2. `Functions` — API calls offered directly by the extension
  3. `Constructors` — API calls returning an object instance
  4. `Methods` — API calls made on object instances
- **Sticky "Jump to..." Quick Navigation**: Fast navigation dropdown box that stays fixed at the top as you scroll through lengthy modules.
- **Draggable & Resizable Sidebar**: Adjust sidebar width smoothly to fit long module names (`hs.httpserver.hsminweb...`). Width preference is saved in `localStorage`.
- **Instant Search**: Real-time filtering across module names, descriptions, function signatures, and methods.
- **Rich Markdown Formatting**: Renders inline code blocks (`` `code` ``), italic parameters (`*param*`), bullet points, and code samples with high contrast and readability.
- **Direct GitHub Source Links**: Click any API item's source file to open the exact C or Lua source file on Hammerspoon's official GitHub repository in a new tab.

---

## 🛠️ Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local dev server at `http://localhost:3000` |
| `npm run build` | Compiles TypeScript and creates optimized production build in `dist/` |
| `npm run preview` | Locally preview the built production app |
| `npm run lint` | Runs TypeScript typecheck (`tsc --noEmit`) |

---

## 📁 Project Structure

```
├── README.md               # Local setup & documentation guide
├── .env.example            # Environment variables template (no keys required)
├── index.html              # HTML entry point
├── package.json            # Project dependencies and npm scripts
├── src/
│   ├── App.tsx             # Main layout, search, resizable sidebar & sticky jump bar
│   ├── main.tsx            # React application root
│   ├── index.css           # Global Tailwind CSS styles
│   ├── types.ts            # TypeScript interfaces for modules & API items
│   └── data/
│       └── officialDocs.json # Complete Hammerspoon documentation bundle (140 modules)
└── vite.config.ts          # Vite configuration
```

---

## 📄 License

Documentation content is sourced from the official [Hammerspoon project](https://www.hammerspoon.org/) under the MIT License.
