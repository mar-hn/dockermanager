import React from 'react';
import { Button } from '@material-ui/core';

class DockerPlugin 
{
    constructor()
    {
        this.events = null;
        this.eventListeners = {};
        this.ignoredContainers = new Map();
        this.streamDestroyed = false;

        // Add Nginx Event Listener
        this.addEventListener('nginxProxy',this.nginxProxyEventListener.bind(this));

        this.addEventListener('containerListener',this.ContainerEventListener.bind(this));
    }

    async register()
    { 
        if(this.events)
        {
            console.log('[DOCKER_API] Closing last stream before reconnecting...');
            this.events.destroy();
            this.events = null; 
        }

        if(plugins.docker !== this)
        {
            console.error('Prevented a double register');
            return;
        }

        console.log('[DOCKER_API] Connecting to docker...');
        try 
        {
            this.events = await dockerapi.getEvents();
        } catch (error) 
        {
            // Print error message
            console.error('[DOCKER_API] Failed to attach docker event listener.',error.message);
            this.retryRegister();
            return false;
        }

        // Check if docker return success
        if(this.events.statusCode !== 200)
            return false;

        console.log('[DOCKER_API] Docker API is now connected.');
        this.setDockerStatus('ONLINE');        

        this.events.on('data', this.dockerDataHandler.bind(this));
        this.events.on('error', this.dockerErrorHandler.bind(this));
        this.events.on('end', this.dockerShutdownHandler.bind(this));

        this.checkNginxStatus();
    }
    
    handleInstallProxy = () =>
    {
        this.globalState.setState({openInstallDialog: true});
    }

    showInstallNotification = () =>
    {
        this.nginxSnackbar = this.snackbar('Nginx Proxy not installed',
        { 
            autoHideDuration: undefined,
            action: (
                <Button size="small" style={{color:"cyan"}} onClick={this.handleInstallProxy}>INSTALL</Button>
            )
        });
    }

    async checkNginxStatus()
    {
        const nginxProxyContainer = await this.getContainerByName(utils.const.proxyName);
        if(!nginxProxyContainer)
        {
            // M.toast({html: 'Click here to install nginx proxy.'});
            this.showInstallNotification();

            this.setNginxStatus('NOT INSTALLED');
            return;
        }


        switch (nginxProxyContainer.State) {
            case "created":
            case "exited":
                this.setNginxStatus('OFFLINE');
            break;

            case "running":
                this.setNginxStatus('ONLINE');
            break;
            
            default:
                this.setNginxStatus(nginxProxyContainer.State);
            break;
        }
    }    

    retryRegister()
    {
        // Wait 5 seconds and retry
        setTimeout(() => {
            console.log('[DOCKER_API] Attempting to reconnect...');
            this.register();
        }, 5000);

        // Set status
        this.setDockerStatus('OFFLINE');
    }

    dockerDataHandler(json)
    {
        if(plugins.docker !== this)
        {
            console.info('[DOCKER_API] Detected a duplicated docker plugin, closing...');
            this.destroy();
            return;
        }

        let data = {};
        let arrData = [];

        try{
            arrData = String(json).split('\n').filter(item => item !== "");
            data = JSON.parse(`[${arrData.join(',')}]`);
        } catch(ex)
        {
            console.error('[DOCKER_API][ERROR] Error while parsing json response.',ex);
            console.debug(arrData);
            console.debug(String(data));
            return;
        }
        
        data.forEach(e => 
        {
            if( e.Type === "container")
            {
                for(const listener in this.eventListeners)
                {
                    this.eventListeners[listener](e);
                }                
            }
            console.log('[DOCKER_API] EVENT:',e);
        });        
    }

    ignoreContainer(appName)
    {
        this.ignoredContainers.set(appName);
    }

    reconsiderContainer(appName)
    {
        this.ignoredContainers.delete(appName);
    }

    addEventListener(id,fn)
    {
        if(id in this.eventListeners) 
            throw(new Error(`There is already a listener with ID: ${id}`));

        this.eventListeners[id] = fn;
    }

