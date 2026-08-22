import api from "./api";

export const getAuditLogs = async () => {
  const res = await api.get("/auditlogs");
  if (!Array.isArray(res.data)) {
    throw new Error("Unexpected response shape");
  }
  return res.data;
};
