import React from 'react';

const Pagination = ({ page, perPage, onChange }) => (
  <div data-testid="pagination">
    <span>Page {page}</span>
    <span>Per Page {perPage}</span>
    <button onClick={() => onChange({ page: page + 1, perPage })}>
      Next Page
    </button>
    <button onClick={() => onChange({ page: 1, perPage: 10 })}>Set 10</button>
    <button onClick={() => onChange({ page: 1, perPage: 5 })}>Set 5</button>
  </div>
);

export default Pagination;
