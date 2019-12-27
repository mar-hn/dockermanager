/* eslint-disable react/no-danger */
import React from 'react';

// Material UI
import {
    Paper,
    Typography,
    Divider,
    IconButton,
    Badge
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// Icons
import {
    Code,
    Stop,
    // Launch,
    Replay,
    DeleteSweep,
    PlayArrow,
    KeyboardArrowDown,
    Error
} from '@material-ui/icons';

import Mousetrap from 'mousetrap';

// import brace from 'brace';
import AceEditor from 'react-ace';

import flatstr from 'flatstr';

import 'brace/mode/python';
import 'brace/theme/twilight';
import "brace/ext/language_tools";
import 'brace/ext/searchbox';

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    header: {
        marginBottom: "10px"
    },
    logPanel: {
        color: '#e6edf4',
        backgroundColor: '#212121',
        padding: '0.2rem 0.2rem 0rem 0.2rem',
    },
    logsBody: {
        padding: '1.2rem 1.2rem 2rem 1.2rem',
        overflow: 'auto',
        height: '70vh',
        fontSize: '12px',
        fontFamily: 'Menlo, Consolas, "DejaVu Sans Mono"',
        backgroundColor: 'black',
    },
    logsDivider: 
    {
        backgroundColor:'#757575'
    },
    iconButton:
    {
        color: '#e6edf4',
        '&:disabled': {
            color: '#a3a3a3',
          }        
    },
    logLine:
    {
        whiteSpace: 'nowrap'
    },
    logList:
    {
        overflowX: 'auto',
        outline: 'none'
    }
});

// const searchRegex = new RegExp('^.+Exception[^\n]+(\s+at .+)+','ig');
const searchRegex = /^.+.*Exception(:| |$)/g;

class AppsAdd extends React.PureComponent
{ 
    editorTail = true;
    
    state = 
    {
        running: false,
        loading: false,
        logs: '',
        totalErrors: 0
    }    

    componentDidMount()
    {
        this.initData();
        
        // map multiple combinations to the same callback
        Mousetrap.bind(['command+l', 'ctrl+l'], () => 
        {
            this.handleClearClick();
            return false;
        });        
    }

    async componentDidUpdate(prevProps, prevState)
    {
        const prevLocation = prevProps.location;
        const { location } = this.props;

        if(prevLocation && location && prevLocation !== location)
        {
            const prevParams = new URLSearchParams(prevLocation.search); 
            const params = new URLSearchParams(location.search); 
            
            if( prevParams.get('appId') !== params.get('appId') )
            {   
                if(this.listenerId)
                    plugins.docker.removeEventListener(this.listenerId);
                    
                await this.unregisterLogHandler();
                this.initData();
            }
        }

        if(prevState.logs.length !== this.state.logs.length && this.editor)
        {
            if(this.editorTail)
            {
                const linesTotal = this.editor.getSession().getLength();
                // this.editor.setAnimatedScroll(true);
                this.editor.scrollToLine(linesTotal + 1000, false,false);

                lodash.debounce(() => {
                    this.updateErrorCount();
                },1000)();
            }
        }
    }

    async componentWillUnmount()
    {
        if(this.listenerId)
            plugins.docker.removeEventListener(this.listenerId);

        await this.unregisterLogHandler();

        Mousetrap.unbind(['command+l', 'ctrl+l']);
    }
    
    
    async initData()
    {
        const { location } = this.props;
        const params = new URLSearchParams(location.search); 
        this.appId = params.get('appId');
        this.appName = params.get('appName');
        this.container = dockerapi.getContainer(this.appId);
        this.containerData = await utils.docker.getContainerByName(this.appName);
        this.containerIp = this.containerData.NetworkSettings.Networks.bridge.IPAddress;

        this.listenerId = `AppOutput-${this.appName}`;
        plugins.docker.addEventListener(this.listenerId,this.appListener);

        this.setState({running: this.containerData.State === "running"});
        this.registerLogHandler();
    }


    appListener = (event) =>
    {
        if(event.Actor.Attributes.name === this.appName)
        {
            switch(event.status)
            {
                case "die":
                    this.setRunning(false);
                break;
                case "start":
                    this.setRunning(true);
                break;

                default:
            }
        }
    } 

    setRunning(bFlag)
    {
        const { loading } = this.state;

        if(!loading)
            this.setState({running:bFlag});

        this.reloadLogHandler();
    }

