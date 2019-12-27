import React from 'react';

// Core elements
import {
    InputAdornment, 
    Paper, 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody,
    IconButton,
    Typography,
    Select,
    MenuItem
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

// Icons
import {
    Delete, Add
} from '@material-ui/icons';

import { TextValidator } from 'react-material-ui-form-validator';
import AddPortDialog from '../../../../../Components/Dialogs/AddPortMappingDialog';


const styles = theme => ({
    portroot: {
      width: '100%',
      maxWidth: 450,
      marginTop: theme.spacing.unit * 3,
      overflowX: 'hidden',
    },
    porttable: {
      maxWidth: 100,
    },
    tablecell: {
        Width: "20px"
    },
    resize: {
        fontSize: 10,
        textAlign: 'center'
    },
    selectprot:{
        fontSize: 10,
        marginTop:'7px',
        marginRight:'-20px'
    }
  });


class NginxPortTable extends React.PureComponent
{
    state = {
        showAddPortDialog: false
    }

    // Port Mappings events/methods
    handleInputPortChange = (e) =>
    {
        const { parent } = this.props;
        const { config } = parent.state;
        const port = e.target.name.replace('port','');

        const vports = {...config.vports};
        vports[port].nginxPort = e.target.value;

        parent.updateConfigKey('vports',vports);
    }

    handleInputProtocolChange = (e) =>
    {
        const { parent } = this.props;
        const { config } = parent.state;
        const port = e.target.name.replace('prot','');

        const vports = {...config.vports};
        vports[port].nginxProtocol = e.target.value;

        parent.updateConfigKey('vports',vports);
    }

    handleDeletePortRowClick = (port) =>
    {
        const { parent } = this.props;
        const { config } = parent.state;
        const vports = {...config.vports};
        delete vports[port];
        parent.updateConfigKey('vports',vports);
    }

    handleAddPortRowClick = () =>
    {
        this.setState({showAddPortDialog: true});
    }

    handlePortDialogClose = () =>
    {
        this.setState({showAddPortDialog: false});
    }

    handlePortDialogSubmit = (data) =>
    {
        const { parent } = this.props;
        const { config } = parent.state;
        const vports = {...config.vports};

        console.log(data);

        if(data.portNumber in vports)
        {
            utils.electron.showError('Error while adding port mapping',`The port ${data.portNumber} is already being used on the app.`);
            return;
        }

        vports[data.portNumber] = 
        {
            nginxPort: "",
            nginxProtocol: data.appProtocol,
            appProtocol: data.appProtocol
        };

        parent.updateConfigKey('vports',vports);
        this.handlePortDialogClose();
    }

    // ===================================================      


    render()
    {
        const { parent, classes } = this.props;
        const { showAddPortDialog } = this.state;        
        const { vports } =  parent.state.config;
    
        let portrows = (
            <TableRow>
                <TableCell colSpan={4} align="center">
                    No ports mapped. Click on + to add one.
                </TableCell>
            </TableRow>
        );
        
        if(vports && !lodash.isEmpty(vports))
        {
            portrows = Object.keys(vports).map((key) =>
            (
                <TableRow key={`portcell-${key}`}>
                    <TableCell style={{width:"10px"}} component="th" scope="row">
                        {key}
                    </TableCell>
                    <TableCell style={{width:"10px"}}>
                    {
                        vports[key].nginxPort.length > 0 ?
                        <TextValidator
                                ref={(r) => { parent[`port${key}Input`] = r }}
                                onBlur={parent.handleInputBlur}
                                onChange={this.handleInputPortChange}
                                name={`port${key}`}
                                value={(vports[key].nginxPort)}
                                validators={['minNumber:0','isNumber','required']}
                                errorMessages={['']}
                                inputProps={{maxLength: 5}}
                                InputProps={{
                                    classes: { input: classes.resize,},
                                }}
                                disabled={parent.state.loading}
                        />
                        : "Any"
                    }                        
                    </TableCell>
                    <TableCell style={{width:"10px"}} padding="none">
                        {vports[key].appProtocol}
                    </TableCell>                                    
                    <TableCell style={{width:"10px"}}>
                    {
                        vports[key].appProtocol === "http" || vports[key].appProtocol === "https" ?
                        <Select
                            name={`prot${key}`}
                            value={vports[key].nginxProtocol}
                            onChange={this.handleInputProtocolChange}
                            className={classes.selectprot}>
                            <MenuItem value="http">HTTP</MenuItem>
                            <MenuItem value="https">HTTPS</MenuItem>
                        </Select>
                        :
                        vports[key].appProtocol
                    }
                                           
                    </TableCell>
                    <TableCell align="left" padding="none">
                        <IconButton onClick={() => {this.handleDeletePortRowClick(key)}}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </TableCell>
                </TableRow>
            ));
        }
    
        return (
            <React.Fragment>
                <div>
                <Typography variant="caption" style={{marginBottom: '-15px', marginTop: '20px'}}>
                    Port Mapping
                </Typography>
                <Paper className={classes.portroot}>
                    <Table className={classes.porttable}>
                        <TableHead>
                        <TableRow>
                            <TableCell>App Port</TableCell>
                            <TableCell>Nginx Port</TableCell>
                            <TableCell padding="none">App Protocol</TableCell>
                            <TableCell>Nginx Protocol</TableCell>
                            <TableCell align="left" padding="none">
                                <IconButton onClick={() => {this.handleAddPortRowClick()}}>
                                    <Add fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {portrows}
                        </TableBody>
                    </Table>
                    </Paper>                
                </div>
                <AddPortDialog 
                    open={showAddPortDialog} 
                    handleSubmit={this.handlePortDialogSubmit}
                    handleClose={this.handlePortDialogClose} />             
            </React.Fragment>
        );                
    }
}

export default withStyles(styles)(NginxPortTable);