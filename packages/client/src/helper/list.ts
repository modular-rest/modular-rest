export function createPagination(count: number, perPage: number, page: number) {
  let totalPgaes = Math.ceil(count / perPage);
  if (page > totalPgaes) page = 1;

  // fixes
  perPage = perPage < 1 ? 1 : perPage;
  page = page < 1 ? 1 : page;

  let from = 0;
  if (perPage == 1) from = page - 1;
  else from = perPage * page - perPage;

  if (page <= 1) from = 0;

  let result = {
    pages: totalPgaes,
    page: page,
    from: from,
    to: perPage,
  };

  return result;
}
