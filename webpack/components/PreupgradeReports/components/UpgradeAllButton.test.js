import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import UpgradeAllButton from './UpgradeAllButton';

import { preupgradeReports } from '../__tests__/PreupgradeReports.fixtures';

const fixtures = {
  'should render': {
    preupgradeReports,
    postUrl: '/job_invocations/new',
    title: 'Button title',
    csrfToken: 'abcd',
  },
};

describe('UpgradeAllButton', () =>
  testComponentSnapshotsWithFixtures(UpgradeAllButton, fixtures));
