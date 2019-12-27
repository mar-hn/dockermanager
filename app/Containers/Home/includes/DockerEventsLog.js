import React from 'react';

import {
    Paper,
    Divider,
    Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ScrollToBottom from 'react-scroll-to-bottom';

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
        overflown: 'hidden',
    },
    logsBody: {
        padding: '1.2rem 1.2rem 2rem 1.2rem',
        overflow: 'hidden',
        height: '70vh',
        fontSize: '12px',
        fontFamily: 'Menlo, Consolas, "DejaVu Sans Mono"',
        // overflowWrap: 'break-word'
        overflowWrap: 'normal',
        backgroundColor: 'black',
    },
    logsDivider: 
    {
        backgroundColor:'#757575'
    }
});


class DockerEventsLog extends React.Component
{
    state = {
        dockerLogs: []
    }

    componentDidMount()
    {
        this.registerEvents();
    }

    componentWillUnmount()
    {
        if(this.events)
            this.events.destroy();
    }

    async registerEvents()
    {
        this.events = await dockerapi.getEvents({since: Date.parse(utils.misc.addMinutes(new Date(), -5))});
        this.events.on('data', this.dockerDataHandler);
    }

    dockerDataHandler = (json) =>
    {
        let arrData = [];

        try{
            arrData = String(json).split('\n').filter(item => item !== "");
        } catch(ex)
        {
            console.error('[DockerEventsLog][ERROR] Error while parsing json response.',ex);
            console.debug(arrData);
            return;
        }
        
        this.setState(prevState => 
        {
            const dockerLogs = lodash.takeRight([...prevState.dockerLogs,...arrData],100);
            return {dockerLogs};
        })
    }

    parseItem(item)
    {
        let json = {};
        let parsed = '';
        try {
            const json = JSON.parse(item);
            if(json.status) json.status += ' ->';
            if(json.Type) json.Type += ' ->';
            if(json.Actor) json.Actor = json.Actor.Attributes.name;
            delete json.id;
            delete json.timeNano;
            delete json.scope;
            delete json.Attributes;
            parsed = JSON.stringify(json).replace(/\"/g,'')
                                                .replace(/^\{(.+)\}$/,'$1')
                                                .replace(/,/g,' ')
                                                .replace(/:/g,': ');

        }
        catch(any)
        {
            //console.error('[ERROR] DockerEventsLog->ParseItem():',item);
        }

        return parsed;
    }


    render()
    {
        const { dockerLogs } = this.state;
        const { classes } = this.props;
        let logs = <Typography variant="caption">Loading...</Typography>;

        if(dockerLogs)
        {
            logs = dockerLogs.map( (item,index) => 
            {                               
                return (
                    <React.Fragment key={`logItem-${index}`}>
                        <div style={{whiteSpace: "nowrap"}}>{this.parseItem(item)}</div>
                        {/* <Divider className={classes.logsDivider}/> */}
                    </React.Fragment>
                );              
            });
        }

        return (
            <React.Fragment>            
            <Paper className={classes.logPanel} elevation={3}>
                <ScrollToBottom className={classes.logsBody}>
                    {logs}
                </ScrollToBottom>
            </Paper>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(DockerEventsLog);