/* eslint-disable import/no-unresolved */
/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import routes from './Constants/routes.json';
import App from './containers/App';
import HomePage from './containers/Home/Home';
import ImagesPage from './containers/Images/Images';
import ContainersPage from './containers/Containers/Containers';
import ContainerAddPage from './Containers/ContainerAdd/ContainerAdd';
import AppsPage from './Containers/Apps/AppsHome';
import AppsAddPage from './Containers/Apps/AppsAdd';
import AppsEditPage from './Containers/Apps/AppsEdit';
import AppsOutputPage from './Containers/Apps/AppsOutput';
import SettingsPage from './Containers/Settings/Settings';
import withGlobals from './HOC/WithGlobals/WithGlobals';




const Routes = 
[
  {path: routes.IMAGES, component: ImagesPage},
  {path: routes.COUNTER, component: HomePage},
  {path: routes.CONTAINERADD, component: ContainerAddPage},
  {path: routes.CONTAINERS, component: ContainersPage},
  {path: routes.APPSADD, component: AppsAddPage},
  {path: routes.APPSEDIT, component: AppsEditPage},
  {path: routes.APPSOUTPUT, component: AppsOutputPage},
  {path: routes.APPS, component: AppsPage},
  {path: routes.SETTINGS, component: SettingsPage},
  // DEFAULT
  {path: routes.HOME, component: HomePage} 

]


export default () => (
  <HashRouter>
      <App>         
          <Switch>
            {Routes.map((r,i) => <Route exact key={i} path={r.path} render={(props) => withGlobals(r.component,props)}/>)}
          </Switch>
      </App>
  </HashRouter>
);
