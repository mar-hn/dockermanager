import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ContainerStatTable from './includes/ContainerStatTable';
import DockerEventsLog from './includes/DockerEventsLog';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

class Home extends React.Component
{
  componentDidMount()
  {
    const { globalActions } = this.props;
    globalActions.setViewTitle('Home');
  }

    render()
    {
        return (
          <React.Fragment>
            <Typography variant="h5">
              Apps Statistics
            </Typography>
            <ContainerStatTable/>
            
            <Typography variant="h5" style={{marginTop:40,marginBottom:20}}>
              Docker Event Log
            </Typography>
            <DockerEventsLog/>
          </React.Fragment>
        );       
    }
}

export default withStyles(styles)(Home);