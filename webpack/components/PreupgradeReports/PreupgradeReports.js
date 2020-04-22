import React, { useState } from 'react';
import MessageBox from 'foremanReact/components/common/MessageBox';
import { LoadingState, Row } from 'patternfly-react';
import PropTypes from 'prop-types';

import PreupgradeReportsList from '../PreupgradeReportsList';
import FixAllButton from './components/FixAllButton';
import UpgradeAllButton from './components/UpgradeAllButton';
import EntriesFilter from './components/EntriesFilter';

import {
  flattenEntries,
  isEmpty,
  anyEntriesFixable,
  filterEntries,
} from './PreupgradeReportsHelpers';

const PreupgradeReports = ({
  preupgradeReports,
  loading,
  error,
  csrfToken,
  newJobInvocationUrl,
}) => {
  const [filterType, setFilterType] = useState('title');
  const [filterValue, setFilterValue] = useState('');

  if (!isEmpty(error)) {
    return (
      <MessageBox
        key="preupgrade-reports-error"
        icontype="error-circle-o"
        msg={`Could not retrieve data: ${error.statusText} - ${error.errorMsg}`}
      />
    );
  }

  const onFilterValueChange = value => {
    setFilterValue(value);
  };

  const onFilterValueClear = () => setFilterValue('');

  const onFilterTypeChange = value => {
    onFilterValueClear();
    setFilterType(value);
  };

  return (
    <LoadingState loading={loading}>
      <Row>
        <div className="col-md-8">
          <EntriesFilter
            filterType={filterType}
            onFilterTypeChange={onFilterTypeChange}
            filterValue={filterValue}
            onFilterValueChange={onFilterValueChange}
          />
        </div>
        <div className="col-md-4">
          <div className="btn-toolbar pull-right">
            <FixAllButton
              postUrl={newJobInvocationUrl}
              disabled={!anyEntriesFixable(preupgradeReports)}
              csrfToken={csrfToken}
              preupgradeReports={preupgradeReports}
            />
            <UpgradeAllButton
              postUrl={newJobInvocationUrl}
              csrfToken={csrfToken}
              preupgradeReports={preupgradeReports}
            />
          </div>
        </div>
      </Row>
      <PreupgradeReportsList
        allEntries={filterEntries(
          filterType,
          filterValue,
          flattenEntries(preupgradeReports)
        )}
      />
    </LoadingState>
  );
};

PreupgradeReports.propTypes = {
  preupgradeReports: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object.isRequired,
  csrfToken: PropTypes.string.isRequired,
  newJobInvocationUrl: PropTypes.string.isRequired,
};

export default PreupgradeReports;
