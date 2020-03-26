/* eslint import/no-unresolved: [2, { ignore: [foremanReact/*] }] */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */

import componentRegistry from 'foremanReact/components/componentRegistry';

import JobInvocationLeappTab from './components/JobInvocationLeappTab';
// cant resolve this for now
// import Application from './containers/Application/index';
//import './redux';
// Not currently mocking anything
// import './services/api/setupMocks';

componentRegistry.register({
  name: 'JobInvocationLeappTab',
  type: JobInvocationLeappTab,
});

// componentRegistry.register({
//   name: 'leapp',
//   type: Application,
// });