/**
 * Pagination result interface
 */
export interface PaginationResult {
  pages: number;
  page: number;
  from: number;
  to: number;
}

/**
 * Creates a pagination object based on the given parameters.
 * @param count - The total number of items to paginate.
 * @param perPage - The number of items to display per page.
 * @param page - The current page number.
 * @returns An object containing pagination information.
 */
export function create(
  count: number,
  perPage: number,
  page: number
): PaginationResult {
  const totalPages = Math.ceil(count / perPage);

  if (page > totalPages) page = 1;

  let from = 0;
  if (perPage === 1) from = page - 1;
  else from = perPage * page - perPage;

  if (page <= 1) from = 0;

  const result: PaginationResult = {
    pages: totalPages,
    page: page,
    from: from,
    to: perPage,
  };

  return result;
}
