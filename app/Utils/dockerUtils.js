const http = require('http');

class dockerUtils 
{    
    async extendContainers(containers)
    {
        if(!containers)
            return null;

        const extended = [];
        
        for(const cont of containers)
        {
            extended.push(await this.extendContainer(cont));
        }

        return extended;
    }

    async extendContainer(cont)
    {
        const container = await dockerapi.getContainer(cont.Id);
        return await container.inspect(cont.Id);
    }

    async getExtendedImages(images)
    {
        const extended = [];

        for(const img of images)
        {
            if(img.RepoTags && img.RepoTags.length > 0 && img.RepoTags[0] !== "<none>:<none>")
                extended.push(await this.getExtendedImage(img.RepoTags[0]));
        }

        return extended;
    }
    
    async getExtendedImage(name)
    {
        const image = await dockerapi.getImage(name);
        return await image.inspect();
    }

    getVHost(env)
    {
        const virtualHostEnv = env.find( item => item.includes('VIRTUAL_HOST='));
        return virtualHostEnv ? virtualHostEnv.split('=')[1].replace(/['"]+/g, '') : '';
    }

    getContainerDatabyId(id)
    {
        const opts = {
            "limit": 1,
            "filters": `{"id": ["${id}"]}`,
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

    // Temporary solution on windows. Maybe someday they fix it on dockerode
    pullImage(image, onFinishAction = () => {}, onProgressAction = () => {})
    {
        const options = {
            socketPath: '//./pipe/docker_engine',
            path: `/v1.37/images/create?fromImage=${encodeURIComponent(image)}`,
            method: 'POST',
        };

        const clientRequest = http.request(options, (res) =>
        {
            console.log(`STATUS: ${res.statusCode}`);
            res.setEncoding('utf8');
            res.on('data', json => 
            {
                let data = {};
                let arrData = [];        
                try {
                    arrData = String(json).split('\n').filter(item => item !== "");
                    data = JSON.parse(`[${arrData.join(',')}]`);
                    data.forEach(e => 
                    {
                        onProgressAction(e);
                    });                    
                }catch(ex)
                {
                    console.log(data);
                    console.log(arrdata);
                    console.error('[ERROR] dockerUtils->pullImage():',ex);
                }
            });
            res.on('error', data => onFinishAction(data,[]));
            res.on('end', data => onFinishAction(null,data));
        });
        clientRequest.end();
    }
    
}


export default dockerUtils;