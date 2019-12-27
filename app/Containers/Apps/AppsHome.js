import React from 'react';
import {
    Grid,
    Typography,
    List
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import AppListItem from './includes/AppListItem';
import AddFloatingButton from '../../Components/Buttons/FloatingButton/FloatingButton';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  listContainer: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
  },
  messageText: {
      marginLeft: '10px',
      fontSize: '14px'
  }
});

class AppsHome extends React.Component {
    state = {
        dockerApps: null
    };

    componentDidMount()
    {
        const { globalActions } = this.props;
        globalActions.setViewTitle('Apps');
                
        this.loadApps();
        this.listenerId = `AppsHome-Listener`;
        plugins.docker.addEventListener(this.listenerId,this.eventListener);
    }

    componentWillUnmount()
    {
      if(this.listenerId)
        plugins.docker.removeEventListener(this.listenerId);      
    }
    
    eventListener = (event) =>
    {
        switch(event.status)
        {
            case "create":
            case "destroy":
                this.loadApps();                  
            break;

            default:
        }
    }
    
    loadApps()
    {
        dockerapi.listContainers({all:true},async (err, containers) =>
        {          
            if(err)
            {
                console.error(err);
                return;
            }

            const filteredContainers = containers.filter(cont => cont.Names[0] !== `/${utils.const.proxyName}`);
            const dockerApps = await utils.docker.extendContainers(filteredContainers);
            this.setState({dockerApps});
        });
    }

    removeApp(app)
    {
        const { state } = this;
        const dockerApps = state.dockerApps.filter(item => item !== app);
        this.setState({dockerApps});
    }

    handleClickFloatingAddButton = () =>
    {
        const {history} = this.props;
        history.push("/apps/add");
    };
    
    
    render() 
    {
        const { classes } = this.props;
        const { dockerApps } = this.state;
        let AppList = (<Typography variant="caption" className={classes.messageText}>Loading...</Typography>);
        if(dockerApps)
        {
            AppList = dockerApps.map(app => <AppListItem key={app.Id} app={app} parent={this}/>);
            if(AppList.length < 1)
                AppList = (<Typography variant="caption" className={classes.messageText}>No apps found. Click on the + button to add one.</Typography>);
        }

        return (
        <div className={classes.root}>
            <Grid container spacing={16}>          
            <Grid item xs={12}>
                <Typography variant="h6" className={classes.title}>
                Apps
                </Typography>
                <div className={classes.listContainer}>
                <List>
                    {AppList}                              
                </List>
                </div>
            </Grid>
            </Grid>
            
            <AddFloatingButton
                icon={<AddIcon />}
                clicked={this.handleClickFloatingAddButton}/>
        </div>
        );
    }
}

export default withStyles(styles)(AppsHome);