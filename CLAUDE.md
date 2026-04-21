# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run backend server only (http://localhost:3000)
npm start

# Run full Electron desktop app
npm run electron

# Package into Windows executable (outputs to dist/)
npm run package-win
```

**Prerequisites:** Node.js, Ollama running at `http://localhost:11434` with at least one model installed.

## Architecture

This is an Electron desktop app that wraps a local Express.js server serving a single-page HTML frontend. Two processes run simultaneously:

- **`main.js`** — Electron main process. Spawns `server/generate-prompts.js` as a child process, then opens a `BrowserWindow` loading `http://localhost:3000`. Registers global shortcuts (F11, Esc, Ctrl+Q). Handles `quit-app` IPC message from the renderer.
- **`preload.js`** — Electron preload script. Exposes `window.electronAPI.quitApp()` to the renderer via `contextBridge`.
- **`server/generate-prompts.js`** — Express server on port 3000. Proxies requests to Ollama at `localhost:11434`. Manages prompt history in `server/prompt-history.json`.
- **`public/`** — Static frontend (HTML/CSS/JS). All JS is inline in `index.html`.

## Key Design Points

**Prompt styles** are defined entirely in `server/generate-prompts.js` as a `systemPrompts` object keyed by style name (e.g., `realistic`, `cinematic`, `music`). The theme string is interpolated directly into each system prompt before being sent to Ollama. Adding a new style requires: adding a key to `systemPrompts` and an `<option>` in the `index.html` select.

**Ollama integration** uses raw Node.js `http.request` (not fetch) with `stream: false`. The model name comes from the frontend and defaults to `phi4-mini` in the backend if omitted.

**History** is persisted as a flat JSON array in `server/prompt-history.json`. Each entry stores: `user_prompt`, `model`, `prompt_style`, `model_response`, `timestamp` (ISO string used as the deletion key).

**No bundler or build step** — plain HTML/CSS/JS, no TypeScript, no framework. `express` is the only runtime dependency (no `node_modules` in `dependencies` in package.json; verify before packaging).
