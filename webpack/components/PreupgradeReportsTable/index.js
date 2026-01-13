import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateVariant,
  ExpandableSection,
  PaginationVariant,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';
import { Table } from 'foremanReact/components/PF4/TableIndexPage/Table/Table';
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import Pagination from 'foremanReact/components/Pagination';
import { APIActions } from 'foremanReact/redux/API';
import { entriesPage } from '../PreupgradeReports/PreupgradeReportsHelpers';
import './PreupgradeReportsTable.scss';
import {
  PER_PAGE_OPTIONS,
  STATUS,
  columns,
  renderSeverityLabel,
} from './PreupgradeReportsTableConstants';

const PreupgradeReportsTable = ({ data = {} }) => {
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, per_page: 5 });
  const [reportData, setReportData] = useState(null);
  const [status, setStatus] = useState(STATUS.RESOLVED);
  const dispatch = useDispatch();
  // eslint-disable-next-line camelcase
  const isLeappJob = data?.template_name?.includes('Run preupgrade via Leapp');

  useEffect(() => {
    let isMounted = true;
    if (!isLeappJob || !isExpanded || reportData) {
      return undefined;
    }
    setStatus(STATUS.PENDING);

    dispatch(
      APIActions.get({
        key: `GET_LEAPP_REPORT_LIST_${data.id}`,
        url: `/api/job_invocations/${data.id}/preupgrade_reports`,
        handleSuccess: listResponse => {
          if (!isMounted) return;
          const listPayload = listResponse.data || listResponse;
          const summary = listPayload.results?.[0];
          if (summary?.id) {
            dispatch(
              APIActions.get({
                key: `GET_LEAPP_REPORT_DETAIL_${summary.id}`,
                url: `/api/preupgrade_reports/${summary.id}`,
                handleSuccess: detailResponse => {
                  if (isMounted) {
                    const detailPayload = detailResponse.data || detailResponse;
                    setReportData(detailPayload);
                    setStatus(STATUS.RESOLVED);
                  }
                },
                handleError: err => {
                  if (isMounted) {
                    setError(err);
                    setStatus(STATUS.ERROR);
                  }
                },
              })
            );
          } else if (isMounted) {
            setReportData({});
            setStatus(STATUS.RESOLVED);
          }
        },
        handleError: err => {
          if (isMounted) {
            setError(err);
            setStatus(STATUS.ERROR);
          }
        },
      })
    );

    return () => {
      isMounted = false;
    };
  }, [isExpanded, data.id, isLeappJob, reportData, dispatch]);

  // eslint-disable-next-line camelcase
  const entries = reportData?.preupgrade_report_entries || [];
  const pagedEntries = entriesPage(entries, pagination);

  const handleParamsChange = newParams => {
    setPagination(prev => ({
      ...prev,
      page: newParams.page || prev.page,
      per_page: newParams.perPage || newParams.per_page || prev.per_page,
    }));
  };

  const combinedResponse = useMemo(
    () => ({
      response: {
        page: pagination.page,
        perPage: pagination.per_page,
        per_page: pagination.per_page,
        results: pagedEntries,
        subtotal: entries.length,
        total: 0, // hides default top pagination
      },
      status,
      setAPIOptions: handleParamsChange,
    }),
    [pagedEntries, entries.length, pagination, status]
  );

  if (!isLeappJob) return null;

  const topPagination = (
    <Pagination
      itemCount={entries.length}
      key="custom-top-pagination"
      onChange={handleParamsChange}
      page={pagination.page}
      perPage={pagination.per_page}
      perPageOptions={PER_PAGE_OPTIONS}
      updateParamsByUrl={false}
      variant={PaginationVariant.top}
    />
  );

  const bottomPagination = (
    <Pagination
      itemCount={entries.length}
      key="custom-bottom-pagination"
      onChange={handleParamsChange}
      page={pagination.page}
      perPage={pagination.per_page}
      perPageOptions={PER_PAGE_OPTIONS}
      updateParamsByUrl={false}
    />
  );

  const customEmptyState = (
    <Tr ouiaId="leapp-table-empty">
      <Td colSpan={100}>
        <EmptyState variant={EmptyStateVariant.sm}>
          <EmptyStateHeader
            titleText={<>{__('No issues found')}</>}
            headingLevel="h5"
          />
          <EmptyStateBody>
            {__('The preupgrade report shows no issues.')}
          </EmptyStateBody>
        </EmptyState>
      </Td>
    </Tr>
  );

  return (
    <ExpandableSection
      className="leapp-report-section"
      isExpanded={isExpanded}
      onToggle={(_event, val) => setIsExpanded(val)}
      toggleText={__('Leapp preupgrade report')}
    >
      <TableIndexPage
        apiUrl=""
        controller="preupgrade_reports"
        customToolbarItems={[
          <ToolbarItem key="pagination">{topPagination}</ToolbarItem>,
        ]}
        replacementResponse={combinedResponse}
        searchable={false}
        updateParamsByUrl={false}
      >
        <Table
          ouiaId="leapp-report-table"
          columns={columns}
          isEmbedded
          params={{
            page: pagination.page,
            per_page: pagination.per_page,
            perPage: pagination.per_page,
            order: '',
          }}
          results={pagedEntries}
          itemCount={entries.length}
          url=""
          isPending={status === STATUS.PENDING}
          errorMessage={
            status === STATUS.ERROR && error?.message ? error.message : null
          }
          showCheckboxes={false}
          refreshData={() => {}}
          isDeleteable={false}
          customEmptyState={
            status === STATUS.RESOLVED && entries.length === 0
              ? customEmptyState
              : null
          }
          setParams={handleParamsChange}
          bottomPagination={bottomPagination}
          childrenOutsideTbody
        >
          {pagedEntries.map((entry, index) => (
            <Tbody key={`entry-${entry.id || index}`}>
              <Tr ouiaId={`leapp-table-row-${index}`}>
                <Td />
                <Td dataLabel={columns.title.title}>{entry.title}</Td>
                <Td dataLabel={columns.host.title}>
                  {entry.hostname || (reportData && reportData.hostname) || '-'}
                </Td>
                <Td dataLabel={columns.risk_factor.title}>
                  {renderSeverityLabel(entry.severity)}
                </Td>
                <Td dataLabel={columns.has_remediation.title}>
                  {entry.detail && entry.detail.remediations
                    ? __('Yes')
                    : __('No')}
                </Td>
                <Td dataLabel={columns.inhibitor.title}>
                  {entry.flags &&
                  entry.flags.some(flag => flag === 'inhibitor') ? (
                    <Tooltip content={__('This issue inhibits the upgrade.')}>
                      <span>{__('Yes')}</span>
                    </Tooltip>
                  ) : (
                    __('No')
                  )}
                </Td>
              </Tr>
            </Tbody>
          ))}
        </Table>
      </TableIndexPage>
    </ExpandableSection>
  );
};

PreupgradeReportsTable.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    template_name: PropTypes.string,
  }),
};

PreupgradeReportsTable.defaultProps = {
  data: {},
};

export default PreupgradeReportsTable;
