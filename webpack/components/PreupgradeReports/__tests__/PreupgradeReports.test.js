import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import PreupgradeReports from '../PreupgradeReports';
import {
  preupgradeReports,
  preupgradeReportsWithFixableEntries,
} from './PreupgradeReports.fixtures';

jest.mock('foremanReact/components/Pagination', () => {
  const MockPagination = () => <div data-testid="pagination">Pagination</div>;
  return MockPagination;
});

jest.mock('../../PreupgradeReportsList/components/images/i_severity-high.svg', () => 'severity-high.svg');
jest.mock('../../PreupgradeReportsList/components/images/i_severity-med.svg', () => 'severity-med.svg');
jest.mock('../../PreupgradeReportsList/components/images/i_severity-low.svg', () => 'severity-low.svg');

const mockStore = configureMockStore([]);

const csrfToken = 'xyz';
const newJobInvocationUrl = '/job_invocations/new';

const defaultProps = {
  loading: false,
  error: {},
  preupgradeReports,
  csrfToken,
  newJobInvocationUrl,
  reportsExpected: true,
};

const renderComponent = (props = {}) =>
  render(
    <Provider store={mockStore({})}>
      <PreupgradeReports {...defaultProps} {...props} />
    </Provider>
  );

const getFixSelectedForm = () =>
  screen.getByRole('button', { name: 'Fix Selected' }).closest('form');

describe('PreupgradeReports', () => {
  // withLoadingState wraps content in patternfly-react LoadingState, which
  // delays showing the spinner by 300ms and always schedules that timeout on
  // mount — even when loading=false. Without fake timers the timeout fires
  // after the test unmounts and React logs a setState-on-unmounted warning.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders report entries when loaded with reports', () => {
    renderComponent();

    expect(screen.getByText('Fix me!')).toBeInTheDocument();
    expect(screen.getByText('I am broken too')).toBeInTheDocument();
    expect(screen.getByText('Octocat is not happy')).toBeInTheDocument();
  });

  it('renders empty state when loaded without reports', () => {
    renderComponent({ preupgradeReports: [] });

    expect(
      screen.getByRole('heading', {
        name: 'No Preupgrade Report Available',
        level: 5,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The preupgrade report could not be generated, check the job details for the reason'
      )
    ).toBeInTheDocument();
  });

  it('renders loading state while data is being fetched', () => {
    renderComponent({
      loading: true,
      preupgradeReports: [],
      reportsExpected: false,
    });

    // LoadingState renders nothing until its 300ms timeout elapses.
    jest.advanceTimersByTime(300);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'No Preupgrade Report Available',
      })
    ).not.toBeInTheDocument();
  });

  it('renders error empty state when data retrieval fails', () => {
    renderComponent({
      error: {
        statusText: 'Internal server error',
        errorMsg: 'Unexpected error',
      },
      preupgradeReports: [],
      reportsExpected: false,
    });

    expect(
      screen.getByRole('heading', {
        name: 'Could not retrieve data: Internal server error - Unexpected error',
        level: 5,
      })
    ).toBeInTheDocument();
  });

  it('disables Fix Selected when no fixable entries are selected', () => {
    renderComponent({ preupgradeReports: preupgradeReportsWithFixableEntries });

    expect(screen.getByRole('button', { name: 'Fix Selected' })).toBeDisabled();
  });

  it('enables Fix Selected and passes selected entry ids when a fixable entry is selected', () => {
    renderComponent({ preupgradeReports: preupgradeReportsWithFixableEntries });

    const [, fixableEntryCheckbox] = screen.getAllByRole('checkbox');

    fireEvent.click(fixableEntryCheckbox);

    expect(screen.getByRole('button', { name: 'Fix Selected' })).toBeEnabled();
    expect(
      getFixSelectedForm().querySelector('input[name="inputs[remediation_ids]"]')
    ).toHaveValue('100');
  });

  it('selects all fixable entries when header checkbox is clicked', () => {
    renderComponent({ preupgradeReports: preupgradeReportsWithFixableEntries });

    const [selectAllCheckbox] = screen.getAllByRole('checkbox');

    fireEvent.click(selectAllCheckbox);

    expect(screen.getByRole('button', { name: 'Fix Selected' })).toBeEnabled();

    const form = getFixSelectedForm();

    expect(
      form.querySelector('input[name="inputs[remediation_ids]"]')
    ).toHaveValue('100,102');
    expect(
      [...form.querySelectorAll('input[name="host_ids[]"]')].map(
        input => input.value
      )
    ).toEqual(['5', '6']);
  });
});
