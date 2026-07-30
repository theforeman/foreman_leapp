const DEFAULT_PER_PAGE = 20;
const PER_PAGE_30 = 30;

export const useForemanSettings = () => ({
  perPage: DEFAULT_PER_PAGE,
  perPageOptions: [5, 10, DEFAULT_PER_PAGE, PER_PAGE_30, 50],
});
