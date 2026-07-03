import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import NoReports from './NoReports';

describe('NoReports', () => {
  it('should render when reports expected', () => {
    render(<NoReports reportsExpected />);

    expect(screen.getByText('No Preupgrade Report Available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The preupgrade report could not be generated, check the job details for the reason'
      )
    ).toBeInTheDocument();
  });

  it('should render when reports not expected', () => {
    render(<NoReports reportsExpected={false} />);

    expect(screen.getByText('No Preupgrade Report Available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The preupgrade report will be available after the job finishes'
      )
    ).toBeInTheDocument();
  });
});
