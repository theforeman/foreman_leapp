import React from 'react';

export const Table = ({ children, bottomPagination, customEmptyState }) => (
  <div data-testid="mock-table">
    <table>
      {children}
      {customEmptyState && <tbody>{customEmptyState}</tbody>}
    </table>
    {bottomPagination}
  </div>
);
