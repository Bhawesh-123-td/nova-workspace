# Nova Workspace Portable

This folder can be copied to another device and run locally.

Nova Workspace is a standalone local app. It does not depend on Copilot, Codex, or any hosted AI service to run.

## Run On Another Windows Device

1. Install Node.js LTS from https://nodejs.org if the device does not already have Node.
2. Copy the whole portable folder to the other device.
3. Double-click `run-nova-workspace.bat`.
4. The app opens in the browser at a local address such as `http://127.0.0.1:4173/`.

## Create A Fresh Transfer Zip

From the project folder, run:

```powershell
npm run portable
```

The zip is created in the `portable` folder. Send that zip to the other device, unzip it, then run `run-nova-workspace.bat`.

## Notes

- The app runs locally on the device. It does not need an internet connection after Node is installed.
- Pages are saved in the browser's local storage on each device.
- To move your actual notes between devices, use the Markdown export button inside the app for now.
