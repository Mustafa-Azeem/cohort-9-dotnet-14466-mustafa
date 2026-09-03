import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../services/calendarService";
import { getTasks } from "../services/taskService";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    eventType: "Other"
  });
  const notifiedIds = useRef(new Set());

  const eventTypeColors = {
    Meeting: "#3b82f6",
    Deadline: "#ef4444",
    Conference: "#a855f7",
    Other: "#6b7280"
  };

  const taskColor = "#16a34a";

  useEffect(() => {
    loadCalendarData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, [events, tasks]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.log("Notification permission denied");
      }
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    events.forEach((evt) => {
      const eventStart = new Date(evt.startTime);
      if (
        eventStart > now &&
        eventStart <= fifteenMinutesLater &&
        !notifiedIds.current.has(`evt-${evt.id}`)
      ) {
        if (Notification.permission === "granted") {
          new Notification(evt.title, { body: "Starting soon" });
          notifiedIds.current.add(`evt-${evt.id}`);
        }
      }
    });

    tasks.forEach((task) => {
      if (
        task.dueDate &&
        !notifiedIds.current.has(`task-${task.id}`)
      ) {
        const dueDate = new Date(task.dueDate);
        if (dueDate > now && dueDate <= fifteenMinutesLater) {
          if (Notification.permission === "granted") {
            new Notification(`Task: ${task.title}`, { body: "Due soon" });
            notifiedIds.current.add(`task-${task.id}`);
          }
        }
      }
    });
  };

  const loadCalendarData = async () => {
    setLoading(true);
    setError("");
    try {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const eventsData = await getEvents(monthStart, monthEnd);
      const tasksData = await getTasks();

      if (!Array.isArray(eventsData)) throw new Error("Invalid events response");
      if (!Array.isArray(tasksData)) throw new Error("Invalid tasks response");

      setEvents(eventsData);
      setTasks(tasksData);
    } catch (err) {
      setError("Couldn't load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      eventType: "Other"
    });
    setShowModal(true);
  };

  const handleEventClick = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description || "",
      startTime: evt.startTime.substring(0, 16),
      endTime: evt.endTime.substring(0, 16),
      eventType: evt.eventType
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: formData.title,
          description: formData.description,
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
          eventType: formData.eventType
        });
      } else {
        await createEvent({
          title: formData.title,
          description: formData.description,
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
          eventType: formData.eventType
        });
      }
      setShowModal(false);
      await loadCalendarData();
    } catch (err) {
      alert("Error saving event: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("Delete this event?")) {
      try {
        await deleteEvent(editingEvent.id);
        setShowModal(false);
        await loadCalendarData();
      } catch (err) {
        alert("Error deleting event");
      }
    }
  };

  const getEventsForDay = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((evt) => {
      const evtDate = new Date(evt.startTime);
      return evtDate.toDateString() === dayDate.toDateString();
    });
  };

  const getTasksForDay = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === dayDate.toDateString();
    });
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const dayTasks = getTasksForDay(day);
      days.push(
        <div key={day} className="calendar-day" onClick={() => handleDayClick(day)}>
          <div className="calendar-day-number">{day}</div>
          <div className="calendar-day-events">
            {dayEvents.map((evt) => (
              <div
                key={`evt-${evt.id}`}
                className="event-block"
                style={{ backgroundColor: eventTypeColors[evt.eventType] || eventTypeColors.Other }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(evt);
                }}
                title={evt.title}
              />
            ))}
            {dayTasks.map((task) => (
              <div
                key={`task-${task.id}`}
                className="event-block task-block"
                style={{ backgroundColor: taskColor }}
                onClick={(e) => e.stopPropagation()}
                title={`Task: ${task.title}`}
              />
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <p>Loading calendar...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Calendar</h1>
        <p className="page-subtitle">Events and task due dates</p>

        {error && <div className="error-box" role="alert">{error}</div>}

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth}>&lt;</button>
            <h2>
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            {renderCalendarGrid()}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingEvent ? "Edit Event" : "Create Event"}</h3>
              <form>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleFormChange("startTime", e.target.value)}
                  required
                />
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleFormChange("endTime", e.target.value)}
                  required
                />
                <select
                  value={formData.eventType}
                  onChange={(e) => handleFormChange("eventType", e.target.value)}
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Conference">Conference</option>
                  <option value="Other">Other</option>
                </select>
              </form>
              <div className="modal-actions">
                <button onClick={handleSaveEvent} className="btn-primary">
                  Save
                </button>
                {editingEvent && (
                  <button onClick={handleDeleteEvent} className="btn-danger">
                    Delete
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Calendar;
