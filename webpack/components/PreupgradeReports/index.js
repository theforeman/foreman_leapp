import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import PreupgradeReports from './PreupgradeReports';

import getCsrfToken from '../../csrf';

import {
  selectPreupgradeReports,
  selectLoadingPreupgradeReports,
  selectReportsExpected,
  selectError,
  selectJobInvocationsPolling,
} from './PreupgradeReportsSelectors';

import { getPreupgradeReportsAction } from './PreupgradeReportsActions';

const WrappedPreupgradeReports = ({ url, newJobInvocationUrl }) => {
  const loading = useSelector(state => selectLoadingPreupgradeReports(state));
  const preupgradeReports = useSelector(state =>
    selectPreupgradeReports(state)
  );
  const error = useSelector(state => selectError(state));

  const invocationPending = useSelector(state =>
    selectJobInvocationsPolling(state)
  );

  const reportsExpected = useSelector(state => selectReportsExpected(state));

  const dispatch = useDispatch();

  useEffect(() => {
    if (!invocationPending) {
      dispatch(getPreupgradeReportsAction(url));
    }
  }, [dispatch, url, invocationPending]);

  return (
    <PreupgradeReports
      preupgradeReports={preupgradeReports}
      error={error}
      loading={loading}
      csrfToken={getCsrfToken()}
      newJobInvocationUrl={newJobInvocationUrl}
      reportsExpected={reportsExpected}
    />
  );
};

WrappedPreupgradeReports.propTypes = {
  url: PropTypes.string.isRequired,
  newJobInvocationUrl: PropTypes.string.isRequired,
};

export default WrappedPreupgradeReports;
