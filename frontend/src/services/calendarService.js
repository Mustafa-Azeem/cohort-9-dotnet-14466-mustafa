import api from "./api";

export const getEvents = async (from, to) => {
  const params = new URLSearchParams();
  if (from) params.append("from", from.toISOString());
  if (to) params.append("to", to.toISOString());
  const res = await api.get(`/calendar?${params}`);
  if (!Array.isArray(res.data)) {
    throw new Error("Unexpected response loading events");
  }
  return res.data;
};

export const getEventById = async (id) => {
  const res = await api.get(`/calendar/${id}`);
  if (!res.data || typeof res.data !== "object") {
    throw new Error("Unexpected response loading event");
  }
  return res.data;
};

export const createEvent = async (dto) => {
  const res = await api.post("/calendar", dto);
  if (!res.data || typeof res.data !== "object") {
    throw new Error("Unexpected response creating event");
  }
  return res.data;
};

export const updateEvent = async (id, dto) => {
  const res = await api.put(`/calendar/${id}`, dto);
  if (!res.data || typeof res.data !== "object") {
    throw new Error("Unexpected response updating event");
  }
  return res.data;
};

export const deleteEvent = async (id) => {
  await api.delete(`/calendar/${id}`);
};
