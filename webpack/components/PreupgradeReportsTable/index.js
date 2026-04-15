/* eslint-disable max-lines */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  ExpandableSection,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';
import { foremanUrl } from 'foremanReact/common/helpers';
import { Table } from 'foremanReact/components/PF4/TableIndexPage/Table/Table';
import SelectAllCheckbox from 'foremanReact/components/PF4/TableIndexPage/Table/SelectAllCheckbox';
import { useBulkSelect } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';
import { RowSelectTd } from 'foremanReact/components/PF4/TableIndexPage/RowSelectTd';
import { getColumnHelpers } from 'foremanReact/components/PF4/TableIndexPage/Table/helpers';
import { APIActions } from 'foremanReact/redux/API';
import { STATUS } from 'foremanReact/constants';
import {
  entriesPage,
  entryFixable,
} from '../PreupgradeReports/PreupgradeReportsHelpers';
import ReportDetails, { renderSeverityLabel } from './ReportDetails';
import './PreupgradeReportsTable.scss';

const LEAPP_TEMPLATE_NAME = 'Run preupgrade via Leapp';

const isRowFixable = entryFixable;

const submitJobInvocation = (
  dispatch,
  setError,
  feature,
  hostIds,
  remediationIds
) => {
  const payload = {
    job_invocation: {
      feature,
      host_ids: hostIds,
      ...(remediationIds != null
        ? { inputs: { remediation_ids: remediationIds } }
        : {}),
    },
  };

  dispatch(
    APIActions.post({
      key: `CREATE_JOB_INVOCATION_${feature}`,
      url: foremanUrl('/api/job_invocations'),
      params: payload,
      handleSuccess: response => {
        const result = response.data || response;
        if (result?.id) {
          window.location.assign(foremanUrl(`/job_invocations/${result.id}`));
        }
      },
      handleError: err => setError(err),
    })
  );
};

