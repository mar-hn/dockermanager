import React from 'react';
import { 
    Paper, 
    Typography, 
    Select, 
    FormControl, 
    InputLabel, 
    MenuItem, 
    Grid, 
    TextField,
    Divider,
    Button
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
      },
    select: {
        fontSize: 12
    }
});

class SettingsPage extends React.Component
{
    themesTypes = 
    [
        {value: 'light', label: 'Light'},
        {value: 'dark', label: 'Dark'}
    ];
    availableColors = 
    [
        {value: '#3f51b5', label: 'Blue'},
        {value: '#b71c1c', label: 'Red'},
        {value: '#4a148c', label: 'Purple'},
        {value: '#1b5e20', label: 'Green'},
        {value: '#212121', label: 'Black'},
        {value: '#757575', label: 'Grey'},        
    ];

    state = 
    {
        nginxCertsFolderPath: utils.electron.config.get('nginxCertsFolderPath'),
        nginxKeyFilePath: utils.electron.config.get('nginxKeyFilePath')
    };

    componentDidMount()
    {
        const { globalActions } = this.props;
        globalActions.setViewTitle('Settings');

    }

    handleThemeTypeChange = (e) =>
    {
        const {globalState, globalActions} = this.props;
        const theme = {...globalState.theme};
        theme.palette.type = e.target.value;
        globalActions.setTheme(theme);

    }

    handlePrimaryColorChange = (e) =>
    {
        const {globalState, globalActions} = this.props;
        const theme = {...globalState.theme};
        theme.palette.primary.main = e.target.value;
        globalActions.setTheme(theme);
    }

    handleSecondaryColorChange = (e) =>
    {
        const {globalState, globalActions} = this.props;
        const theme = {...globalState.theme};
        theme.palette.secondary.main = e.target.value;
        globalActions.setTheme(theme);        
    }

    handleCertsChange = (e) =>
    {
        this.setState({nginxCertsFolderPath: e.targe.value});
    }

    handleKeyFileChange = (e) =>
    {
        this.setState({nginxKeyFilePath: e.targe.value});
    }

    handleSaveClick = () =>
    {
        const {globalState, enqueueSnackbar} = this.props;
        const {nginxCertsFolderPath,nginxKeyFilePath} = this.state;
        utils.electron.config.set("theme",globalState.theme);
        utils.electron.config.set("nginxCertsFolderPath",nginxCertsFolderPath);
        utils.electron.config.set("nginxKeyFilePath",nginxKeyFilePath);

        console.log('[DEBUG] Config saved!');
        enqueueSnackbar(`Settings Saved`, {variant: 'success'});
    }


    render()
    {
        const {classes, globalState} = this.props;

        return (
            <Paper className={classes.root} elevation={3}>
                <Typography variant="h6">
                    Basic Settings
                </Typography>
                <Typography variant="subtitle1">
                    Theme
                </Typography>
                <Divider/>
                <div className={classes.margin}>
                    <Grid container spacing={8} alignItems="flex-end">
                        <Grid item>
                            <Typography variant="subtitle1">
                                Theme Type:
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Select
                                value={globalState.theme.palette.type}
                                onChange={this.handleThemeTypeChange}
                                fullWidth
                                className={classes.select}
                            >
                            {this.themesTypes.map( (obj,index) => (
                                <MenuItem key={`theme-${index}`} value={obj.value}>{obj.label}</MenuItem>
                            ))}
                            </Select>
                        </Grid>
                        {/*  --------  */}
                    </Grid>
                    <Grid container spacing={8} alignItems="flex-end">
                        <Grid item>
                            <Typography variant="subtitle1">
                                Primary Color:
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Select
                                value={globalState.theme.palette.primary.main}
                                onChange={this.handlePrimaryColorChange}
                                fullWidth
                                className={classes.select}
                            >
                                {this.availableColors.map( (obj,index) => (
                                <MenuItem key={`theme-${index}`} value={obj.value}>{obj.label}</MenuItem>
                            ))}
                            </Select>
                        </Grid>
                        {/*  --------  */}
                    </Grid>
                    <Grid container spacing={8} alignItems="flex-end">
                        <Grid item>
                            <Typography variant="subtitle1">
                                Secondary Color:
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Select
                                value={globalState.theme.palette.secondary.main}
                                onChange={this.handleSecondaryColorChange}
                                fullWidth
                                className={classes.select}
                            >
                            {this.availableColors.map( (obj,index) => (
                                <MenuItem key={`theme-${index}`} value={obj.value}>{obj.label}</MenuItem>
                            ))}
                            </Select>
                        </Grid>
                        {/*  --------  */}
                    </Grid>                    
                </div>

                <Typography variant="subtitle1" style={{marginTop: 10}}>
                    Advanced
                </Typography>
                <Divider/>
                <Grid container spacing={8} alignItems="flex-end">
                    <Grid item>
                        <Typography variant="subtitle1">
                            Nginx Certs Folder:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <TextField onChange={this.handleCertsChange}/>
                    </Grid>
                    {/*  --------  */}
                </Grid>
                <Grid container spacing={8} alignItems="flex-end">
                    <Grid item>
                        <Typography variant="subtitle1">
                            Nginx Key File:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <TextField onChange={this.handleKeyFileChange}/>
                    </Grid>
                    {/*  --------  */}
                </Grid>
                <div></div>
                <div style={{textAlign:"right"}}>
                    <Button variant="contained" className={classes.button} onClick={this.handleSaveClick} >
                        Save
                    </Button>        
                </div>
                
            </Paper>
        );
    }
}

export default withSnackbar(withStyles(styles)(SettingsPage));