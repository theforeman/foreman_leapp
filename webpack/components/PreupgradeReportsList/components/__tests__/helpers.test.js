import { testSelectorsSnapshotWithFixtures } from '@theforeman/test';

import {
  presentSeverity,
  tagInfo,
  hasRemediations,
  getTitle,
  getSeverity,
  getSummary,
  getTags,
  getExternals,
  getRemediations,
} from '../helpers';

import { reportEntry } from './PreupgradeReportEntry.fixtures';

const fixtures = {
  'should return hex for severity': () => presentSeverity('low'),
  'should return tag info': () => tagInfo(reportEntry.tags),
  'should detect if has remediations': () => hasRemediations(reportEntry),
  'should return title': () => getTitle(reportEntry),
  'should return severity': () => getSeverity(reportEntry),
  'should return summary': () => getSummary(reportEntry),
  'should return tags': () => getTags(reportEntry),
  'should return externals': () => getExternals(reportEntry),
  'should return remediations': () => getRemediations(reportEntry),
};

describe('PreupgradeReportList/helpers', () =>
  testSelectorsSnapshotWithFixtures(fixtures));
