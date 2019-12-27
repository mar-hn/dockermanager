import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { SharedConsumer } from '../../Context/ContextAPI';

class ThemeWrapper extends React.Component
{
    getTheme = (state) =>
    {        
        return createMuiTheme({...state.theme,
            typography: {useNextVariants: true,}
        });
    }


    render()
    {
        const {children} = this.props;

        return (
            <SharedConsumer>
                {({ state }) => 
                (
                    <MuiThemeProvider theme={this.getTheme(state)}>
                        {children}
                    </MuiThemeProvider>
                )}
            </SharedConsumer>
        )
    }
}

export default ThemeWrapper;