import React from 'react';
import AppEditor from './includes/AppEditor';

class AppsAdd extends React.PureComponent
{
    handleMount = (component) =>
    {
        dockerapi.listImages(async (err, imgs) =>
        {            
            const images = await utils.docker.getExtendedImages(imgs);
            console.log(images);
            component.setState({dockerImages: images});
        });
    }

    handleSave = async (data) =>
    {
        const {appId, baseImage, config} = data;
        const { history } = this.props;
        let container = null;
        
        try {
            container = await utils.apps.createApp(appId, baseImage, config);
            console.log("[INFO] Container succesfully created.",container);

            await utils.os.addHost(config.vhost);
            history.push("/apps");
        } catch(ex)
        {
            if(container) 
            {
                console.log('[ROLLBACK] Deleting recent container...');
                await container.remove();
            }

            console.error('[ERROR] handleSaveClick() -> ',ex);
            utils.electron.showError('Error while creating app',ex);
            return false;
        }

        return true;
    }

    render()
    {
        return <AppEditor
                    title="Create new App Instance"
                    onMount={this.handleMount}
                    onSave={this.handleSave}/>
    }
}

export default AppsAdd;
