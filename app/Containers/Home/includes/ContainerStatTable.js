import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@material-ui/core';

import ContainerStatRow from './ContainerStatRow';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

const CustomTableCell = withStyles(theme => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

class ContainerStatTable extends React.Component
{
    state = 
    {
        containers: null,
        streamsList: {}
    }

    componentDidMount()
    {
        this.loadContainers();
        this.listenerId = `ContainerStatTable-Listener`;
        plugins.docker.addEventListener(this.listenerId,this.eventListener);
    }

    componentWillUnmount()
    {
      if(this.listenerId)
        plugins.docker.removeEventListener(this.listenerId);      
    }

    loadContainers()
    {
      dockerapi.listContainers((err, containers) =>
      {
          this.setState({containers});
      });    
    }

    eventListener = (event) =>
    {
        switch(event.status)
        {
          case "die":
          case "start":
            this.loadContainers();                  
          break;

          default:
        }
    }
    
    render()
    {
        const { classes } = this.props;
        const { containers } = this.state;
        let containerList =
        (
          <TableRow className={classes.row}>
            <CustomTableCell colSpan={6} align="center">Loading...</CustomTableCell>
          </TableRow>
        );

        if(containers)
        {
            if(!lodash.isEmpty(containers))
            {
                containerList = Object.keys(containers).map( (key,index) => 
                {                    
                    return (
                      <ContainerStatRow 
                        key={containers[key].Id}
                        cont={containers[key]} 
                        classes={classes}
                        />
                    );
                } );
            }
            else
            {
              containerList = (
                <TableRow className={classes.row}>
                  <CustomTableCell colSpan={6} align="center">No containers/apps are running</CustomTableCell>
                </TableRow>
              )
            }
        }

        return (
          <React.Fragment>
            <Paper className={classes.root}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <CustomTableCell>Container/App Name</CustomTableCell>
                    <CustomTableCell align="right">CPU %</CustomTableCell>
                    <CustomTableCell align="right">Mem usage / Limit</CustomTableCell>
                    <CustomTableCell align="right">Mem %</CustomTableCell>
                    <CustomTableCell align="right">Net I/O</CustomTableCell>
                    <CustomTableCell align="right">PIDS</CustomTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {containerList}
                </TableBody>
              </Table>
            </Paper>
          </React.Fragment>
        );       
    }
}

export default withStyles(styles)(ContainerStatTable);