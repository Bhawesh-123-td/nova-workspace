# Nova Workspace

Nova Workspace is its own standalone local workspace app. It is built as a React/Vite web app and runs from a local Node.js static server in portable mode.

It does not depend on Copilot, Codex, or any hosted AI service to run. Once it is built, the app files can be copied to another device and launched locally.

## Run Locally

```powershell
npm run dev
```

## Build

```powershell
npm run build
```

## Windows Desktop App

The project includes a Windows desktop build in:

```text
release/Nova Workspace 1.0.0.exe
```

To open it by double-clicking, use:

```text
Open Nova Workspace EXE.bat
```

To rebuild the `.exe`, double-click:

```text
Make Windows EXE.bat
```

More desktop instructions are in `DESKTOP.md`.

## Create Transfer Package

```powershell
npm run portable
```

The portable zip will be created in `portable/`.