    removeEventListener(id)
    {
        if(id in this.eventListeners) 
            delete this.eventListeners[id];
    }

    nginxProxyEventListener(e)
    {
        if(e.Actor.Attributes.name === utils.const.proxyName)
        {
            if(this.nginxSnackbar)
            {
                this.closeSnackbar(this.nginxSnackbar);
                this.nginxSnackbar = null;
            }

            if(this.ignoredContainers.has(utils.const.proxyName))
                return;
            
            switch(e.status)
            {
                case "create":
                case "die":
                    console.log('[DOCKER_API] NGINX Proxy container was terminated.');
                    this.setNginxStatus('OFFLINE');
                break;
                case "start":
                    console.log('[DOCKER_API] NGINX Proxy container was started.');
                    this.setNginxStatus('ONLINE');
                break;

                case "destroy":
                    if(!this.ignoredContainers.has(utils.const.proxyName))
                    {
                        this.showInstallNotification();
                        console.log('[DOCKER_API] NGINX Proxy container was removed.');
                        this.setNginxStatus('NOT INSTALLED');    
                    }
                break;

                default:
                break;
            }

            return;
        }

        switch(e.status)
        {
            case "die":
            case "start":
                console.log('[NGINX] Detected changes:',e);
                this.reloadNginx();
            break;
            default:                        
        }
    }

    async reloadNginx()
    {
        try{
            await utils.apps.reloadProxy();
        }catch(ex)
        {
            console.error(ex);
        }
    }

    ContainerEventListener(e)
    {        
        const AppId = e.Actor.ID;
        const AppName = e.Actor.Attributes.name;
        let displayName = AppName;
        
        if(this.ignoredContainers.has(AppName))
            return;

        if(AppName === utils.const.proxyName)
            displayName = utils.const.proxyDisplayName;

        switch(e.status)
        {
            case "start":
                utils.electron.showNotification(displayName,`The app '${displayName}' has started`,'success');
            break;

            case "die":
                utils.electron.showNotification(displayName,
                `${displayName} has stopped with code ${e.Actor.Attributes.exitCode}`,'failed',
                () =>
                {
                    const arrLocation = window.location.href.split("#");
                    const newLocation = `${arrLocation[0]}#/apps/output?appName=${AppName}&appId=${AppId}`
                    console.log('Navigating to:',newLocation);
                    window.location.href = newLocation;
                });

            break;
            default:
        }        
    }

    dockerErrorHandler(err)
    {
        this.setDockerStatus('OFFLINE');
        console.error('[DOCKER_API] ERROR',err);
    }

    dockerShutdownHandler()
    {   
        if(!this.streamDestroyed)
        {
            console.error('[DOCKER_API] Connection to Docker API was lost.');
            this.retryRegister();
        }        
    }

    setDockerStatus(status)
    {
        if(status === "OFFLINE" && !this.dockerSnackbar)
            this.dockerSnackbar = this.snackbar('Docker is offline',
            { 
                autoHideDuration: undefined,
                action: (
                    <Button size="small" style={{color:"cyan"}}>DISMISS</Button>
                )
            });
        else if (status === "ONLINE" && this.dockerSnackbar)
        {
            // Check
            this.closeSnackbar(this.dockerSnackbar);
        }

        this.globalState.setState({dockerStatus: status});
    }

    setNginxStatus(status)
    {
        this.globalState.setState({nginxProxyStatus: status});
    }

    getContainerByName(name) 
    {
        // filter by name
        const opts = {
            "limit": 1,
            "filters": `{"name": ["${name}"]}`,
            "all": true
        }

        return new Promise((resolve, reject)=>{
            dockerapi.listContainers(opts, (err, containers) => {
                if(err) {
                    reject(err)
                } else{
                    resolve(containers && containers[0])
                }
            });
        });
    }  


    destroy()
    {
        if(this.events)
        {
            this.streamDestroyed = true;
            console.log('[DOCKER_API] Closing event stream.')
            this.events.destroy();
            this.events = null;    
        }
    }

}


export default new DockerPlugin();