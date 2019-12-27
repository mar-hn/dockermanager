import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withStyles } from '@material-ui/core/styles';
import materialRed from '@material-ui/core/colors/red';

const styles = theme => ({
    btnRed: {
      color: theme.palette.getContrastText(materialRed[500]),
      backgroundColor: materialRed[500],
      '&:hover': {
        backgroundColor: materialRed[700],
      },
    }
  });


class DeleteDialog extends React.Component {
  render() {
    const { classes } = this.props;
    const {open, handleSubmit, handleClose, app} = this.props;

    return (
        <Dialog
          open={open}
          onClose={handleClose}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
        >
          <DialogTitle id="scroll-dialog-title">Delete {app.Name} app instance</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete app {app.Name}? <br/>
              You will not be able to recover any data after this.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} 
                    color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} 
                    variant="contained" 
                    color="secondary"
                    className={classes.btnRed}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
    );
  }
}

export default withStyles(styles)(DeleteDialog);