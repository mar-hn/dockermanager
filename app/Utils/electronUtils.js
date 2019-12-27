import electron from 'electron';
import {nativeImage} from 'electron';
import nodepath from 'path';
import {execSync} from 'child_process';
import Store from 'electron-store';

import successIcon from '../Resources/imgs/success.png';
import failedIcon from '../Resources/imgs/failed.png';

class electronUtils 
{
    config = new Store({
        defaults: 
        {
            theme: {
                palette: {
                  primary: { main: '#3f51b5' },
                  secondary: { main: '#3f51b5' },
                  type: 'light',
                }
            },
            nginxCertsFolderPath: '',
            nginxKeyFilePath: ''
        }
    });
    

    openExternalLink(url)
    {
        if(process.env.isElevated === "true" && process.platform.toUpperCase() !== "WIN32")
        {
            execSync(`sudo -u $(sudo stat -f "%Su" /dev/console) open ${url}`);
            return;
        }

        electron.shell.openExternal( url );
    }

    showError(title,msg)
    {
        const { dialog } = electron.remote;
        dialog.showMessageBox(electron.remote.getCurrentWindow(),
        {
            type: "error",
            title: title,
            message: String(msg)
        });
    }

    showOpenDialog(...args)
    {
        const { dialog } = electron.remote;
        return dialog.showOpenDialog.apply(this,[electron.remote.getCurrentWindow(),...args]);
    }

    showSaveDialog(...args)
    {
        const { dialog } = electron.remote;
        return dialog.showSaveDialog.apply(this,[electron.remote.getCurrentWindow(),...args]);
    }

    showNotification(title,body,icon,onClick,onClose)
    {   
        // Set Icon
        let iconPath = '';
        switch(icon)
        {
            case 'success':
            iconPath = successIcon;
                break;
            case 'failed':
            iconPath = failedIcon;
                break;  
            default:
            iconPath = undefined;
        }

        // Create notification
        const notificationObj = new Notification(title,
        {
            body,
            icon: iconPath,
            silent: true,
        });
        
        notificationObj.onclick = onClick;
        notificationObj.onclose = onClose;
        
        return notificationObj;
    }
    
}

export default electronUtils;