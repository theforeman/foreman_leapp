import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, bottomPagination, customEmptyState }) => (
  <div data-testid="mock-table">
    <table>
      {children}
      {customEmptyState && <tbody>{customEmptyState}</tbody>}
    </table>
    {bottomPagination}
  </div>
);

Table.propTypes = {
  children: PropTypes.node,
  bottomPagination: PropTypes.node,
  customEmptyState: PropTypes.node,
};

Table.defaultProps = {
  children: null,
  bottomPagination: null,
  customEmptyState: null,
};
