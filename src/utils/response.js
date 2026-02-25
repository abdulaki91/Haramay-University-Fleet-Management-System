// Standardized API response format
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Error occurred",
  statusCode = 500,
  details = null,
) => {
  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
