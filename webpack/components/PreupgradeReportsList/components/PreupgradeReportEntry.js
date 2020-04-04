import React from 'react';
import { ListView, Grid, Icon } from 'patternfly-react';
import PropTypes from 'prop-types';
import './foreman_leapp.scss';

import {
  itemIteratorId,
  presentSeverity,
  hasRemediations,
  getExternals,
  getRemediations,
  getTitle,
  getSeverity,
  getSummary,
  getTags,
} from './helpers';

const PreupgradeReportEntry = ({ entry }) => (
  <ListView.Item
    key={entry.id}
    stacked
    checkboxInput={<input type="checkbox" />}
    description={entry.title}
    additionalInfo={[
      <ListView.InfoItem key={itemIteratorId(entry, entry.hostname)}>
        <Icon type="pf" name="cluster" /> {entry.hostname}
      </ListView.InfoItem>,
      <ListView.InfoItem key={itemIteratorId(entry, entry.severity)}>
        <Icon
          type="pf"
          name="resources-full"
          style={{ color: presentSeverity(entry.severity) }}
        />
        {entry.severity}
      </ListView.InfoItem>,
      hasRemediations(entry),
    ]}
  >
    <Grid fluid>
      {getTitle(entry)}
      {getSeverity(entry)}
      {getSummary(entry)}
      {getTags(entry)}
      {getExternals(entry)}
      {getRemediations(entry)}
    </Grid>
  </ListView.Item>
);

PreupgradeReportEntry.propTypes = {
  entry: PropTypes.object.isRequired,
};

export default PreupgradeReportEntry;
