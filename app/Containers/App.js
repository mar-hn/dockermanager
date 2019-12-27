import * as React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import DockerodeClass from 'dockerode';
import Sidebar from '../Components/Sidebar/Sidebar';
import Appbar from '../Components/Appbar/Appbar';


global.dockerapi = new DockerodeClass();
global.lodash = require('lodash');
global.utils = require('../Utils/globalUtils').default;
global.plugins = {};

type Props = {
  children: React.Node
};

const styles = theme => ({
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflowY: "auto"
  },
});


class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children, classes } = this.props;
    return (            
        <div style={{display:'flex'}}>
          <CssBaseline/>
          <Appbar/>
          <Sidebar/>        
          <main className={classes.content}>
            <div className={classes.toolbar} />
            {children}
          </main>
        </div>      
    );
  }
}

export default withStyles(styles)(App);
