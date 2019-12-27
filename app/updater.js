/* eslint-disable linebreak-style */
/* eslint-disable lines-between-class-members */
import { ipcMain } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
import log from 'electron-log';

export default class AppUpdater 
{
    mainWindow = null;
    autoQuitAndInstall = false;
    cancellationToken = new CancellationToken();

    constructor(mainWindow) 
    {
        this.mainWindow = mainWindow;
        log.transports.file.level = 'debug';
        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;

        this.register();
    }

    async register()
    {
        if (process.env.NODE_ENV === 'development')
        {
            console.log('[Updater] Running appUpdater with dev settings');
            autoUpdater.updateConfigPath = `${__dirname}/dev-app-update.yml`;
        }

        // Client side listeners
        ipcMain.on('checkforUpdate', this.checkForUpdates);
        ipcMain.on('downloadUpdate',this.downloadUpdate);
        ipcMain.on('installUpdate',this.installUpdate);

        // Updater Listeners
        autoUpdater.on("update-available",this.updateAvailable);
        autoUpdater.on("update-not-available",this.updateNotAvailable);
        autoUpdater.on("update-downloaded",this.updateDownloaded);
        
    }

    checkForUpdates = () =>
    {
        autoUpdater.checkForUpdates();
    }

    updateAvailable = (updateInfo) =>
    {
        this.mainWindow.webContents.send('updateAvailable-reply',updateInfo);
    }

    updateNotAvailable = (updateInfo) =>
    {
        this.mainWindow.webContents.send('updateNotAvailable-reply',updateInfo);
    }

    downloadUpdate = () =>
    {
        autoUpdater.downloadUpdate(this.cancellationToken);
    }

    updateDownloaded = () =>
    {
        this.mainWindow.webContents.send('updateDownloaded-reply');
    }

    installUpdate = () =>
    {
        autoUpdater.quitAndInstall();
    }
}