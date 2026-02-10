import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  ExpandableSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import { translate as __ } from 'foremanReact/common/I18n';
import { Table } from 'foremanReact/components/PF4/TableIndexPage/Table/Table';
import { getColumnHelpers } from 'foremanReact/components/PF4/TableIndexPage/Table/helpers';
import { STATUS } from 'foremanReact/constants';
import { SearchAutocomplete } from 'foremanReact/components/SearchBar/SearchAutocomplete';
import { getPreupgradeTableState } from './PreupgradeReportsTableHelpers';
import ReportDetails, { renderSeverityLabel } from './ReportDetails';

const PreupgradeReportsTable = ({ data = {} }) => {
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  const {
    isLeappJob,
    status,
    error,
    rows,
    totalCount,
    pagination,
    sortBy,
    searchValue,
    setSearchValue,
    setPagination,
    setSortBy,
    expandedRowIds,
    toggleRowExpansion,
    areAllExpanded,
    toggleAllExpansion,
  } = getPreupgradeTableState(data, isReportExpanded);

  const autocompleteResults = [
    { label: 'title = ', category: '' },
    { label: 'hostname = ', category: '' },
    { label: 'severity = ', category: '' },
    { label: 'summary ~ ', category: '' },
    { label: 'has_remediation = true', category: '' },
    { label: 'inhibitor = true', category: '' },
  ];

  const columns = {
    title: { title: __('Title'), isSorted: true },
    hostname: {
      title: __('Host'),
      wrapper: e => e.hostname || '-',
      isSorted: true,
    },
    severity: {
      title: __('Risk Factor'),
      wrapper: ({ severity }) => renderSeverityLabel(severity),
      isSorted: true,
    },
    has_remediation: {
      title: __('Has Remediation?'),
      isSorted: true,
      wrapper: e => (e.detail?.remediations ? __('Yes') : __('No')),
    },
    inhibitor: {
      title: __('Inhibitor?'),
      isSorted: true,
      wrapper: e =>
        e.flags?.includes('inhibitor') ? (
          <Tooltip>
            <span>{__('Yes')}</span>
          </Tooltip>
        ) : (
          __('No')
        ),
    },
  };

  const handleParamsChange = newParams => {
    if (newParams.order) {
      const [index, direction] = newParams.order.split(' ');
      setSortBy({ index, direction: direction.toLowerCase() });
    }
    setPagination(prev => ({
      ...prev,
      page: newParams.page || prev.page,
      perPage: newParams.perPage || prev.perPage,
    }));
  };

  const [columnKeys, keysToColumnNames] = getColumnHelpers(columns);

  if (!isLeappJob) return null;

  return (
    <ExpandableSection
      className="leapp-report-section"
      isExpanded={isReportExpanded}
      onToggle={(_e, val) => setIsReportExpanded(val)}
      toggleText={__('Leapp preupgrade report')}
    >
      <Toolbar
        id="leapp-report-toolbar"
        className="pf-c-toolbar"
        ouiaId="leapp-report-toolbar"
      >
        <ToolbarContent>
          <ToolbarItem style={{ width: '100%', maxWidth: '600px' }}>
            <div className="foreman-search-bar">
              <SearchAutocomplete
                value={searchValue}
                results={autocompleteResults}
                onSearchChange={val => {
                  setSearchValue(val);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                onSearch={val => setSearchValue(val)}
                placeholder={__('Search')}
              />
            </div>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        ouiaId="leapp-report-table"
        columns={columns}
        isEmbedded
        params={{
          page: pagination.page,
          perPage: pagination.perPage,
          order: `${sortBy.index} ${sortBy.direction.toUpperCase()}`,
        }}
        results={rows}
        itemCount={totalCount}
        url=""
        isPending={status === STATUS.PENDING}
        errorMessage={
          status === STATUS.ERROR && error?.message ? error.message : null
        }
        showCheckboxes={false}
        refreshData={() => {}}
        isDeleteable={false}
        emptyMessage={
          searchValue
            ? __('No results found for your search.')
            : __('The preupgrade report shows no issues.')
        }
        setParams={handleParamsChange}
        childrenOutsideTbody
        onExpandAll={(_e, isOpen) => toggleAllExpansion(isOpen)}
        // Inverted per PatternFly implementation to ensure correct toggle icon state
        areAllRowsExpanded={!areAllExpanded}
      >
        {rows.map((entry, rowIndex) => {
          const isRowExpanded = expandedRowIds.has(entry.id);
          return (
            <Tbody key={entry.id} isExpanded={isRowExpanded}>
              <Tr ouiaId={`table-row-${rowIndex}`}>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: isRowExpanded,
                    onToggle: (_e, _idx, isOpen) =>
                      toggleRowExpansion(entry.id, isOpen),
                  }}
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
                <Td colSpan={columnKeys.length + 1}>
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
  }),
};

PreupgradeReportsTable.defaultProps = {
  data: {},
};

export default PreupgradeReportsTable;
