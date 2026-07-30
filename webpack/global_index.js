import React from 'react';
import { addGlobalFill } from 'foremanReact/components/common/Fill/GlobalFill';
import PreupgradeReportsTable from './components/PreupgradeReportsTable';

const LEAPP_PREUPGRADE_REPORT_FILL_WEIGHT = 100;

addGlobalFill(
  'job-invocation-additional-info',
  'leapp-preupgrade-report-fill',
  <PreupgradeReportsTable key="leapp-report-fill" />,
  LEAPP_PREUPGRADE_REPORT_FILL_WEIGHT
);
