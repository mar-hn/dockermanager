/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-nested-ternary */
import React from 'react';

import {
    InputAdornment, 
} from '@material-ui/core';

import {
    Public
} from '@material-ui/icons';

import { TextValidator } from 'react-material-ui-form-validator';
import NginxPortTable from './includes/NginxPortTable';


class NginxSettings extends React.PureComponent
{
    state = {
        showAddPortDialog: false
    }

    render()
    {
        const { parent, classes } = this.props;
        const { showAddPortDialog } = this.state;        
        const { vports } =  parent.state.config;
    
        return (
            <React.Fragment>
                <TextValidator
                    // ref="vhost"
                    ref={(r) => { parent.vhostInput = r }}
                    label="Virtual Host URL"
                    onBlur={parent.handleInputBlur}
                    onChange={parent.handleInputConfigChange}
                    name="vhost"
                    value={parent.state.config.vhost || ''}
                    validators={['required','matchRegexp:^(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)?$']}
                    errorMessages={['This field is required','please enter a valid url']}
                    fullWidth
                    disabled={parent.state.loading}
                    InputLabelProps={{shrink: true}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <Public />
                            </InputAdornment>
                        ),
                    }}
                />
                <NginxPortTable parent={parent} vports={vports} />
            </React.Fragment>
        );        
    }
}

export default NginxSettings;