/**
 * Creates a pagination object based on the given parameters.
 * @param {number} count - The total number of items to paginate.
 * @param {number} perPage - The number of items to display per page.
 * @param {number} page - The current page number.
 * @returns {Object} - An object containing pagination information.
 */
function create(count, perPage, page) {
  const totalPages = Math.ceil(count / perPage);
  
  if (page > totalPages) page = 1;

  let from = 0;
  if (perPage == 1) from = page - 1;
  else from = (perPage * page) - perPage;

  if (page <= 1) from = 0;

  let result = {
    'pages': totalPages,
    'page': page,
    'from': from,
    'to': perPage
  };

  return result;
};

module.exports = {
  create,
}