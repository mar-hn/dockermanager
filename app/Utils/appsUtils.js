/* eslint-disable no-restricted-globals */
import Apps from '../Constants/apps.json';

class AppUtils 
{
    constructor()
    {
        this.appIcons = this.importAllImages(require.context('../Resources/appicons/', false, /\.(png|jpe?g|svg)$/));
    }

    getAppType(ImageName)
    {
      for(const key in Apps)
        {
            if(ImageName.includes(key) && ImageName.includes(utils.const.workRepository))
                return key;
        }

        return null;
    }

    getApp(ImageName)
    {
      for(const key in Apps)
        {
            if(ImageName.includes(key) && ImageName.includes(utils.const.workRepository))
                return lodash.cloneDeep(Apps[key]);
        }

        return null;
    }

    importAllImages(r) 
    {
        // eslint-disable-next-line prefer-const
        let images = {};
        // eslint-disable-next-line array-callback-return
        r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
        return images;
    }

    getAppIcon(ImageName)
    {
        for(const f in this.appIcons)
        {
            if(f !== "default.png")
            {
                // Remove extension
                const filename = f.replace(/\.[^/.]+$/, "");
                if(ImageName.includes(filename))
                    return this.appIcons[f];
            }
        }

        return this.appIcons["default.png"];
    }
    
    getAppVPorts(ImageName)
    {
        const AppConfig = this.getApp(ImageName);
        if(!AppConfig) return null;

        return lodash.cloneDeep(AppConfig.vports);
    }

    getAppVPortsFromVHost(vhost)
    {
        const arrVHosts = vhost.split(',');
        const vports = {};
        for(const v of arrVHosts)
        {
            const vhostData = v.split(":");
            if(vhostData.length > 3)
            {
                vports[vhostData[1]] = 
                {
                    nginxPort: vhostData[2],
                    appProtocol: vhostData[3],
                    nginxProtocol: vhostData[4]
                };
            }
        }

        return vports;
    }

    getAppVirtualHosts(ImageName,URL,vPorts)
    {
        const vHosts = [];
        
        for(const contPort in vPorts)
        {
            vHosts.push(`${URL}:${contPort}:${vPorts[contPort].nginxPort}:${vPorts[contPort].appProtocol}:${vPorts[contPort].nginxProtocol}`);
        }

        return vHosts;
    }
    

    getAppSettings(ImageName)
    {
        for(const key in Apps)
        {
            if(ImageName.includes(key) && ImageName.includes(utils.const.workRepository))
                return `${lodash.capitalize(key)}Settings`;
        }

        return null;
    }