const PreupgradeReportsTable = ({ data = {} }) => {
  const [error, setError] = useState(null);
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, perPage: 5 });
  const [reportData, setReportData] = useState(null);
  const [status, setStatus] = useState(STATUS.RESOLVED);
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  const dispatch = useDispatch();
  // eslint-disable-next-line camelcase
  const isLeappJob = data?.template_name?.includes(LEAPP_TEMPLATE_NAME);

  const columns = useMemo(
    () => ({
      title: { title: __('Title') },
      host: {
        title: __('Host'),
        wrapper: entry => entry.hostname || reportData?.hostname || '-',
      },
      risk_factor: {
        title: __('Risk Factor'),
        wrapper: ({ severity }) => renderSeverityLabel(severity),
      },
      has_remediation: {
        title: __('Has Remediation?'),
        wrapper: entry => (entry.detail?.remediations ? __('Yes') : __('No')),
      },
      inhibitor: {
        title: __('Inhibitor?'),
        wrapper: entry =>
          entry.flags?.some(flag => flag === 'inhibitor') ? (
            <Tooltip content={__('This issue inhibits the upgrade.')}>
              <span>{__('Yes')}</span>
            </Tooltip>
          ) : (
            __('No')
          ),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportData?.hostname]
  );

  useEffect(() => {
    let isMounted = true;
    if (!isLeappJob || !isReportExpanded || reportData) return undefined;

    const fail = err => {
      if (!isMounted) return;
      setError(err);
      setStatus(STATUS.ERROR);
    };

    const succeed = response => {
      if (!isMounted) return;
      setReportData(response?.data || response || {});
      setStatus(STATUS.RESOLVED);
    };

    setStatus(STATUS.PENDING);
    dispatch(
      APIActions.get({
        key: `GET_LEAPP_REPORT_LIST_${data.id}`,
        url: `/api/job_invocations/${data.id}/preupgrade_reports`,
        handleSuccess: listResponse => {
          if (!isMounted) return;
          const summary = (listResponse.data || listResponse).results?.[0];
          if (summary?.id) {
            dispatch(
              APIActions.get({
                key: `GET_LEAPP_REPORT_DETAIL_${summary.id}`,
                url: `/api/preupgrade_reports/${summary.id}`,
                handleSuccess: detailResponse => succeed(detailResponse),
                handleError: err => fail(err),
              })
            );
            return;
          }
          succeed();
        },
        handleError: err => fail(err),
      })
    );

    return () => {
      isMounted = false;
    };
  }, [isReportExpanded, data.id, isLeappJob, reportData, dispatch]);

  // eslint-disable-next-line camelcase
  const entries = useMemo(() => reportData?.preupgrade_report_entries || [], [
    reportData,
  ]);

  const pagedEntries = useMemo(
    () => entriesPage(entries, pagination),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, pagination.page, pagination.perPage]
  );

  const getHostId = useCallback(
    entry =>
      entry.host_id ||
      entry.hostId ||
      // eslint-disable-next-line camelcase
      reportData?.host_id ||
      reportData?.host?.id ||
      // eslint-disable-next-line camelcase
      data?.targeting?.host_id,
    [reportData, data]
  );

  const handleParamsChange = useCallback(newParams => {
    setPagination(prev => ({
      ...prev,
      page: newParams.page || prev.page,
      perPage: newParams.per_page || prev.perPage,
    }));
    setExpandedRowIds(new Set());
  }, []);

  const toggleRowExpansion = useCallback((id, isExpanding) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (isExpanding) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const { inclusionSet, exclusionSet, ...selectAllOptions } = useBulkSelect({
    results: pagedEntries,
    metadata: {
      total: entries.length,
      page: pagination.page,
      selectable: entries.length,
    },
    initialSearchQuery: '',
  });

  const {
    selectAll,
    selectPage,
    selectNone,
    selectOne,
    areAllRowsSelected,
    isSelected,
  } = selectAllOptions;

  const rawSelectedIds =
    areAllRowsSelected() || exclusionSet.size > 0
      ? entries.map(e => e.id).filter(id => !exclusionSet.has(id))
      : Array.from(inclusionSet);

  const validFixableIds = useMemo(
    () => entries.filter(isRowFixable).map(e => e.id),
    [entries]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedIds = useMemo(
    () => rawSelectedIds.filter(id => validFixableIds.includes(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawSelectedIds.join(','), validFixableIds]
  );

  const pagedFixableEntries = useMemo(() => pagedEntries.filter(isRowFixable), [
    pagedEntries,
  ]);

  const areAllPageFixableSelected =
    pagedFixableEntries.length > 0 &&
    pagedFixableEntries.every(e => selectedIds.includes(e.id));

  const areAllFixableSelected =
    validFixableIds.length > 0 &&
    validFixableIds.every(id => selectedIds.includes(id));

  const areAllRowsExpanded =
    pagedEntries.length > 0 &&
    pagedEntries.every(entry => expandedRowIds.has(entry.id));

  const onExpandAll = useCallback(() => {
    setExpandedRowIds(
      areAllRowsExpanded ? new Set() : new Set(pagedEntries.map(e => e.id))
    );
  }, [areAllRowsExpanded, pagedEntries]);

  const [columnKeys, keysToColumnNames] = useMemo(
    () => getColumnHelpers(columns),
    [columns]
  );

  const hostIdsForSelected = useMemo(
    () =>
      Array.from(
        new Set(
          entries
            .filter(e => selectedIds.includes(e.id))
            .map(getHostId)
            .filter(Boolean)
        )
      ),
    [entries, selectedIds, getHostId]
  );

  const allHostIds = useMemo(
    () => Array.from(new Set(entries.map(getHostId).filter(Boolean))),
    [entries, getHostId]
  );

  if (!isLeappJob) return null;

  const isFixSelectedDisabled =
    validFixableIds.length === 0 ||
    selectedIds.length === 0 ||
    hostIdsForSelected.length === 0;

  return (
    <ExpandableSection
      isExpanded={isReportExpanded}
      onToggle={(_event, val) => setIsReportExpanded(val)}
      toggleText={__('Leapp preupgrade report')}
    >
      {entries.length > 0 && status === STATUS.RESOLVED && (
        <Toolbar ouiaId="leapp-report-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <SelectAllCheckbox
                  selectAll={selectAll}
                  selectPage={selectPage}
                  selectNone={selectNone}
                  selectedCount={selectedIds.length}
                  pageRowCount={pagedFixableEntries.length}
                  totalCount={validFixableIds.length}
                  areAllRowsOnPageSelected={areAllPageFixableSelected}
                  areAllRowsSelected={areAllFixableSelected}
                />
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup
              align={{ default: 'alignRight' }}
              variant="button-group"
            >
              <ToolbarItem>
                <Button
                  variant="secondary"
                  isDisabled={isFixSelectedDisabled}
                  onClick={() =>
                    submitJobInvocation(
                      dispatch,
                      setError,
                      'leapp_remediation_plan',
                      hostIdsForSelected,
                      selectedIds.join(',')
                    )
                  }
                  ouiaId="fix-selected-button"
                >
                  {__('Fix Selected')}
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="primary"
                  isDisabled={allHostIds.length === 0}
                  onClick={() =>
                    submitJobInvocation(
                      dispatch,
                      setError,
                      'leapp_upgrade',
                      allHostIds
                    )
                  }
                  ouiaId="run-upgrade-button"
                >
                  {__('Run Upgrade')}
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      )}

      <Table
        ouiaId="leapp-report-table"
        columns={columns}
        isEmbedded
        params={{
          page: pagination.page,
          perPage: pagination.perPage,
          order: '',
        }}
        results={pagedEntries}
        itemCount={entries.length}
        url=""
        isPending={status === STATUS.PENDING}
        errorMessage={
          status === STATUS.ERROR && error?.message ? error.message : null
        }
        showCheckboxes
        refreshData={() => {}}
        isDeleteable={false}
        emptyMessage={__('The preupgrade report shows no issues.')}
        setParams={handleParamsChange}
        childrenOutsideTbody
        onExpandAll={onExpandAll}
        areAllRowsExpanded={!areAllRowsExpanded}
      >
        {pagedEntries.map((entry, rowIndex) => {
          const isRowExpanded = expandedRowIds.has(entry.id);

          return (
            <Tbody
              key={entry.id}
              isExpanded={isRowExpanded}
              className={isRowExpanded ? 'leapp-expanded-tbody' : ''}
            >
              <Tr ouiaId={`table-row-${rowIndex}`}>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: isRowExpanded,
                    onToggle: (_event, _rowIndex, isOpen) =>
                      toggleRowExpansion(entry.id, isOpen),
                  }}
                />
                <RowSelectTd
                  rowData={entry}
                  selectOne={selectOne}
                  isSelected={id => isRowFixable(entry) && isSelected(id)}
                  isSelectable={isRowFixable}
                />
                {columnKeys.map(key => (
                  <Td key={key} dataLabel={keysToColumnNames[key]}>
                    {columns[key].wrapper
                      ? columns[key].wrapper(entry)
                      : entry[key]}
                  </Td>
                ))}
              </Tr>
              <Tr
                isExpanded={isRowExpanded}
                ouiaId={`table-row-details-${rowIndex}`}
              >
                <Td colSpan={columnKeys.length + 2}>
                  <ExpandableRowContent>
                    {isRowExpanded && <ReportDetails entry={entry} />}
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </Table>
    </ExpandableSection>
  );
};

PreupgradeReportsTable.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    template_name: PropTypes.string,
    targeting: PropTypes.shape({
      host_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};

PreupgradeReportsTable.defaultProps = {
  data: {},
};

export default PreupgradeReportsTable;
