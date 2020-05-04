import React from 'react';
import { ListView, Grid, Icon } from 'patternfly-react';
import PropTypes from 'prop-types';
import './foreman_leapp.scss';

import InhibitorInfoItem from './InhibitorInfoItem';

import {
  itemIteratorId,
  hasRemediations,
  getExternals,
  getRemediations,
  getTitle,
  getSeverity,
  getSummary,
  getTags,
  getSeverityImg,
} from './helpers';

import { entryFixable } from '../../PreupgradeReports/PreupgradeReportsHelpers';

const PreupgradeReportEntry = ({ entry, isEntrySelected, toggleSelected }) => (
  <ListView.Item
    key={entry.id}
    stacked
    checkboxInput={
      <input
        type="checkbox"
        value={isEntrySelected}
        checked={isEntrySelected}
        disabled={!entryFixable(entry)}
        onChange={() => toggleSelected(entry, isEntrySelected)}
      />
    }
    description={entry.title}
    additionalInfo={[
      <ListView.InfoItem key={itemIteratorId(entry, entry.hostname)}>
        <Icon type="pf" name="cluster" /> {entry.hostname}
      </ListView.InfoItem>,
      <ListView.InfoItem key={itemIteratorId(entry, entry.severity)}>
        {getSeverityImg(entry)}
      </ListView.InfoItem>,
      hasRemediations(entry),
      <InhibitorInfoItem key={itemIteratorId(entry, 'flags')} entry={entry} />,
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
  isEntrySelected: PropTypes.bool.isRequired,
  toggleSelected: PropTypes.func.isRequired,
};

export default PreupgradeReportEntry;
