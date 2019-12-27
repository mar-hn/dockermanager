/* eslint-disable react/jsx-no-undef */
import React from 'react';
import { SharedConsumer } from '../../Context/ContextAPI';

const WithGlobals = (Component, ...rest) =>
{
    rest = rest.reduce((prev, current) => {
        return {...prev, ...current}; 
    });

    return (        
        <SharedConsumer>
        {({ state, actions }) => 
        (
            <Component globalState={state} globalActions={actions} {...rest}/>
        )}
        </SharedConsumer>
    )
}

export default WithGlobals;