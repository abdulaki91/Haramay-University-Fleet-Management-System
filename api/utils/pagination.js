// Pagination utility
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit =
    parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10;
  const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;

  const validLimit = Math.min(limit, maxLimit);
  const offset = (page - 1) * validLimit;

  return { page, limit: validLimit, offset };
};

const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    current_page: page,
    per_page: limit,
    total_items: total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};

module.exports = { getPagination, getPaginationMeta };
