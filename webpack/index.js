/* eslint import/no-unresolved: [2, { ignore: [foremanReact/*] }] */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */

import componentRegistry from 'foremanReact/components/componentRegistry';

import JobInvocationLeappTab from './components/JobInvocationLeappTab';

componentRegistry.register({
  name: 'JobInvocationLeappTab',
  type: JobInvocationLeappTab,
});
