/* eslint-disable react/jsx-no-undef */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Drawer,
  Divider,
  Switch,
  List,
  Typography,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';

// Icons
import {
  Dashboard,
  DeviceHub,
  Apps,
  Settings,
  Close
} from '@material-ui/icons';

// Custom
import ListItemLink from '../ListItemLink/ListItemLink';
import routes from '../../Constants/routes.json'

import { SharedConsumer } from '../../Context/ContextAPI';


const drawerWidth = 240;
const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  labels: {
    marginLeft: 20,
    marginTop: 10
  }
});


class SideBar extends React.Component
{

  state = 
  {
    proxyLoading: false,
  };

  handleProxySwitchChange = event =>
  {    
    this.proxyToggle(event.target.checked)
  }

  async proxyToggle(switchStatus)
  {
    this.setState({proxyLoading:true});
    const nginxProxyContainer = await utils.docker.getContainerByName(utils.const.proxyName);
    try{
      if(switchStatus)
          await utils.apps.startApp(nginxProxyContainer.Id);
      else
          await utils.apps.stopApp(nginxProxyContainer.Id);
     
    } catch (ex)
    {
      console.error(ex);
      utils.electron.showError(`Error while ${switchStatus ? 'stopping' : 'starting'} proxy`, ex);
    }

    this.setState({proxyLoading:false});
  }

  handleProxyClick = async () =>
  {
    const AppName = utils.const.proxyName;
    const nginxProxyContainer = await utils.docker.getContainerByName(AppName);
    if(nginxProxyContainer)
    {
      const AppId = nginxProxyContainer.Id;
      const arrLocation = window.location.href.split("#");
      const newLocation = `${arrLocation[0]}#/apps/output?appName=${AppName}&appId=${AppId}`
      console.log('Navigating to:',newLocation);  
      window.location.href = newLocation;
    }
  }

  render()
  {
    const { classes } = this.props;

    return (
      <SharedConsumer>
      {({ state }) => 
      (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left">

            <div className={classes.toolbar} />
            <Divider />
            <List>
                <ListItemLink to={routes.HOME} primary="Home" icon={<Dashboard />} />
                <ListItemLink to={routes.IMAGES} primary="Images" icon={<DeviceHub />} />
                {/* <ListItemLink to={routes.CONTAINERS} primary="Containers" icon={<MoveToInbox />} /> */}
                <ListItemLink to={routes.APPS} primary="Apps" icon={<Apps />} />
            </List>
            <Divider />
            <List>
              <ListItemLink to={routes.SETTINGS} primary="Settings" icon={<Settings />} />
              {/* <ListItemLink to={routes.HOME} primary="Exit" icon={<Close />} />               */}
              <ListItem button onClick={() => { window.close()}}>
              <ListItemIcon><Close /></ListItemIcon>
              <ListItemText primary="Exit" />
            </ListItem>              
            </List>
            <Divider />
            <Typography className={classes.labels} variant="caption" color="textSecondary">
              Docker Status: <span>{state.dockerStatus}</span>
            </Typography>
            <Typography className={classes.labels} variant="caption" color="textSecondary">
            {
              state.nginxProxyStatus === "RELOADING" ?
              <div>
                Proxy Status: <span>RELOADING</span>
              </div>
              :
              <React.Fragment>
                  { state.nginxProxyStatus !== "NOT INSTALLED" &&  state.nginxProxyStatus !== "Unknown" ? 
                  <div style={{marginTop:"-15px"}}>
                    Proxy Status: <a style={{color:'unset', opacity:'unset'}} onClick={this.handleProxyClick}>{state.nginxProxyStatus}</a>
                    <Switch
                      checked={state.nginxProxyStatus === "ONLINE"}
                      value="proxyChecked"
                      color="primary"
                      disabled={this.state.proxyLoading}
                      onChange={this.handleProxySwitchChange}
                    /> 
                    
                  </div>
                  : 
                  <div>
                    Proxy Status: <span>{state.nginxProxyStatus}</span>
                  </div>
                  }                  
              </React.Fragment>
              
            }
            </Typography>

            
        </Drawer>  
      )}
      </SharedConsumer>
    );
  }
}

export default withStyles(styles)(SideBar);