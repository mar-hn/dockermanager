import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import 
{
  Paper,
  Typography,
  CircularProgress
} from '@material-ui/core';

import {
  Line as LineChart
} from 'react-chartjs';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

class DockerStatGraph extends React.Component
{
    state = 
    {
        statStream: null,
        chartData: 
        {
          labels: ['',],
          datasets: [
            {
              label: "CPU",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [0]
            },
            {
              label: "Memory",
              fillColor: "rgba(151,187,205,0.2)",
              strokeColor: "rgba(151,187,205,1)",
              pointColor: "rgba(151,187,205,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(151,187,205,1)",
              data: [0]
            }
          ]
        }
    }

    componentDidMount()
    {       
        this.cpu = 
        {
            count: 0,
            total: 0,
            average: 0
        }

        this.mem = 
        {
            count: 0,
            total: 0,
            average: 0
        }        
    }

    componentDidUpdate()
    {
        const {statStream} = this.state;
        const {stream} = this.props;
        
        if(statStream != stream)
        {
            stream.on('data', (buffer) => 
            {
                const data = JSON.parse(buffer.toString());
                this.updateChartData(data);
            });

            this.setState({statStream:stream});
        }
    }


    updateChartData = (event) =>
    {
        const { chartData } = this.state;
        const newChartData = {...chartData};
        const time = utils.misc.getTime(new Date());

        console.log(event);


        this.mem.count++;
        this.mem.total += Number(this.getMemory(event));
        this.cpu.count++;
        this.cpu.total += Number(this.getCPU(event));
        

        if(chartData.labels.length < 10 || time !== chartData.labels[chartData.labels.length - 1])
        {
            console.log(this.mem);
            console.log(this.cpu);
            const averageCPU = Math.round(this.cpu.total / Math.max(this.cpu.count,1));
            const averageMemory = Math.round(this.mem.total / Math.max(this.mem.count,1));

            console.log('AverageCPU->',averageCPU);
            console.log('AverageMemory->',averageMemory);

            newChartData.labels = lodash.takeRight([...chartData.labels,time],10);
            //CPU
            newChartData.datasets[0].data = lodash.takeRight([...newChartData.datasets[0].data,averageCPU],10);
            //Memory
            newChartData.datasets[1].data = lodash.takeRight([...newChartData.datasets[1].data,averageMemory],10);

            this.mem = { count: 0, total: 0};
            this.cpu = { count: 0, total: 0};

            this.setState({chartData:newChartData});
        }

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
        const { classes, empty } = this.props;        

        return (
          <React.Fragment>
            <div style={{textAlign: 'center'}}>
              <Typography variant="caption" color="textSecondary" noWrap >
                Docker Usage (%)
              </Typography>
              { this.state.chartData.labels.length < 10 && !empty ?
                  <CircularProgress className={classes.progress} />
                  :
                    <LineChart 
                      data={this.state.chartData} 
                      options={{
                        responsive:true,
                        animationEasing: "linear",
                        maintainAspectRatio: true,
                      }} 
                    height="60" />
              }
              
            </div>
          </React.Fragment>
        );       
    }
}

export default withStyles(styles)(DockerStatGraph);