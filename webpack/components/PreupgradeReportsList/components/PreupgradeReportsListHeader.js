import React from 'react';
import { ListView } from 'patternfly-react';
import PropTypes from 'prop-types';

import { translate as __ } from 'foremanReact/common/I18n';

import InfoItem from './InfoItem';
import SortableHeaderItem from './SortableHeaderItem';

const PreupgradeReportsListHeader = ({ sort, changeSort, toggleSelectAll }) => {
  const additionalInfoColumns = [
    { label: __('Host'), value: 'hostname' },
    { label: __('Risk Factor'), value: 'severity' },
    { label: __('Has Remediation?'), value: 'fix' },
    { label: __('Inhibitor?'), value: 'inhibitor' },
  ];

  const additionalInfo = additionalInfoColumns.map((col, idx) => (
    <InfoItem itemId={idx.toString()} key={idx}>
      <strong>
        <SortableHeaderItem
          title={col.label}
          sort={sort}
          value={col.value}
          changeSort={changeSort}
        />
      </strong>
    </InfoItem>
  ));

  return (
    <ListView.Item
      additionalInfo={additionalInfo}
      className="list-view-header"
      checkboxInput={<input type="checkbox" onClick={toggleSelectAll} />}
      description={
        <SortableHeaderItem
          title={__('Title')}
          sort={sort}
          value="title"
          changeSort={changeSort}
        />
      }
      hideCloseIcon
      stacked
    />
  );
};

PreupgradeReportsListHeader.propTypes = {
  sort: PropTypes.object.isRequired,
  changeSort: PropTypes.func.isRequired,
  toggleSelectAll: PropTypes.func.isRequired,
};

export default PreupgradeReportsListHeader;
