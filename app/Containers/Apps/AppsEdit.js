/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React from 'react';
import AppSettings from './includes/AppSettings';
import AppEditor from './includes/AppEditor';

class AppsEdit extends React.PureComponent
{
    handleMount = (component) =>
    {
        const { location } = this.props;
        const params = new URLSearchParams(location.search); 
        const appId = params.get('appName');         

        utils.docker.getContainerByName(appId).then( async (cont) =>
        {
            const appType = utils.apps.getAppType(cont.Image);
            const extendedCont = await utils.docker.extendContainer(cont);
            const vhost = utils.docker.getVHost(extendedCont.Config.Env)

            console.log(extendedCont);
            component.setState({
                appId,
                baseImage: cont.Image,                
                AppSettingsComponent: AppSettings[appType],                
                config: 
                {
                    vhost: utils.apps.getVirtualHostURL(vhost),
                    vports: utils.apps.getAppVPortsFromVHost(vhost),
                    projectPath: utils.apps.getProjectPath(extendedCont.Config.Env)
                },
                appCont: extendedCont
            });
        });
    }
    
    handleSave = async (data) =>
    {
        const {appId, baseImage, config, appCont} = data;
        const { history } = this.props;

        const oldVhost = utils.docker.getVHost(appCont.Config.Env)
        const oldVhostURL = utils.apps.getVirtualHostURL(oldVhost);     

        try {
            const container = await utils.apps.updateApp(appCont, appId, baseImage, config);
            console.log("[INFO] Container succesfully updated.",container);

            await utils.os.updateHost(oldVhostURL,config.vhost);
            console.log(`[INFO] VirtualHost succesfully updated ${oldVhostURL}->${config.vhost}`);

            history.push("/apps");
        } catch(ex)
        {
            console.error('[ERROR] Edit-> handleSaveClick() -> ',ex);
            utils.electron.showError('Error while updating app',ex);
            return false;
        } 

        return true;
    }

    render()
    {
        return <AppEditor
                    title="Edit App Instance"
                    onMount={this.handleMount}
                    onSave={this.handleSave}
                    lockData/>
    }
}

export default AppsEdit;
