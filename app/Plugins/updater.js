/* eslint-disable linebreak-style */
import React from 'react';
import { Button } from '@material-ui/core';
import {ipcRenderer,remote} from 'electron';

class AppUpdater 
{    
    autoQuitAndInstall = false;

    register()
    {        
        // Fix multiple listeners issue with HotReload.
        ipcRenderer.removeAllListeners('updateAvailable-reply');
        ipcRenderer.removeAllListeners('updateNotAvailable-reply');
        ipcRenderer.removeAllListeners('updateDownloaded-reply');

        // Register listeners
        ipcRenderer.on('updateAvailable-reply',this.updateAvailable);
        ipcRenderer.on('updateNotAvailable-reply',this.updateNotAvailable);
        ipcRenderer.on('updateDownloaded-reply',this.updateDownloaded);

        // Check for updates on Main process
        this.checkForUpdate();
    }

    checkForUpdate()
    {
        ipcRenderer.send('checkforUpdate');                       
    }

    updateAvailable = (event, info) =>
    {
        console.log('[Update] There is an update available',info);
        if(process.platform !== "darwin")
        {
            const options = 
            {
                title: 'Docker Manager',
                message: `An update of Docker Manager is available!`,
                detail: `Version: ${info.version}\nRelease date: ${info.releaseDate}\n\nDo you want to download and install it now?`,
                checkboxLabel: "Shutdown immediately after download and install update.",
                checkboxChecked: this.autoQuitAndInstall,
                buttons: ["OK", "Cancel"],
            };

            remote.dialog.showMessageBox(remote.getCurrentWindow(), options, 
            (response, checkboxChecked) =>
            {
                if (response === 0) {
                    this.autoQuitAndInstall = checkboxChecked;
                    ipcRenderer.send('downloadUpdate',this.autoQuitAndInstall);                    
                }
            });
            return;
        }
        
        this.snackbar('An update is available',
        { 
            autoHideDuration: undefined,
            action: (
                <Button size="small" style={{color:"cyan"}} onClick={this.handleUpdateClick}>LEARN MORE</Button>
            )
        });
    }

    handleUpdateClick = () =>
    {
        utils.electron.openExternalLink('https://github.com/mar-hn/dockermanager/releases/latest');
    }

    updateNotAvailable = (event, info) =>
    {
        console.log('[Update] App is up-to-date.',info);
    }

    updateDownloaded = () =>
    {
        if(this.autoQuitAndInstall)
        {
            ipcRenderer.send('installUpdate');
            return;
        }

        const options = 
        {
          title: 'Docker Manager',
          message: "The update is now ready to be installed.",
          detail: "Clicking OK will shutdown app and install the update.",
          buttons: ["OK", "Cancel"],
        };

        remote.dialog.showMessageBox(remote.getCurrentWindow(), options, (response) => 
        {
            if (response === 0) 
                ipcRenderer.send('installUpdate');
        });
    }
}

export default new AppUpdater();