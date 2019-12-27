import os from 'os';
import fs from 'fs';
import tarfs from 'tar-fs';
import nodepath from 'path';
import hostile from 'hostile';
import {execSync} from 'child_process';
import find from 'find-process';
import fp from 'find-free-port';
import constants from '../Constants/constants.json';

class osUtils
{
    constructor()
    {
        this.tempFileName = constants.tempTarFileName;
    }    

    getPlatform()
    {
        return os.platform();
    }

    fileExists(dir)
    {
        return fs.existsSync(dir);
    }

    readFile(path)
    {
        return fs.readFileSync(path);
    }

    execFile(args, options) 
    {
        return new Promise((resolve, reject) => 
        {
          child_process.execFile(args[0], args.slice(1), options, (error, stdout) => {
            if (error) {
              reject(error);
            } else {
              resolve(stdout);
            }
          });
        });
    }

    convertSlash(dir)
    {
        if(this.getPlatform().toUpperCase() === "WIN32")
            dir = dir.replace(/\\/g,'/');

        return dir;
    }

    makeDir(targetDir, { isRelativeToScript = false } = {}) 
    {
        const sep = "/";
        const initDir = nodepath.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        console.log(sep);

        return targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = nodepath.resolve(baseDir, parentDir, childDir);
            try {
                if(this.fileExists(curDir))
                    return curDir;
                
                fs.mkdirSync(curDir);
                fs.chmodSync(curDir, '777');
            } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
                return curDir;
            }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === nodepath.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
            }

            return curDir;
        }, initDir);
    }    

    getDir(path)
    {
        return nodepath.dirname(path);
    }

    getFileName(path)
    {
        return nodepath.basename(path);
    }

    getHomeDir()
    {
        return this.convertSlash(os.homedir());
    }


    getHosts()
    {
        return hostile.get(false);
    }

    isHostUsed(url)
    {
        const HostArr = this.getHosts();
        const bResult = HostArr.some(
        (item) => {
            return item.includes(url);
        });

        return bResult;
    }

    addHost(url)
    {
        return hostile.set('127.0.0.1', url);
    }

    removeHost(url)
    {
        return hostile.remove('127.0.0.1',url);
    }

    updateHost(oldURL, newURL)
    {
        this.removeHost(oldURL);
        this.addHost(newURL);
    }

    extractFile(tarStream,filename,directory,newFileName)
    {
        return new Promise((resolve, reject) =>
        {
            const stream = tarfs.extract(directory, 
            {
                ignore: (name) => 
                {
                    return this.getFileName(name) !== newFileName
                },
                map: (header) => 
                {
                    if(newFileName && header.name === filename)
                        header.name = newFileName
    
                    return header
                },
                readable: true, // all dirs and files should be readable
                writable: true, // all dirs and files should be writable            
            })
            tarStream.pipe(stream);

            stream.on('error', (err) => {
                reject(err);
            });

            stream.on('finish', () =>
            {
                resolve(true);
            });
        });        
    }


    packFileToStream(dirPath,filename,newFileName)
    {
        return new Promise((resolve, reject)=> 
        {
            const stream = fs.createWriteStream(`${dirPath}/${this.tempFileName}`);
            tarfs.pack(dirPath,{
                entries: [filename],
                map: (header) =>
                {
                    if(newFileName)
                        header.name = newFileName;
                    return header;
                }            
            }).pipe(stream);

            stream.on('error',(err) =>
            {
                reject(err);
            });
    
            stream.on('finish',() =>
            {
                const data = fs.readFileSync(`${dirPath}/${this.tempFileName}`);
                fs.unlinkSync(`${dirPath}/${this.tempFileName}`);
                resolve(data);
            });
        });
    }


    openTerminal(cmd,message = '')
    {
        let fullCMD = cmd;
        let echoArgs = '';
        const platform = this.getPlatform().toUpperCase();

        if(message && message.length > 1)
            echoArgs = `echo ${message} &&`;

        if(platform === "WIN32")
            fullCMD = `start powershell -NoExit "${fullCMD}"`;

        if(platform === "DARWIN")
        {
            const newCMD = utils.const.darwin.openTerminalCMD.replace('%CMD%',`clear && ${echoArgs} ${fullCMD}`);
            fullCMD = newCMD;
            console.log(fullCMD);
        }
            
        
        execSync(fullCMD);
    }

    readDir(path)
    {
        return fs.readdirSync(path);
    }

    parsePath(path)
    {
        return nodepath.parse(path);
    }

    humanFileSize(bytes, si = true) 
    {
        const thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
            return `${bytes} B`;
        }
        const units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        let u = -1;
        do {
            bytes /= thresh;
            u += 1;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return `${bytes.toFixed(1)} ${units[u]}`;
    }

    async checkPort(port)
    {
        const allowedApps = 
        [
            'vpnkit.exe',
            'com.docker.vpnkit',
            'com.docker.backend',
            'com.docker.backend.exe'
        ];

        const listApps = await find('port', port);
        let blocked = false;

        for(const app of listApps)
        {
            if(!allowedApps.includes(app.name))
                blocked = true;
        }
    
        return {
            listApps,
            portBlocked: blocked
        };
    }

    async getFreePort(...args)
    {
        return await fp.apply(this,args);
    }

}

export default osUtils;