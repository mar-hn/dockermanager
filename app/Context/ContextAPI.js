/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withSnackbar } from 'notistack';
import dockerPlugin from '../Plugins/docker';
import appUpdater from '../Plugins/updater';

const SharedContext = React.createContext();

class SharedProviderClass extends Component 
{
  state = {
    viewTitle: 'Home',
    user: "Guest",
    dockerStatus: 'Unknown',
    nginxProxyStatus: 'Unknown',
    openInstallDialog: false,
    theme: utils.electron.config.get('theme')
  };

  componentWillMount()
  {
    const {enqueueSnackbar, closeSnackbar} = this.props;
    global.plugins.docker = dockerPlugin;
    global.plugins.updater = appUpdater;
    appUpdater.snackbar = enqueueSnackbar;
    appUpdater.closeSnackbar = closeSnackbar;
    dockerPlugin.globalState = this;
    dockerPlugin.snackbar = enqueueSnackbar;
    dockerPlugin.closeSnackbar = closeSnackbar;
  }

  componentDidMount()
  {    
    plugins.docker.register();
    plugins.updater.register();
  }

  componentWillUnmount()
  {
    plugins.docker.destroy();
  }

  setViewTitle = (title) =>
  {
    this.setState({viewTitle:title});
  }

  setTheme = (theme) =>
  {
    this.setState({theme});
  }

  showInstallDialog(bFlag)
  {
    this.setState({openInstallDialog : bFlag});
  }

  render() {
    const { children } = this.props;

    return (
      <SharedContext.Provider
        value={{
            state: this.state,
            actions: this,          
        }}
      >      
        {children}
      </SharedContext.Provider>
    );
  }
}

// eslint-disable-next-line one-var
export const SharedConsumer = SharedContext.Consumer,
             SharedProvider = withSnackbar(SharedProviderClass);