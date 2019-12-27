import React from 'react';
// Material UI
import {
    Paper,
    Typography,
    MenuItem,
    Button,
    InputAdornment,
    Grow
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// Icons
import {
    Code,
    DeviceHub
} from '@material-ui/icons';
// Validator
import { 
    ValidatorForm, 
    TextValidator
} from 'react-material-ui-form-validator';

import AppSettings from './AppSettings';

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },    
    margin: {
        margin: theme.spacing.unit,
    },
    toplabels: {
        marginLeft: "-30px"        
    },
    icon: {
        marginTop: "20px"
    },
    header: {
        marginBottom: "10px"
    },
    input: {
        marginTop: "10px"
    }
});

class AppEditor extends React.Component
{
    state = 
    {
        appId:'',
        baseImage:'',
        dockerImages: null,
        AppSettingsComponent:null,
        config: {},
        loading: false
    }

    componentDidMount()
    {
        ValidatorForm.addValidationRule('isGlassfishProject', (value) => {
            return utils.os.fileExists(`${value}/build.xml`);
        });

        const {onMount} = this.props;
        onMount(this);
    }
    

    updateConfigKey(key,value)
    {
        const { state } = this;
        const config = {...state.config};
        config[key] = value;

        this.setState({config});        
    }

    handleInputConfigChange = (e) =>
    {
        this.updateConfigKey(e.target.name,e.target.value);
    }

    handleInputBlur = (e) =>
    {
        this[`${e.target.name}Input`].validate(e.target.value);
    }

    handleInputChange = (e) =>
    {        
        this.setState({[e.target.name]:e.target.value});
    }

    handleChangeImgSelect = (e) =>
    {
        const { config } = this.state;
        const AppType = e.target.value ? utils.apps.getAppType(e.target.value) : '';
        let Settings = null;
        
        if(AppType)
            Settings = AppSettings[AppType];

        const newconfig = {...config};
        newconfig.vports = utils.apps.getAppVPorts(e.target.value);

        this.setState({
            baseImage: e.target.value,
            AppSettingsComponent: Settings,
            config: newconfig
        });

    }

    handleSaveClick = async () =>
    {
        const {onSave} = this.props;
        this.showLoading(true);

        if(!await onSave(this.state))
            this.showLoading(false);
    }

    showLoading(bShow)
    {
        this.setState({loading:bShow});
    }

    render()
    {
        const { 
            dockerImages , 
            appId, 
            baseImage, 
            loading, 
            AppSettingsComponent
        } = this.state;
        const { classes, title, lockData } = this.props;
        
        let imgList = null;
        if(!lockData && dockerImages)
        {
            imgList = dockerImages.map((img) =>
            {
                let appSetting = null;
                if(img.RepoTags)
                    appSetting = utils.apps.getAppSettings(img.RepoTags[0]);

                if(appSetting)
                {
                    return (
                        <MenuItem key={img.Id} value={img.RepoTags[0]}>{img.RepoTags[0]}</MenuItem>
                    );
                }

                return null;
            });
        }
        
        return (
            <React.Fragment>
                <Paper className={classes.root} elevation={3}>
                    <Typography variant="h5" component="h3" className={classes.header}>
                        {title}
                    </Typography>

                    <ValidatorForm
                        onSubmit={this.handleSaveClick}
                        instantValidate={false}>

                        {/* App ID */}
                        <TextValidator
                            ref={el => {this.appIdInput = el}}
                            label="App ID"
                            onBlur={this.handleInputBlur}
                            onChange={this.handleInputChange}
                            name="appId"
                            value={appId}
                            validators={['required', 'minStringLength:3','matchRegexp:^[a-zA-Z0-9_.-]*$']}
                            errorMessages={['This field is required', 'Min 3 characters are needed','Id has invalid characters']}
                            fullWidth
                            disabled={loading || lockData}
                            className={classes.input}
                            InputLabelProps={{shrink: true}}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Code />
                                  </InputAdornment>
                                ),
                            }}
                        />
                        <br />

                        {/* Base Image Dropdown */}
                        <TextValidator
                            ref={el => {this.baseImageInput = el}}
                            label="App Base Image"
                            onBlur={this.handleInputBlur}
                            onChange={this.handleChangeImgSelect}
                            name="baseImage"
                            value={baseImage}
                            validators={['required']}
                            errorMessages={['This field is required']}
                            fullWidth
                            select={!lockData}
                            disabled={loading || lockData}
                            className={classes.input}
                            InputLabelProps={{shrink: true}}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DeviceHub />
                                  </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {imgList}                        
                        </TextValidator>
                        
                        {/* APP Settings section */}
                        <Grow in={Boolean(AppSettingsComponent)}>
                            <div>
                                {AppSettingsComponent ?
                                    <div style={{marginTop:"20px"}}>                                   
                                        <Typography variant="subtitle1" component="h3" style={{marginBottom: "10px"}}>
                                            App settings
                                        </Typography>
                                        <AppSettingsComponent parent={this}/>
                                    </div>
                                    : null
                                }
                            </div>
                        </Grow>

                        {/* Submit Button */}
                        <br />
                        <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            disabled={loading}>
                            Save
                        </Button>
                    </ValidatorForm>                    
                </Paper>     
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(AppEditor);
