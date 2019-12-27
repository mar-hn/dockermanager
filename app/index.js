import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './Containers/Root';
import './app.global.css';

render(
  <AppContainer>
    <Root/>
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./Containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./Containers/Root').default;
    render(
      <AppContainer>
        <NextRoot/>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}