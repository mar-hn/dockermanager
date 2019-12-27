import React, { PureComponent } from 'react';
import SimpleReactValidator from 'simple-react-validator';

import { 
    IconButton,
    Grid,
    TextField, 
    Select, 
    MenuItem, 
    InputLabel, 
    Button,
    Stepper,
    Step
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AccountCircle from '@material-ui/icons/AccountCircle';

import AddFloatingButton from '../../Components/Buttons/FloatingButton/FloatingButton';
import GridInput from '../../Components/GridInput/GridInput';

const validator = new SimpleReactValidator();

class ContainerAddPage extends PureComponent
{
    state = {
        dockerConts: null,
        dockerImages: null,
        containerName: '',
        selectedImage: '',
        evars: [{key: '', val: ''}],
        ports: [{dport: '', hport: ''}],
        volumes: [{dpath: '', hpath: ''}]
    };
        
    componentDidMount()
    {
        //this.props.globalActions.app.setViewTitle('Add new container');
        dockerapi.listImages((err, imgs) =>
        {
            console.log(imgs);
            this.setState({dockerImages:imgs});
        });
    }

    handleChangeCNameInput = (event) =>
    {
        this.setState({containerName: event.target.value});
    }

    handleClickFloatingAddButton = () =>
    {
        this.props.history.push("/containers/add");
    };

    handleClickAddEnvButton = () =>
    {
        const evars = [...this.state.evars];
        evars.push({key: "", val: ""})
        this.setState({evars});
    };


    handleClickAddPortButton = () =>
    {
        const ports = [...this.state.ports];
        ports.push({dport: "", hport: ""})
        this.setState({ports});        
    }

    handleClickAddVolumeButton = () =>
    {
        const volumes = [...this.state.volumes];
        volumes.push({dpath: "", hpath: ""})
        this.setState({volumes});
    }

    handleChangeImgSelect = (event) =>
    {
        this.setState({[event.target.name] : event.target.value});
    }

    handleClickCreateButton = () =>
    {
        if( validator.allValid() ){
            alert('You submitted the form and stuff!');
        } else {
            validator.showMessages();
            // rerender to show messages for the first time
            this.forceUpdate();
        }        
        
        return;
        
        // $TODO
        const dockerImage = lodash.find(this.state.dockerImages, {Id: this.state.selectedImage});
        if(!dockerImage)
        {
            console.error('Invalid Image');
            return;
        } 

        const dockerEnv = this.state.evars.reduce((acc, current) =>
        {
            const CurrentDEnv = {
                key: current.key.trim(),
                val: current.val.trim()
            };

            if(CurrentDEnv.key != '')
                acc.push(`${CurrentDEnv.key}=${CurrentDEnv.val}`);

            return acc;
        }, []);

        const dockerPorts = this.state.ports.reduce((acc, current) =>
        {
            const CurrentDPort = current.dport.trim();
            const CurrentHPort = current.hport.trim();

            if(CurrentDPort != '' && !isNaN(CurrentDPort))
            {
                acc.ExposedPorts[`${CurrentDPort}/tcp`] = {}
                
                if(CurrentHPort != '' && !isNaN(CurrentHPort))
                    acc.PortBindings[`${CurrentDPort}/tcp`] = [ { HostPort: CurrentHPort } ];
            }

            return acc;
        }, {ExposedPorts:{},PortBindings:{}});
        
        const dockerVolumes = this.state.volumes.reduce((acc, current) =>
        {
            const CurrentDPath = current.dpath.trim();
            const CurrentHPath = current.hpath.trim();

            if(CurrentDPath != '')
            {
                acc.Volumes[`${CurrentDPath}`] = {}

                if(CurrentHPath != '')
                    acc.Binds.push(`${CurrentDPath}:${CurrentHPath}`);
            }

            return acc;
        }, {Volumes:{},Binds:[]});

        // console.log('DockerEnv',dockerEnv);
        // console.log('DockerVolumes',dockerVolumes);
        // console.log('DockerPorts:',dockerPorts);
        const opts = {
            name: this.state.containerName,
            Image: dockerImage.RepoTags[0],
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            Env: dockerEnv,
            ExposedPorts: dockerPorts.ExposedPorts,
            Volumes: dockerVolumes.Volumes,
            HostConfig: 
            {
                Binds: dockerVolumes.Binds,
                PortBindings: dockerPorts.PortBindings
            }
        };

        console.log(opts);

        dockerapi.createContainer(opts).then((cont) =>
        {
            console.log('Container created succesfully');
        }).catch((err) => 
        {
            console.error('Error while creating container',err)
        });
    }

    render() 
    {
        let imgList = null;
        if(this.state.dockerImages)
        {
            imgList = this.state.dockerImages.map((img, index) =>
            {
                return (
                    <MenuItem key={img.Id} value={img.Id}>{img.RepoTags[0]}</MenuItem>
                );
            });
        }
        


        return (
            <React.Fragment>
                <p>Adding new Docker container</p>
                <Grid container spacing={8} alignItems="flex-end">
                    <Grid item>
                        <InputLabel>Container Name: </InputLabel>
                        <input onChange={this.handleChangeCNameInput} value={this.state.containerName} label="Container Name" />
                        {validator.message('title', this.state.containerName, 'required|alpha_num_dash')}
                    </Grid>
                </Grid>

                <InputLabel htmlFor="selectedImage">Docker Image: </InputLabel>
                <Select
                    value={this.state.selectedImage}
                    onChange={this.handleChangeImgSelect}
                    style={{width:300}}
                    displayEmpty
                    inputProps={{
                    name: 'selectedImage',
                    id: 'selectedImage',
                    }}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {imgList}
                </Select>



                <p>Environment Variables:  <IconButton onClick={this.handleClickAddEnvButton}><AddIcon/></IconButton></p>
                <div>
                    <GridInput
                        labels={['Key','Values']}                        
                        parent={this}
                        stateKey='evars'
                        data={this.state.evars}
                        inputHandlers =
                        {{
                            key: { type: 'text'},
                            val: { type: 'text' }
                        }}
                    />
                </div>
                <p>Ports: <IconButton onClick={this.handleClickAddPortButton}><AddIcon/></IconButton></p>
                <div>
                    <GridInput
                        labels={['Container Port','Host Port']}                        
                        parent={this}
                        stateKey='ports'
                        data={this.state.ports}
                        inputHandlers =
                        {{
                            dport: { type: 'number' },
                            hport: { type: 'number' }
                        }}
                    />
                </div>

                <p>Volumes: <IconButton onClick={this.handleClickAddVolumeButton}><AddIcon/></IconButton></p>
                <GridInput
                        labels={['Container Path','Host Path']}                        
                        parent={this}
                        stateKey='volumes'
                        data={this.state.volumes}
                        inputHandlers =
                        {{
                            dpath: { type: 'text' },
                            hpath: { type: 'text' }
                        }}
                    />    
                    
                <Grid container spacing={8} alignItems="flex-end">
                    <Grid item>
                        <InputLabel>URL: </InputLabel>
                        <input onChange={this.handleChangeCNameInput} value={this.state.containerName} label="Container Name" />
                    </Grid>
                </Grid>
                <Button variant="contained" color="primary" onClick={this.handleClickCreateButton}>
                    Create
                </Button>
            </React.Fragment>
        )
    }
}
export default ContainerAddPage;