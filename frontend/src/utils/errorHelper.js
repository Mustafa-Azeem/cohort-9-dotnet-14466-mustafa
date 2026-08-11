// backend sends errors in two shapes:
// 1. custom ApiException -> { error: "message" }
// 2. ModelState validation failure -> { errors: { FieldName: ["msg1", "msg2"] } }
export const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (!data) return fallback;

  if (data.error) return data.error;

  if (data.errors) {
    const allMessages = Object.values(data.errors).flat();
    if (allMessages.length > 0) return allMessages.join(" ");
  }

  return fallback;
};
