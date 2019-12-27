/* eslint-disable react/jsx-no-undef */
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { SharedConsumer } from '../../Context/ContextAPI';

const drawerWidth = 240;
const styles = (theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    // width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  }
});

const Appbar = (props) =>
{
    const { classes } = props;
    return (
    <SharedConsumer>        
        {({ state }) => 
        (
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                <Typography variant="h6" noWrap style={{color:"white"}}>
                    {state.viewTitle}
                </Typography>
                </Toolbar>
            </AppBar>
        )}
    </SharedConsumer>
    )
}

export default withStyles(styles)(Appbar);