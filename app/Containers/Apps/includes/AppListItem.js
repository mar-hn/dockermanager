import React from 'react';

import {
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Avatar,
    IconButton,
    Switch,
    Tooltip,
    Menu,
    MenuItem,
    CircularProgress,
    Typography
} from  '@material-ui/core';

import HomeIcon from '@material-ui/icons/Home';
import AdminIcon from '@material-ui/icons/DeveloperBoard';
import MoreIcon from '@material-ui/icons/MoreVert'
import FolderIcon from '@material-ui/icons/Folder';

import DeleteConfirmationDialog from '../../../Components/Dialogs/DeleteAppConfirmationDialog';

class AppListItem extends React.Component 
{
    state = 
    {
        anchorEl: null,
        switchStatus: false,
        switchLoading: false,
        deleteDialog: false
    };

    componentDidMount()
    {
        const { app } = this.props;
        this.listenerId = `AppListItem-${app.Name}`;
        this.setState({switchStatus: this.getAppStatus()});
        
        plugins.docker.addEventListener(this.listenerId,this.appListener);
    }

    componentWillUnmount()
    {
        if(this.listenerId)
            plugins.docker.removeEventListener(this.listenerId);
    }        

    appListener = (event) =>
    {
        const { app, parent } = this.props;

        if(event.Actor.Attributes.name === app.Name.substring(1))
        {
            switch(event.status)
            {
                case "die":
                    this.setSwitchStatus(false);
                break;
                case "start":
                    this.setSwitchStatus(true);
                break;
                default:
            }
        }
    }
    
    setSwitchStatus(bFlag)
    {
        const { switchLoading } = this.state;

        if(!switchLoading)
            this.setState({ switchStatus: bFlag})
    }

    handleMoreClick = event => 
    {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleHomeClick = (url) =>
    {
        console.log('Opening: ' , url);
        utils.electron.openExternalLink(url);
    };

    handleStatusChange = async event => {        
        const { app } = this.props;
        const { checked } = event.target;
        const action = event.target.checked ? 'Stopping' : 'Starting';
        
        this.setState({switchLoading: true});
        const newState = {
            switchLoading: false,
            switchStatus: !checked
        };
        
        try {
            console.log(`[DEBUG] ${action} app ${app.Name}`);
            if(checked)
                await utils.apps.startApp(app.Id);
            else
                await utils.apps.stopApp(app.Id);

            newState.switchStatus = checked;
        } catch(ex)
        { 
            utils.electron.showError(`Error while ${action.toLowerCase()} app: ${app.Name}` ,ex);
            console.error(ex);
        }
      
        this.setState(newState);
    }

    handleDeleteConfirmationClick = async () =>
    {
        const {app, parent} = this.props;

        this.showDeleteDialog(false);

        this.setState({switchLoading: true});
        try {
            await utils.apps.removeApp(app.Id);
            parent.removeApp(app);
        }        
        catch(ex)
        {
            console.error('[ERROR] handleDeleteClick->',ex);
            utils.electron.showError('Error while deleting app',String(ex));
            this.setState({switchLoading: false});
        }
    }
    
    handleDeleteConfirmationClose = () =>
    {
        this.showDeleteDialog(false);
    }

    handleDeleteClick = async () => 
    {
        this.handleClose();
        this.showDeleteDialog(true);
    };

    handleEditClick = () =>
    {
        const { app, parent } = this.props;
        const { history } = parent.props;
        history.push(`/apps/edit?appName=${app.Name.substring(1)}`);
    }

    handleOutputClick = () =>
    {
        const { app, parent } = this.props;
        const { history } = parent.props;
        history.push(`/apps/output?appName=${app.Name.substring(1)}&appId=${app.Id}`);
    }

    handleClose = () => 
    {
        this.setState({ anchorEl: null });
    };

    getAppStatus = () =>
    {
        const {app} = this.props;
        return app.State.Running;
    }

    showDeleteDialog(bShow)
    {
        this.setState({deleteDialog:bShow});
    }

    getActionIcons = () =>
    {
        const {app} = this.props;
        const ImageName = app.Config.Image.toLowerCase();
        
        const virtualHost = utils.docker.getVHost(app.Config.Env);
        
        if(virtualHost === '')
            return null;

        const HomePageURL = utils.apps.getAppHomePageURL(ImageName,virtualHost);
        const AdminPageURL = utils.apps.getAppAdminPageURL(ImageName,virtualHost);

        return (
            <React.Fragment>
                { HomePageURL ?
                    <Tooltip title="Home Page">
                        <IconButton
                        onClick={() => this.handleHomeClick(HomePageURL)}
                        >
                            <HomeIcon/>
                        </IconButton>
                    </Tooltip>
                    : null
                }



                {AdminPageURL ?
                    <Tooltip title="Admin Page">
                        <IconButton
                        onClick={() => this.handleHomeClick(AdminPageURL)}
                        >
                            <AdminIcon/>
                        </IconButton>
                    </Tooltip>
                    : null
                }
                   
            </React.Fragment>      
        );
    }

    render()
    {
        const 
        { 
            anchorEl, 
            switchStatus, 
            switchLoading,
            deleteDialog 
        } = this.state;
        const { app } = this.props;
        
        return (
            <React.Fragment>
            <ListItem>
                <ListItemAvatar>
                    <Avatar>
                        {/* <FolderIcon /> */}
                        <img alt="" style={{width: '20px'}} src={utils.apps.getAppIcon(app.Config.Image)}/>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <a style={{color:'unset', opacity:'unset'}} onClick={this.handleOutputClick}>{app.Name.substring(1)}</a>
                    }
                    secondary= {
                        <React.Fragment>
                            {app.Config.Image}
                            <br/>
                            {(app.NetworkSettings.IPAddress != "" ? app.NetworkSettings.IPAddress : '-')}
                        </React.Fragment>
                    }
                />
                <ListItemSecondaryAction>
                    {switchLoading && <CircularProgress size={24} style={{verticalAlign: "middle"}} />}
                    <Switch
                        onChange={this.handleStatusChange}
                        checked={switchStatus}
                        disabled={switchLoading}
                        color="primary"
                    />
                     
                    {this.getActionIcons()}                    

                    <IconButton
                        onClick={this.handleMoreClick}
                    >
                        <MoreIcon/>
                    </IconButton>
                        
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={this.handleClose}
                    >
                        <MenuItem onClick={this.handleEditClick}>Edit</MenuItem>
                        <MenuItem onClick={this.handleOutputClick}>View Output</MenuItem>
                        <MenuItem onClick={this.handleDeleteClick}>Delete</MenuItem>
                    </Menu>                    
                    
                </ListItemSecondaryAction>
            </ListItem>
            <DeleteConfirmationDialog 
                open={deleteDialog} 
                app={app} 
                handleSubmit={this.handleDeleteConfirmationClick}
                handleClose={this.handleDeleteConfirmationClose}/>
            </React.Fragment>
        );
    }
}


export default AppListItem;