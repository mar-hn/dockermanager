import React, { Component } from 'react';
import Routes from '../Routes';
import { SnackbarProvider } from 'notistack';
import { SharedProvider } from '../Context/ContextAPI';
import ThemeWrapper from '../HOC/ThemeWrapper/ThemeWrapper';
import InstallProxyDialog from '../Components/Dialogs/InstallProxyDialog';


export default class Root extends Component 
{
  render() {
    return (      
      <SnackbarProvider maxSnack={3}>
        <SharedProvider>
          <ThemeWrapper>          
              <Routes />
              <InstallProxyDialog/>
          </ThemeWrapper>
        </SharedProvider>
      </SnackbarProvider>
    );
  }
}