    getProjectPath(env)
    {
        const ProjectPath = env.find( item => item.includes('PROJECTDIR='));
        return ProjectPath ? ProjectPath.split('=')[1].replace(/['"]+/g, '') : '';
    }

    getVirtualHostURL(Vhost)
    {
        if(!Vhost || Vhost.length < 1)
            return '';

        const Arr = Vhost.split(':');
        return Arr[0];
    }

    getNginxPort(vhost,ContainerPort)
    {
        const regex = new RegExp(`:${ContainerPort}:(.*?):`);
        const lookup = vhost.match(regex);
        if(lookup && lookup.length > 0)
            return lookup[1];

        return null;
    }

    getAppHomePageURL(ImageName,vhost)
    {        
        const AppConfig = this.getApp(ImageName);
        if(AppConfig)
        {
            let URL = AppConfig.homeURL.replace('%URL%',this.getVirtualHostURL(vhost));
            const regex = new RegExp(`%VPORT:(.*?)%`);
            const lookup = URL.match(regex);
            if(lookup && lookup.length > 0)
            {
                const VPORT = this.getNginxPort(vhost,lookup[1]);
                if(!VPORT) return null;
                
                URL = URL.replace(lookup[0],VPORT);
            }
                
            
            return URL;
        }

        return `http://${vhost}`;
    }

    getAppAdminPageURL(ImageName,vhost)
    {        
        const AppConfig = this.getApp(ImageName);
        if(AppConfig)
        {
            let URL = AppConfig.adminURL.replace('%URL%',this.getVirtualHostURL(vhost));
            const regex = new RegExp(`%VPORT:(.*?)%`);
            const lookup = URL.match(regex);
            if(lookup.length > 0)
            {
                const VPORT = this.getNginxPort(vhost,lookup[1]);
                if(!VPORT) return null;
                
                URL = URL.replace(lookup[0],VPORT);
            }
                
            
            return URL;
        }

        return null;
    }

    getAppLabels()
    {
        return {
            [utils.const.appLabel]: utils.manager.getVersion()
        };
    }

    async getAppVolumes(imgname)
    {
        const extendedImages = await utils.docker.getExtendedImage(imgname);
        return extendedImages.Config.Volumes;
    }    

    async getAppBinds(imgname,appId)
    {
        const appVolumes = await this.getAppVolumes(imgname);
        const cDataPath = utils.manager.getManagerContainerDataPath();
        const Binds = [];

        for(const key in appVolumes)
        {
            const Path = `${cDataPath}/${appId + key}`;
            const DirPath = utils.os.getDir(Path);
            
            if( !utils.os.fileExists(DirPath) )
                utils.os.makeDir(DirPath);
            
            Binds.push(`${Path}:${key}`);
        }

        return Binds;
    }

    async getTCPPortBinding(vPorts)
    {
        const tcpPorts = Object.keys(vPorts).filter(port => vPorts[port].appProtocol === "tcp");
        const portBindings = {};
        const exposedPorts = {};
         
        for(const vp of tcpPorts)
        {
            if(vPorts[vp].nginxPort.length < 1)
            {
                // Get port
                vPorts[vp].nginxPort = await this.getAppFreePort();
            }
            
            portBindings[`${vp}/tcp`] = 
            [
                {HostPort: String(vPorts[vp].nginxPort)}
            ];
            
            exposedPorts[`${vp}/tcp`] = {};       
        }

        return {
            portBindings,
            exposedPorts
        };
    }

    startApp(id)
    {
        return new Promise(async (resolve,reject) =>
        {
            const container = dockerapi.getContainer(id);
            const containerData = await container.inspect();
            const vhost = utils.docker.getVHost(containerData.Config.Env);
            const vPorts = this.getAppVPortsFromVHost(vhost);
    
            // Check of ports
            for(const vp in vPorts)
            {
                const portInfo = await utils.os.checkPort(vPorts[vp].nginxPort);
                if(portInfo.portBlocked)
                {
                    const errorObj = new Error(
                        `Port ${vPorts[vp].nginxPort} is being used by another app. \n` +
                        `Please close the following apps to continue:\n`+
                        `${portInfo.listApps.map(app => app.name).join('\n')}`
                    );
                    reject(errorObj);
                    return;
                }
            }

            container.start((err, data) => {
                if(err) reject(err);
                resolve(data);
            });    
        });       
    }

    stopApp(id)
    {
        return new Promise(async (resolve, reject) =>
        {
            const container = dockerapi.getContainer(id);
            container.stop((err, data) => {
                if(err) reject(err);
                resolve(data);
            });
        });
    }
    
    async createApp(appId, baseImage, config, volumes = []) 
    {
        const { vhost, vports, projectPath } = config;
        const appType = this.getAppType(baseImage);
        const appEnv = [];


        const tcpBinding = await this.getTCPPortBinding(vports);
        
        if(vhost && vhost.length > 1)
        {
            appEnv.push(`VIRTUAL_HOST=${this.getAppVirtualHosts(baseImage,vhost, vports).join(',')}`);

            if(utils.os.isHostUsed(vhost))
                throw new Error(`The url '${vhost}' is already being used. Please provide another one.`);
        }

        if(projectPath && projectPath.length > 1)
        {
            switch(appType)
            {
                case 'glassfish':
                    const XMLDoc = utils.os.readFile(`${projectPath}/build.xml`);
                    const Parsed = utils.misc.xmlToJs(XMLDoc);
                    appEnv.push(`PROJECTNAME=${Parsed.project._attributes.name}`);
                    appEnv.push(`PROJECTDIR=${projectPath}`);

                    volumes = volumes.filter(item => !item.endsWith('/webapp'));
                    volumes.push(`${projectPath}/build/web:/webapp`);
                break;
                // case 'coldfusion':
                // case 'lucee':
            }
        }


        // const Binds = await this.getAppBinds(baseImage,appId);
        const dockerParams = 
        {
            name: appId,
            Image: baseImage,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            Env: appEnv,
            Labels: utils.apps.getAppLabels(),
            ExposedPorts: tcpBinding.exposedPorts,
            HostConfig: 
            {
                Binds: volumes,
                PortBindings: tcpBinding.portBindings
            }
        };      
        
        return await dockerapi.createContainer(dockerParams);
    }

    async updateApp(oldApp, appId, baseImage, config)
    {
        const volumes = [];
        
        // Get a the list of all volumes this container use
        for(const mount of oldApp.Mounts)
            volumes.push(`${mount.Name}:${mount.Destination}`);

        // Remove the old container but keep the volumes
        await this.removeApp(appId,false);

        // Create the new container referencing old volumes.
        return await this.createApp(appId,baseImage,config,volumes);
    }

    async removeApp(appId, deleteVolumeData = true)
    {
        const container = await dockerapi.getContainer(appId);
        const containerData = await container.inspect(container.Id);
        const virtualHost = this.getVirtualHostURL(utils.docker.getVHost(containerData.Config.Env));
        console.log(containerData);

        await container.remove();

        if(deleteVolumeData)
        {
            for(const mount of containerData.Mounts)
            {
                if(mount.Name)
                {
                    const appVolume = await dockerapi.getVolume(mount.Name);
                    await appVolume.remove();
                }
            }            
        }
        
        utils.os.removeHost(virtualHost);
    }

    async getProxyPorts()
    {
        const containers = await dockerapi.listContainers();
        const dockerApps = await utils.docker.extendContainers(containers);
        const portBindings = {};
        const exposedPorts = {};
         
        for(const app of dockerApps)
        {
            const vHost = utils.docker.getVHost(app.Config.Env);
            const vPorts = this.getAppVPortsFromVHost(vHost);
            for(const vp in vPorts)
            {
                if(vPorts[vp].appProtocol !== "tcp")
                {
                    portBindings[`${vPorts[vp].nginxPort}/tcp`] = 
                    [
                        {HostPort: String(vPorts[vp].nginxPort)}
                    ];
    
                    exposedPorts[`${vPorts[vp].nginxPort}/tcp`] = {};
                }
            }
            
        }

        return {
            portBindings,
            exposedPorts
        };
    }

    async reloadProxy(forceStart)
    {
        const nginxProxyContainer = await utils.docker.getContainerByName(utils.const.proxyName);
        const wasRunning = nginxProxyContainer && nginxProxyContainer.State === "running";
        
        plugins.docker.setNginxStatus("RELOADING");
        plugins.docker.ignoreContainer(utils.const.proxyName);

        await this.removeProxy();
        const container = await this.createProxy();

        if(wasRunning || forceStart)
        {
            await container.start();
            plugins.docker.setNginxStatus("ONLINE");
        }
        else
            plugins.docker.setNginxStatus("OFFLINE");

        console.log('Reconsidering Proxy');
        setTimeout(()=>
        {
            plugins.docker.reconsiderContainer(utils.const.proxyName);
        },1000);        
    }


    async createProxy()
    {
        const proxyPorts = await this.getProxyPorts();

        const dockerParams = 
        {
            name: utils.const.proxyName,
            Image: utils.const.proxyImage,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            Env: ['VIRTUAL_HOST_SPECIFIC_PORT=true'],
            Labels: utils.apps.getAppLabels(),
            ExposedPorts: proxyPorts.exposedPorts,
            HostConfig: 
            {
                Binds: ["/var/run/docker.sock:/tmp/docker.sock:ro"],
                PortBindings: proxyPorts.portBindings
            }
        };      
        
        return await dockerapi.createContainer(dockerParams);        
    }

    async removeProxy()
    {
        const nginxProxyContainer = await utils.docker.getContainerByName(utils.const.proxyName);
        if(nginxProxyContainer)
        {
            if(nginxProxyContainer.State === "running")
            {
                // Can sometimes throw 'container already stopped'
                try
                {
                    const container = dockerapi.getContainer(nginxProxyContainer.Id);
                    await container.stop();    
                } catch(ex)
                {
                    // Ignore
                }
            }

            await utils.apps.removeApp(nginxProxyContainer.Id);
        }
    }


    async getAppFreePort()
    {
        let maxPort = 5000;

        const containers = await dockerapi.listContainers({all:true});
        const dockerApps = await utils.docker.extendContainers(containers);

        for(const app of dockerApps)
        {
            const vHost = utils.docker.getVHost(app.Config.Env);
            const vPorts = this.getAppVPortsFromVHost(vHost);
            
            for(const vp in vPorts)
            {
                if(vPorts[vp].appProtocol === "tcp")
                {
                    const nginxPort = Number(vPorts[vp].nginxPort);
                    if(!isNaN(nginxPort))
                        maxPort = Math.max(maxPort,nginxPort);
                }
            }
        }

        const freePort = await utils.os.getFreePort(maxPort);
        return freePort[0] + 1;
    }
}

export default AppUtils;