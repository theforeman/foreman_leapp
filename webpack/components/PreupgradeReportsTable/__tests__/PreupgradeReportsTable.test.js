import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { APIActions } from 'foremanReact/redux/API';
import PreupgradeReportsTable from '../index';

jest.mock('foremanReact/redux/API');
jest.mock('foremanReact/common/I18n', () => ({
  translate: text => text,
}));
jest.mock('foremanReact/components/PF4/TableIndexPage/Table/Table', () => ({
  Table: ({ children, customEmptyState, childrenOutsideTbody }) => (
    <table data-testid="table">
      {childrenOutsideTbody ? children : null}
      <tbody>
        {customEmptyState}
        {!childrenOutsideTbody ? children : null}
      </tbody>
    </table>
  ),
}));

jest.mock(
  'foremanReact/components/PF4/TableIndexPage/TableIndexPage',
  () => ({
    __esModule: true,
    default: ({ children, customToolbarItems }) => (
      <div data-testid="table-index-page">
        <div className="toolbar">{customToolbarItems}</div>
        {children}
      </div>
    ),
  }),
  { virtual: true }
);

jest.mock(
  'foremanReact/Root/Context/ForemanContext',
  () => ({
    useForemanSettings: () => ({
      perPage: 20,
      perPageOptions: [5, 10, 20, 50],
    }),
  }),
  { virtual: true }
);

const mockStore = configureMockStore([thunk]);

const mockJobId = 42;
const mockReportId = 999;
const mockJobData = {
  id: mockJobId,
  template_name: 'Run preupgrade via Leapp',
};

const mockEntries = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Report Entry ${i + 1}`,
  hostname: 'example.com',
  severity: i === 0 ? 'high' : 'low',
  flags: i === 0 ? ['inhibitor'] : [],
  detail: { remediations: i === 0 ? [{ type: 'cmd' }] : [] },
}));

describe('PreupgradeReportsTable', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();

    APIActions.get.mockImplementation(({ key, handleSuccess }) => {
      return dispatch => {
        if (key.includes('GET_LEAPP_REPORT_LIST'))
          handleSuccess({ results: [{ id: mockReportId }] });
        if (key.includes('GET_LEAPP_REPORT_DETAIL'))
          handleSuccess({
            id: mockReportId,
            preupgrade_report_entries: mockEntries,
          });
        return { type: 'MOCK_API_SUCCESS' };
      };
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <PreupgradeReportsTable data={mockJobData} />
      </Provider>
    );

  const expandSection = () => {
    fireEvent.click(screen.getByText('Leapp preupgrade report'));
  };

  it('renders data', async () => {
    renderComponent();
    expandSection();

    await waitFor(() => screen.getByText('Report Entry 1'));

    expect(screen.getByText('Report Entry 1')).toBeInTheDocument();
    expect(screen.getByText('Report Entry 5')).toBeInTheDocument();
    expect(screen.queryByText('Report Entry 6')).not.toBeInTheDocument();
  });

  it('paginates to the next page', async () => {
    renderComponent();
    expandSection();
    await waitFor(() => screen.getByText('Report Entry 1'));

    fireEvent.click(screen.getAllByText('Next Page')[0]);

    await waitFor(() => screen.getByText('Report Entry 6'));
    expect(screen.getByText('Report Entry 10')).toBeInTheDocument();
    expect(screen.queryByText('Report Entry 1')).not.toBeInTheDocument();
  });

  it('changes per_page limit to 10', async () => {
    renderComponent();
    expandSection();
    await waitFor(() => screen.getByText('Report Entry 1'));

    fireEvent.click(screen.getAllByText('Set 10')[0]);

    await waitFor(() => {
      expect(screen.getByText('Report Entry 10')).toBeInTheDocument();
      expect(screen.queryByText('Report Entry 11')).not.toBeInTheDocument();
    });
  });

  it('renders empty state message when no issues found', async () => {
    APIActions.get.mockImplementation(({ key, handleSuccess }) => {
      return () => {
        if (key.includes('GET_LEAPP_REPORT_LIST'))
          handleSuccess({ results: [{ id: mockReportId }] });
        if (key.includes('GET_LEAPP_REPORT_DETAIL'))
          handleSuccess({ id: mockReportId, preupgrade_report_entries: [] });
        return { type: 'EMPTY' };
      };
    });

    renderComponent();
    expandSection();

    await waitFor(() => {
      expect(screen.getByText('No issues found')).toBeInTheDocument();
    });
  });
});
