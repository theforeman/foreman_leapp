import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { APIActions } from 'foremanReact/redux/API';
import { STATUS } from 'foremanReact/constants';
import { useForemanSettings } from 'foremanReact/Root/Context/ForemanContext';

export const usePreupgradeTableState = (data, isExpanded) => {
  const dispatch = useDispatch();
  const lastFetchedKeyRef = useRef(null);
  const lastEntriesFetchKeyRef = useRef(null);
  const { perPage: foremanPerPage } = useForemanSettings();

  const [status, setStatus] = useState(STATUS.RESOLVED);
  const [error, setError] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: foremanPerPage,
  });
  const [sortBy, setSortBy] = useState({ index: '', direction: 'asc' });
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // eslint-disable-next-line camelcase
  const isLeappJob = data?.template_name?.includes('Run preupgrade via Leapp');
  // eslint-disable-next-line camelcase
  const jobStatusLabel = data?.status_label;

  useEffect(() => {
    const fetchKey = `${data.id}:${jobStatusLabel}`;
    if (!isLeappJob || !isExpanded || lastFetchedKeyRef.current === fetchKey)
      return undefined;

    let ignore = false;
    setStatus(STATUS.PENDING);

    dispatch(
      APIActions.get({
        key: `GET_LEAPP_REPORT_LIST_${data.id}`,
        url: `/api/v2/job_invocations/${data.id}/preupgrade_reports`,
        handleSuccess: res => {
          if (ignore) return;
          lastFetchedKeyRef.current = fetchKey;
          const payload = res.data || res;
          const rawResults = payload.results;
          const resultsArray = rawResults ? [].concat(rawResults) : [];

          if (resultsArray[0]?.id) {
            setReportId(resultsArray[0].id);
          } else {
            setRows([]);
            setTotalCount(0);
            setStatus(STATUS.RESOLVED);
          }
        },
        handleError: err => {
          if (ignore) return;
          setError(err);
          setStatus(STATUS.ERROR);
        },
      })
    );

    return () => {
      ignore = true;
    };
  }, [isExpanded, data.id, isLeappJob, dispatch, jobStatusLabel]);

  useEffect(() => {
    if (!isLeappJob || !isExpanded || !reportId) return undefined;

    const entriesFetchKey = `${reportId}_P${pagination.page}_PP${pagination.perPage}_S${searchValue}_O${sortBy.index}${sortBy.direction}_J${jobStatusLabel}`;
    if (lastEntriesFetchKeyRef.current === entriesFetchKey) return undefined;

    let ignore = false;
    setStatus(STATUS.PENDING);

    const orderParam = sortBy.index
      ? `${sortBy.index} ${sortBy.direction.toUpperCase()}`
      : undefined;

    dispatch(
      APIActions.get({
        key: `GET_LEAPP_REPORT_ENTRIES_${entriesFetchKey}`,
        url: `/api/v2/preupgrade_reports/${reportId}/preupgrade_report_entries`,
        params: {
          page: pagination.page,
          per_page: pagination.perPage,
          ...(searchValue && { search: searchValue }),
          ...(orderParam && { order: orderParam }),
        },
        handleSuccess: res => {
          if (ignore) return;
          lastEntriesFetchKeyRef.current = entriesFetchKey;
          const payload = res.data || res;
          const fetchedResults = payload.results;
          setRows(fetchedResults ? [].concat(fetchedResults) : []);
          setTotalCount(payload.subtotal ?? payload.total ?? 0);
          setStatus(STATUS.RESOLVED);
          setExpandedRowIds(new Set());
        },
        handleError: err => {
          if (ignore) return;
          setError(err);
          setStatus(STATUS.ERROR);
        },
      })
    );

    return () => {
      ignore = true;
    };
  }, [
    isExpanded,
    isLeappJob,
    reportId,
    searchValue,
    pagination.page,
    pagination.perPage,
    sortBy.index,
    sortBy.direction,
    dispatch,
    jobStatusLabel,
  ]);

  const areAllRowsExpanded =
    rows.length > 0 && rows.every(row => expandedRowIds.has(row.id));

  const onExpandAll = () => {
    setExpandedRowIds(
      areAllRowsExpanded ? new Set() : new Set(rows.map(r => r.id))
    );
  };

  const toggleRowExpansion = (id, isOpen) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return {
    isLeappJob,
    status,
    error,
    reportId,
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
    areAllRowsExpanded,
    onExpandAll,
  };
};
