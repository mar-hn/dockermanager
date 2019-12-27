import packagejson from '../../package.json';

class managerUtils 
{    
    getVersion()
    {
        return packagejson.version;
    }

    checkDataPaths()
    {
        const neededPaths = 
        [
            this.getManagerDataPath(),
            `${this.getManagerDataPath()}/apps`
        ];

        for(path of neededPaths)
        {
            if(!utils.os.fileExists(path))
            {
                console.log(`Path:${path} didnt exist. Creating it....`);
                utils.os.makeDir(Path);                
            }
        }
    }
    
    getManagerDataPath()
    {
        return `${utils.os.getHomeDir()}/DockerManagerData`;
    }

    getManagerContainerDataPath()
    {
        return `${this.getManagerDataPath()}/apps`;
    }
}

export default managerUtils;