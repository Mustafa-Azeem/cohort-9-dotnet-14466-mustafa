import api from "./api";

export const getAuditLogs = async () => {
  const res = await api.get("/auditlogs");
  if (!Array.isArray(res.data)) {
    throw new Error("Unexpected response shape");
  }
  
  // Filter out any records missing required fields (id, userName, action, timestamp)
  return res.data.filter(record => 
    record && 
    record.id != null && 
    record.userName != null && 
    record.action != null && 
    record.timestamp != null
  );
};
