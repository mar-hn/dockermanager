import React from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import materialRed from '@material-ui/core/colors/red';

import { 
    ValidatorForm, 
    TextValidator
} from 'react-material-ui-form-validator';

const styles = theme => ({
    btnRed: {
      color: theme.palette.getContrastText(materialRed[500]),
      backgroundColor: materialRed[500],
      '&:hover': {
        backgroundColor: materialRed[700],
      },
    }
  });


class AddPortDialog extends React.Component {

    state =
    {
        portNumber: 8080,
        appProtocol: 'http'
    }

    handleProtocolChange = (e) =>
    {
        this.setState({appProtocol: e.target.value});
    }

    handlePortChange = (e) =>
    {
        this.setState({portNumber: e.target.value});
    }

    handleInputBlur = (e) =>
    {
        this[`${e.target.name}`].validate(e.target.value);
    }

    validateForm = (e) =>
    {
        const { handleSubmit } = this.props;

        if(this.portMapForm.isFormValid())
            handleSubmit(this.state)
    }


    render() {
        // const { classes } = this.props;
        const {open, handleClose} = this.props;
        const { portNumber, appProtocol } = this.state;

        return (
            <Dialog
            open={open}
            onClose={handleClose}
            scroll="paper"
            aria-labelledby="scroll-dialog-title"
            >
            <ValidatorForm
                ref={(r) => { this.portMapForm = r }}
                onSubmit={() => {}}
                instantValidate>
                <DialogTitle id="scroll-dialog-title">Adding new app port</DialogTitle>
                <DialogContent>
                    <TextValidator
                        style={{width:100}}
                        ref={(r) => { this.portInput = r }}
                        onBlur={this.handleInputBlur}
                        onChange={this.handlePortChange}
                        name="portInput"
                        value={portNumber}
                        validators={['minNumber:0','isNumber','required']}
                        errorMessages={['']}
                        inputProps={{maxLength: 5}}
                    />
                    <Select
                        name="appProtocol"
                        value={appProtocol}
                        onChange={this.handleProtocolChange}>
                    <MenuItem value="http">HTTP</MenuItem>
                    <MenuItem value="https">HTTPS</MenuItem>
                    <MenuItem value="tcp">TCP</MenuItem>
                </Select>        
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} 
                            color="primary">
                    Cancel
                    </Button>
                    <Button onClick = {this.validateForm}
                            variant="contained" 
                            color="primary"
                            >
                    Add
                    </Button>
                </DialogActions>
            </ValidatorForm>
            </Dialog>
        );
    }
}

export default withStyles(styles)(AddPortDialog);