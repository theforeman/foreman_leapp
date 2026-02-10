import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { APIActions } from 'foremanReact/redux/API';
import { STATUS } from 'foremanReact/constants';

export const usePreupgradeTableState = (data, isExpanded) => {
  const dispatch = useDispatch();
  const isMounted = useRef(false);

  const [status, setStatus] = useState(STATUS.RESOLVED);
  const [error, setError] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [reportSummaryId, setReportSummaryId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState({ page: 1, perPage: 5 });
  const [sortBy, setSortBy] = useState({ index: 'title', direction: 'asc' });
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // eslint-disable-next-line camelcase
  const isLeappJob = data?.template_name?.includes('Run preupgrade via Leapp');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLeappJob || !isExpanded || reportSummaryId) return;

    setStatus(STATUS.PENDING);

    dispatch(
      APIActions.get({
        key: `GET_LEAPP_REPORT_LIST_${data.id}`,
        url: `/api/job_invocations/${data.id}/preupgrade_reports`,
        handleSuccess: listRes => {
          if (!isMounted.current) return;
          const { results } = listRes.data || listRes;
          if (!results || results.length === 0) {
            setAllItems([]);
            setStatus(STATUS.RESOLVED);
            return;
          }
          const id = results[0].id;
          setReportSummaryId(id);

          dispatch(
            APIActions.get({
              key: `GET_LEAPP_REPORT_FULL_${id}`,
              url: `/api/preupgrade_reports/${id}`,
              handleSuccess: detailRes => {
                if (!isMounted.current) return;
                setAllItems(
                  (detailRes.data || detailRes).preupgrade_report_entries || []
                );
                setStatus(STATUS.RESOLVED);
              },
              handleError: err => {
                if (isMounted.current) {
                  setError(err);
                  setStatus(STATUS.ERROR);
                }
              },
            })
          );
        },
        handleError: err => {
          if (isMounted.current) {
            setError(err);
            setStatus(STATUS.ERROR);
          }
        },
      })
    );
  }, [isExpanded, data.id, isLeappJob, reportSummaryId, dispatch]);

  const processedRows = useMemo(() => {
    let rows = [...allItems];

    if (searchValue) {
      const match = searchValue.match(/^(\w+)\s*(=|~|!=)\s*(["']?)(.*?)\3$/);
      if (match) {
        const [, rawField, op, , rawVal] = match;
        let field = rawField.toLowerCase();
        const val = rawVal.toLowerCase();
        if (field === 'risk' || field === 'risk factor') field = 'severity';
        if (field === 'host') field = 'hostname';
        if (field === 'fix' || field === 'fix type') field = 'has_remediation';

        rows = rows.filter(row => {
          if (field === 'has_remediation') {
            const has = !!row.detail?.remediations;
            return val === 'true' ? has : !has;
          }
          if (field === 'inhibitor') {
            const isInhib = row.flags?.includes('inhibitor');
            return val === 'true' ? isInhib : !isInhib;
          }
          const itemVal = (row[field] || '').toString().toLowerCase();
          if (op === '!=') return !itemVal.includes(val);
          return itemVal.includes(val);
        });
      } else {
        const lower = searchValue.toLowerCase();
        rows = rows.filter(
          r =>
            (r.title && r.title.toLowerCase().includes(lower)) ||
            (r.hostname && r.hostname.toLowerCase().includes(lower)) ||
            (r.severity && r.severity.toLowerCase().includes(lower)) ||
            (r.summary && r.summary.toLowerCase().includes(lower))
        );
      }
    }

    if (sortBy.index) {
      rows.sort((a, b) => {
        let valA;
        let valB;
        if (sortBy.index === 'has_remediation') {
          valA = a.detail?.remediations ? 1 : 0;
          valB = b.detail?.remediations ? 1 : 0;
        } else if (sortBy.index === 'inhibitor') {
          valA = a.flags?.includes('inhibitor') ? 1 : 0;
          valB = b.flags?.includes('inhibitor') ? 1 : 0;
        } else {
          valA = (a[sortBy.index] || '').toString().toLowerCase();
          valB = (b[sortBy.index] || '').toString().toLowerCase();
        }
        if (valA < valB) return sortBy.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [allItems, searchValue, sortBy]);

  const paginatedRows = useMemo(() => {
    const start = (pagination.page - 1) * pagination.perPage;
    return processedRows.slice(start, start + pagination.perPage);
  }, [processedRows, pagination]);

  const areAllExpanded =
    paginatedRows.length > 0 &&
    paginatedRows.every(row => expandedRowIds.has(row.id));

  const toggleAllExpansion = shouldExpand => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      paginatedRows.forEach(row => {
        if (shouldExpand) next.add(row.id);
        else next.delete(row.id);
      });
      return next;
    });
  };

  const toggleRowExpansion = (id, isOpen) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      isOpen ? next.add(id) : next.delete(id);
      return next;
    });
  };

  return {
    isLeappJob,
    status,
    error,
    rows: paginatedRows,
    totalCount: processedRows.length,
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
  };
};