    async registerLogHandler(bAllLogs = true)
    {
        const logOpts = {
            stdout: true,
            stderr: true,
            tail: 5000,
            follow: false,
            timestamps: false
        };

        if(bAllLogs)
        {
            const logs = await this.container.logs(logOpts);
            this.setState({logs: String(logs).replace(/\u001b\[.*?m/g, '')});
        }


        logOpts.tail = 0;
        logOpts.follow = true;

        this.container.logs(logOpts, (err, stream) =>
        {
            if(err) return console.error(err.message);
            this.logStream = stream;
            this.logStream.setEncoding('utf8');
            this.logStream.on('data', (chunk) => 
            {
                if(stream !== this.logStream)
                {
                    stream.destroy();
                    return;
                }

                this.setState((prevState) =>
                {   
                    return {
                        logs: flatstr(prevState.logs + String(chunk).replace(/\u001b\[.*?m/g, ''))
                    };
                });

                this.editor.session.getUndoManager().reset();
            });
        });        
    }

    async unregisterLogHandler()
    {
        if(this.logstream)
        {
            console.log('[DEBUG] Closing log stream');
            await this.logStream.destroy();
            this.logStream = null;
        }
    }    

    handleClearClick = () =>
    {        
        this.setState({logs: ''},() =>
        {
            setTimeout(() => 
            {
                this.editor.session.getUndoManager().reset();
                this.editor.getSession().resetCaches();
                this.editorTail = true;
                this.updateErrorCount();
            }, 100);           
        });

        // this.updateErrorCount();
    }

    handleToggleStatusClick = async () => 
    {
        const { running } = this.state;
        this.setState({loading : true});

        try{
            if(!running)
                await utils.apps.startApp(this.appId);
            else
                await utils.apps.stopApp(this.appId);

            this.setState({
                loading: false,
                running: !running
            });                 
        } catch (ex)
        {
            console.error(ex);
            utils.electron.showError(`Error while ${running ? 'stopping' : 'starting'} app`, ex);
        }

        this.setState({loading : false});
        await this.reloadLogHandler();
    }

    handleRestartClick = async () =>
    {
        await this.container.restart();
        await this.reloadLogHandler();
    }

    async reloadLogHandler()
    {
        await this.unregisterLogHandler();
        await this.registerLogHandler(false);
    }

    handleExecuteClick = () =>
    {
        utils.os.openTerminal(`docker exec -it ${this.appName} bash`,`Container for ${this.appName}`);
    }

    handleEditorLoad = (editor) =>
    {
        this.editor = editor;
        if(utils.os.getPlatform() === "darwin" )
            this.editor.getKeyboardHandler().commandKeyBinding['cmd-l'].exec = this.handleClearClick;
        else
            this.editor.getKeyboardHandler().commandKeyBinding['ctrl-l'].exec = this.handleClearClick;

        // console.log(this.editor.getKeyboardHandler());
    }

    handleEditorScroll = () =>
    {        
        setTimeout(() => {
            const {renderer} = this.editor;
            // maxTop
            const maxTop = renderer.layerConfig.maxHeight - renderer.$size.scrollerHeight + renderer.scrollMargin.bottom;
            // currentTop
            const scrollTop = this.editor.getSession().getScrollTop();
            const scrollRatio = scrollTop / maxTop;
    
            this.editorTail = scrollRatio >= 1 || maxTop < 1;
        },10);
    }

    handleGotoBottomClick = () =>
    {
        const linesTotal = this.editor.getSession().getLength();
        this.editor.scrollToLine(linesTotal + 1000, false,false);
    }

    handleErrorClick = () =>
    {
        const result = this.editor.find(searchRegex, {
            backwards: false,
            wrap: true,
            caseSensitive: false,
            wholeWord: false,
            regExp: true
          });

          this.editor.renderer.scrollToX(0);
    }

    updateErrorCount = () =>
    {
        // const totalErrors = this.editor.findAll(searchRegex, {
        //     backwards: false,
        //     wrap: true,
        //     caseSensitive: false,
        //     wholeWord: false,
        //     regExp: true
        //   });

        // this.setState({totalErrors});        
    }
    
    render()
    {
        const { classes } = this.props;
        const { state } = this;

        return (
            <div>                
                <Paper className={classes.logPanel} elevation={3}>
                    <Typography variant="overline" component="h3" className={classes.logPanel}>
                            App Output - {this.appName} - {this.containerIp || ''}
                    </Typography>          
                    <div>
                        <IconButton 
                            className={classes.iconButton}
                            onClick={this.handleToggleStatusClick}
                            disabled={state.loading} >
                            {
                                state.running ?
                                    <Stop/>
                                : <PlayArrow/>
                            }
                            
                        </IconButton>
                        <IconButton 
                            className={classes.iconButton}
                            onClick={this.handleRestartClick}
                            disabled={state.loading} >
                            <Replay/>
                        </IconButton>
                        <IconButton 
                            className={classes.iconButton}
                            onClick={this.handleExecuteClick}
                            disabled={state.loading || !state.running} >
                            <Code/>
                        </IconButton>
                        {/*
                        <IconButton 
                            className={classes.iconButton}
                            disabled={state.loading} >
                            <Launch/>
                        </IconButton>
                        */}
                        <IconButton 
                            className={classes.iconButton}
                            style={{float:'right'}} 
                            onClick={this.handleClearClick}>
                            <DeleteSweep/>
                            
                        </IconButton>                                 
                        <IconButton 
                            className={classes.iconButton}
                            style={{float:'right'}} 
                            onClick={this.handleGotoBottomClick}>
                            <KeyboardArrowDown/>
                        </IconButton>
                        { this.state.totalErrors > 0 ?
                        <IconButton 
                            className={classes.iconButton} 
                            style={{float:'right'}}
                            onClick={this.handleErrorClick}>
                            <Badge 
                                badgeContent={this.state.totalErrors}
                                max={99}    
                                color="primary">
                                <Error />
                            </Badge>
                        </IconButton>
                            : null
                        }
                                               
                    </div>                    
                    <Divider className={classes.logsDivider}/>
                    <AceEditor
                        onLoad={this.handleEditorLoad}
                        onChange={this.handleEditorChange}
                        onScroll={this.handleEditorScroll}
                        className={classes.logsBody}
                        // placeholder="- Empty -"
                        mode="python"
                        theme="twilight"
                        name="appLogs"
                        height="70vh"
                        width="unset"
                        readOnly                        
                        fontSize={12}
                        showPrintMargin={false}
                        showGutter
                        highlightActiveLine
                        // maxLines={20}
                        value={this.state.logs}
                        editorProps={{
                            $blockScrolling: Infinity
                        }}
                        setOptions={{
                            enableBasicAutocompletion: false,
                            enableLiveAutocompletion: false,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                        }}/>
                </Paper>  
            </div>
        );
    }
}

export default withStyles(styles)(AppsAdd);
