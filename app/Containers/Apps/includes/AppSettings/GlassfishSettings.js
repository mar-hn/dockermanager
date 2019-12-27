/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { 
    Typography, 
    TextField,
    IconButton,
    Tooltip
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import {
    // Archive as DownloadIcon,
    // Unarchive as UploadIcon
    SaveAlt as DownloadIcon,
    Publish as UploadIcon,
    FolderOpen

} from '@material-ui/icons';
import { withSnackbar } from 'notistack';
import { TextValidator } from 'react-material-ui-form-validator';

import NginxSettings from './NginxSettings';


const styles = () => ({
    button: {
    },
    input: {
      display: 'none',
    },
  });

class GlassfishSettings extends React.Component
{

    handleUploadClick =  async () =>
    {   
        const { parent, enqueueSnackbar } = this.props;
        const container = dockerapi.getContainer(parent.state.appCont.Id);

        const path = utils.electron.showOpenDialog({
            title: 'Choose the domain.xml to upload',
            filters: [{ name: 'XML Files', extensions: ['xml'] }],
            properties: ['openFiles','treatPackageAsDirectory']
        });
        
        if( !path || path.length < 1)
            return;

        try{
            const userDirectory = utils.os.getDir(path[0]);
            const userFileName = utils.os.getFileName(path[0]);
            const Mount = parent.state.appCont.Mounts.filter(item => item.Destination.endsWith('/domains'));
            if(Mount.length < 1) throw(new Error('Path to server.xml was not found'));
            const domainPath = Mount[0].Destination;
            const domainXMLPath = `${domainPath}/domain1/config/`
                
            const stream = await utils.os.packFileToStream(userDirectory,userFileName,'domain.xml');
            await container.putArchive(stream,
            {
                path: domainXMLPath
            });
            
            enqueueSnackbar(`Successfully uploaded XML to Container`, {variant: 'success'});
        }catch(ex)
        {
            console.error('[ERROR] handleDownloadClick->',ex);
            utils.electron.showError('Error while updating xml',ex);
        }

        console.log(path);
    }

    handleDownloadClick = async () =>
    {
        const { parent, enqueueSnackbar } = this.props;
        const container = dockerapi.getContainer(parent.state.appCont.Id);

        const path = utils.electron.showSaveDialog({
            title: 'Choose where to save the domain.xml',
            filters: [{ name: 'XML Files', extensions: ['xml'] }]        
        });

        if(!path || path.length < 1)
            return;
        
        try{
            const userDirectory = utils.os.getDir(path);
            const userFileName = utils.os.getFileName(path);
            const Mount = parent.state.appCont.Mounts.filter(item => item.Destination.endsWith('/domains'));
            if(Mount.length < 1) throw(new Error('Path to server.xml was not found'));
            const domainPath = Mount[0].Destination;
            const domainXMLPath = `${domainPath}/domain1/config/domain.xml`
            const tarFile = await container.getArchive({path:domainXMLPath});
            
            await utils.os.extractFile(tarFile,'domain.xml',userDirectory,userFileName);
            enqueueSnackbar(`Stored XML to ${path}`,{variant: 'info'});
        } catch (ex)
        {
            console.error('[ERROR] handleDownloadClick->',ex);
            utils.electron.showError('Error while getting xml',ex);
        }
    }

    handleBrowseClick = () =>
    {
        const {parent} = this.props;

        const path = utils.electron.showOpenDialog({
            title: 'Choose the Project root directory',
            defaultPath: parent.state.config.projectPath,
            properties: ['openDirectory','createDirectory']
        });
        
        if( !path || path.length < 1)
            return;

        parent.updateConfigKey('projectPath',path[0]);
        parent.projectPathInput.validate(path[0]);
    }


    render()
    {
        const { classes, parent } = this.props;
        const isEdit = window.location.hash.includes('/apps/edit');
        const domainPath = parent.state.appCont ? parent.state.appCont.Mounts[0].Destination : '';
        const domainXMLPath = `${domainPath}/domain1/config/domain.xml`

        return (
            <React.Fragment>
                <NginxSettings parent={parent} config={parent.state.config} />                
                {/* <TextValidator
                    ref={(r) => { parent.projectPathInput = r }}
                    name="projectPath"
                    onChange={parent.handleInputConfigChange}
                    onBlur={parent.handleInputBlur}
                    style={{marginTop:"10px", maxWidth:"500px"}}
                    label="Project Path"
                    value={parent.state.config.projectPath || ''}
                    validators={['required','isGlassfishProject']}
                    errorMessages={['This field is required','Directory is not a glassfish project']}
                    InputLabelProps={{shrink: true}}
                    fullWidth
                />
                <Tooltip title="Browse">
                    <IconButton 
                        aria-label="Browse" 
                        className={classes.margin} 
                        style={{marginTop:"20px"}}
                        onClick={this.handleBrowseClick}>
                        <FolderOpen fontSize="small" />
                    </IconButton>
                </Tooltip>
                <br/> */}
                {
                    isEdit ?
                    <React.Fragment>
                        <Typography variant="subtitle1" style={{marginTop:"10px"}}>
                            Glassfish
                        </Typography>                                              
                        <TextField
                            style={{marginTop:"10px", maxWidth:"500px"}}
                            label="Domain XML Path"
                            value={domainXMLPath}
                            fullWidth
                            disabled
                        />
                        <Tooltip title="Download">
                            <IconButton 
                                aria-label="Download" 
                                className={classes.margin} 
                                style={{marginTop:"20px"}}
                                onClick={this.handleDownloadClick}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Upload">
                            <IconButton 
                                aria-label="Upload" 
                                className={classes.margin} 
                                style={{marginTop:"20px"}}
                                onClick={this.handleUploadClick}>
                                <UploadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>                    
                    </React.Fragment>
                    : null
                }
    
            </React.Fragment>
        );
    }

}

export default withSnackbar(withStyles(styles)(GlassfishSettings));