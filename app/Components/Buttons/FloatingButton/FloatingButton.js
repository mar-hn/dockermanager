import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Fab } from '@material-ui/core';


const styles = theme => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },  
});

function FloatingActionButtons(props) {
  const { classes } = props;
  return (
    <div>
      <Fab color="primary"
        color="primary"
        className={classes.fab}
        onClick={props.clicked}>
        {props.icon}
      </Fab>
    </div>
  );
}

export default withStyles(styles)(FloatingActionButtons);