import { PaginationType } from "../types/data-provider.type";

export function createPagination(
  count: number,
  perPage: number,
  page: number
): PaginationType {
  const totalPages = Math.ceil(count / perPage);
  if (page > totalPages) page = 1;

  // Fixes
  perPage = perPage < 1 ? 1 : perPage;
  page = page < 1 ? 1 : page;

  let from = 0;
  if (perPage == 1) from = page - 1;
  else from = perPage * page - perPage;

  if (page <= 1) from = 0;

  const result = {
    total: count,
    pages: totalPages,
    page: page,
    from: from,
    to: perPage,
    limit: perPage,
  };

  return result;
}
