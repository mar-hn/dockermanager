import React from 'react';

import {
    TableCell,
    TableRow,
    Typography
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';


const CustomTableCell = withStyles(theme => ({
head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
},
body: {
    fontSize: 14,
},
}))(TableCell);


class ContainerStatRow extends React.Component 
{
    statStream = null;
    container = null;
    state = 
    {
        statData: null
    }

    async componentDidMount()
    {
        const {cont} = this.props;
        this.container = dockerapi.getContainer(cont.Id);
        this.statStream = await this.container.stats();

        this.statStream.on('data',this.handleStreamData);
        this.statStream.on('end',this.handleStreamEnd);        
    }

    componentWillUnmount()
    {
        if(this.statStream)
            this.statStream.destroy();
    }


    handleStreamData = (buffer) =>
    {
        const statData = JSON.parse(buffer.toString());
        this.setState({statData});
    }

    handleStreamEnd = () =>
    {
    }

    getCPU(event)
    {
        const cpuDelta = event.cpu_stats.cpu_usage.total_usage - event.precpu_stats.cpu_usage.total_usage;
        const systemDelta = event.cpu_stats.system_cpu_usage - event.precpu_stats.system_cpu_usage;

        let cpuPercent = 0;
        if(event.cpu_stats.cpu_usage.percpu_usage)
            cpuPercent = (cpuDelta / systemDelta) * event.cpu_stats.cpu_usage.percpu_usage.length * 100.0;

        return isNaN(cpuPercent) ? 0 : cpuPercent.toFixed(2);
    }

    getMemory(event) 
    {
        const memStats = event.memory_stats
        const memory = (memStats.usage / memStats.limit) * 100
        return isNaN(memory) ? 0 : memory.toFixed(2);
    }

    render()
    {
        const { classes } = this.props;
        const { statData } = this.state;

        if(!statData)
            return null;


        return (
            <TableRow className={classes.row}>
                <CustomTableCell component="th" scope="row">
                {statData.name}
                </CustomTableCell>
                <CustomTableCell align="right">{this.getCPU(statData)}%</CustomTableCell>
                <CustomTableCell align="right">{utils.os.humanFileSize(statData.memory_stats.usage)} / {utils.os.humanFileSize(statData.memory_stats.limit)}</CustomTableCell>
                <CustomTableCell align="right">{this.getMemory(statData)}%</CustomTableCell>
                {
                    statData.networks ?
                        <CustomTableCell align="right">{utils.os.humanFileSize(statData.networks.eth0.rx_bytes)} / {utils.os.humanFileSize(statData.networks.eth0.tx_bytes)}</CustomTableCell>
                    : null
                }                        
                <CustomTableCell align="right">{statData.pids_stats.current}</CustomTableCell>
            </TableRow>      
        );
    }
}

export default ContainerStatRow;