# Nova Workspace Desktop

Nova Workspace can now be packaged as a desktop app with Electron.

## Install desktop dependencies

Run this once after moving the project to a computer:

```bash
npm install
```

## Run desktop app in development

```bash
npm run desktop:dev
```

## Open by clicking on macOS

On a Mac, double-click:

```text
Open Nova Workspace.command
```

The first run installs desktop dependencies if they are missing, then opens the app.

If macOS says the file is not allowed to run, open Terminal in this folder once and run:

```bash
chmod +x "Open Nova Workspace.command" "Make Mac App.command"
```

After that, double-clicking works from Finder.

To create a real `.app` and `.dmg` package, double-click:

```text
Make Mac App.command
```

The finished Mac app appears in the `release/` folder.

## Run built desktop app locally

```bash
npm run desktop
```

## Create installers

Build the current operating system:

```bash
npm run desktop:dist
```

## Windows `.exe`

To open the finished Windows app by double-clicking, use:

```text
Open Nova Workspace EXE.bat
```

To rebuild the portable `.exe` by double-clicking, use:

```text
Make Windows EXE.bat
```

You can also rebuild the app icon and build a portable `.exe` from the terminal with:

```bash
npm run win:dist
```

The Windows build script packages the app, stamps `build/icon.ico` onto the
desktop executable, and then creates the portable `.exe`.

The easiest file to share is:

```text
release/Nova Workspace 1.0.0.exe
```

You can also run the unpacked app directly from:

```text
release/win-unpacked/Nova Workspace.exe
```

Build a Mac app on macOS:

```bash
npm run mac:dist
```

Build a Windows app on Windows:

```bash
npm run win:dist
```

Output goes into the `release/` folder.

Note: macOS `.dmg` and `.app` packages should be built on a Mac. Windows installers should be built on Windows.
