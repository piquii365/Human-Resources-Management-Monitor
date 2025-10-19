import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { fetchCalendarEvents } from "../api";

type EventItem = {
  id?: string | number;
  title?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  location?: string;
  color?: string;
  attendees?: string[];
};

type ModalData = {
  title?: string;
  description?: string | null;
  event_type?: string | null;
  start_date: string;
  end_date: string;
  location?: string | null;
  related_table?: string | null;
  related_id?: string | null;
  organizer_id?: string | null;
  attendees?: string[] | null;
  color?: string | null;
  is_recurring?: boolean;
  recurrence_pattern?: unknown | null;
  created_by?: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // helper: format Date to local datetime-local string (YYYY-MM-DDTHH:MM)
  const toLocalDateTimeInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  // helpers for splitting/combining local datetime strings
  const splitLocalDateTime = (s: string) => {
    const [date, time] = (s || "").split("T");
    return { date: date || "", time: time ? time.slice(0, 5) : "00:00" };
  };
  const combineLocalDateTime = (date: string, time: string) =>
    `${date}T${time}`;

  // generate time options stepping by 30 minutes
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const h = Math.floor((i * 30) / 60);
    const m = (i * 30) % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}`;
  });

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const loadEvents = useCallback(async (monthDate: Date) => {
    try {
      const from = startOfMonth(monthDate).toISOString().slice(0, 10);
      const to = endOfMonth(monthDate).toISOString().slice(0, 10);
      const res = await fetchCalendarEvents(from, to);
      // normalize to EventItem[]: either the response is an array or an object { data: [] }
      if (Array.isArray(res)) setEvents(res as EventItem[]);
      else if (
        res &&
        typeof res === "object" &&
        Array.isArray((res as unknown as { data?: unknown }).data)
      ) {
        setEvents(
          (res as unknown as { data?: unknown }).data as unknown as EventItem[]
        );
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("loadEvents", err);
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    loadEvents(current);
  }, [current, loadEvents]);

  const prev = () =>
    setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const next = () =>
    setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const daysInMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const eventsForDay = (dateISO: string) =>
    events.filter(
      (ev) =>
        (ev.start_date ? String(ev.start_date).slice(0, 10) : null) === dateISO
    );

  const refresh = async () => await loadEvents(current);

  const createEvent = async (iso: string) => {
    const startDate = new Date(iso);
    startDate.setHours(9, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    setEditingEvent(null);
    setModalData({
      start_date: toLocalDateTimeInput(startDate),
      end_date: toLocalDateTimeInput(endDate),
      title: "",
      color: "#3B82F6",
    });
    setIsModalOpen(true);
  };

  // modal state and helpers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const handleModalSave = async () => {
    if (!modalData) return;
    if (!modalData.title || modalData.title.trim() === "") {
      alert("Please provide a title for the event.");
      return;
    }
    const startIso = modalData.start_date
      ? new Date(modalData.start_date)
      : null;
    const endIso = modalData.end_date ? new Date(modalData.end_date) : null;
    if (
      !startIso ||
      isNaN(startIso.getTime()) ||
      !endIso ||
      isNaN(endIso.getTime())
    ) {
      alert("Please provide valid start and end date/time.");
      return;
    }
    if (startIso.getTime() >= endIso.getTime()) {
      alert("End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: modalData.title,
        description: modalData.description || null,
        event_type: modalData.event_type || null,
        start_date: startIso.toISOString(),
        end_date: endIso.toISOString(),
        location: modalData.location || null,
        related_table: modalData.related_table || null,
        related_id: modalData.related_id || null,
        organizer_id: modalData.organizer_id || null,
        attendees: modalData.attendees || null,
        color: modalData.color || null,
        is_recurring: modalData.is_recurring || false,
        recurrence_pattern: modalData.recurrence_pattern || null,
        created_by: modalData.created_by || null,
      };

      const isEditing = editingEvent && editingEvent.id;
      const url = isEditing
        ? `/api/calendar/events/${editingEvent.id}`
        : `/api/calendar/events`;
      const method = isEditing ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let j: { success?: boolean; error?: string; message?: string } | null =
        null;
      try {
        j = await r.json();
      } catch (parseErr) {
        console.error("Failed to parse JSON response", parseErr);
      }
      if (r.ok && j && j.success) {
        await refresh();
        setIsModalOpen(false);
        setModalData(null);
        setEditingEvent(null);
      } else {
        const msg =
          (j && (j.error || j.message)) || `Server returned ${r.status}`;
        alert(`Failed to ${isEditing ? "update" : "create"} event: ${msg}`);
      }
    } catch (e) {
      console.error(e);
      alert("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    const startDate = ev.start_date ? new Date(ev.start_date) : new Date();
    const endDate = ev.end_date
      ? new Date(ev.end_date)
      : new Date(startDate.getTime() + 60 * 60 * 1000);
    setModalData({
      title: ev.title || "",
      description: ev.description || null,
      start_date: toLocalDateTimeInput(startDate),
      end_date: toLocalDateTimeInput(endDate),
      location: ev.location || null,
      color: ev.color || "#3B82F6",
      attendees: ev.attendees || null,
    });
    setIsModalOpen(true);
  };

  const deleteEvent = async (eventId: string | number) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const r = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      });
      const j = await r.json();
      if (j.success) {
        await refresh();
        setIsModalOpen(false);
        setEditingEvent(null);
      } else {
        alert("Delete failed");
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  // compute how many blank cells to prepend so the 1st of month aligns with weekday
  const firstDayIndex = new Date(
    current.getFullYear(),
    current.getMonth(),
    1
  ).getDay();
  const totalSlots = Math.ceil((firstDayIndex + daysInMonth(current)) / 7) * 7;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <CalIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 text-sm">
              Schedule and manage your events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => createEvent(new Date().toISOString())}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
            {current.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={next}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => setCurrent(new Date())}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <div key={day} className="py-3 text-center">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {day.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const dayNumber = idx - firstDayIndex + 1;
            const isInMonth =
              dayNumber >= 1 && dayNumber <= daysInMonth(current);

            if (!isInMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[120px] border-r border-b border-gray-100 bg-gray-50"
                />
              );
            }

            const iso = new Date(
              current.getFullYear(),
              current.getMonth(),
              dayNumber
            )
              .toISOString()
              .slice(0, 10);
            const evs = eventsForDay(iso);
            const isToday =
              new Date().toDateString() ===
              new Date(
                current.getFullYear(),
                current.getMonth(),
                dayNumber
              ).toDateString();

            return (
              <div
                key={dayNumber}
                onClick={() =>
                  createEvent(
                    new Date(
                      current.getFullYear(),
                      current.getMonth(),
                      dayNumber
                    ).toISOString()
                  )
                }
                className={`min-h-[120px] border-r border-b border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs"
                        : "text-gray-700"
                    }`}
                  >
                    {dayNumber}
                  </span>
                </div>
                <div className="space-y-1">
                  {evs.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(ev);
                      }}
                      className="text-xs p-1.5 rounded truncate hover:shadow-sm transition-shadow"
                      style={{
                        backgroundColor: ev.color
                          ? `${ev.color}15`
                          : "#3B82F615",
                        borderLeft: `3px solid ${ev.color || "#3B82F6"}`,
                      }}
                    >
                      <div
                        className="font-medium truncate"
                        style={{ color: ev.color || "#3B82F6" }}
                      >
                        {ev.title}
                      </div>
                      {ev.start_date && (
                        <div className="text-gray-500 text-[10px]">
                          {formatTime(ev.start_date)}
                        </div>
                      )}
                    </div>
                  ))}
                  {evs.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium px-1.5">
                      +{evs.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEvent ? "Edit Event" : "New Event"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingEvent
                    ? "Update event details"
                    : "Add a new calendar event"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalData(null);
                  setEditingEvent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={modalData.title || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, title: e.target.value })
                  }
                  placeholder="e.g., Team Meeting"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    Start Date & Time
                  </label>
                  <div className="space-y-2">
                    <input
                      aria-label="start date"
                      type="date"
                      value={splitLocalDateTime(modalData.start_date).date}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          start_date: combineLocalDateTime(
                            e.target.value,
                            splitLocalDateTime(modalData.start_date).time
                          ),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      aria-label="start time"
                      value={splitLocalDateTime(modalData.start_date).time}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          start_date: combineLocalDateTime(
                            splitLocalDateTime(modalData.start_date).date,
                            e.target.value
                          ),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    End Date & Time
                  </label>
                  <div className="space-y-2">
                    <input
                      aria-label="end date"
                      type="date"
                      value={splitLocalDateTime(modalData.end_date).date}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          end_date: combineLocalDateTime(
                            e.target.value,
                            splitLocalDateTime(modalData.end_date).time
                          ),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      aria-label="end time"
                      value={splitLocalDateTime(modalData.end_date).time}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          end_date: combineLocalDateTime(
                            splitLocalDateTime(modalData.end_date).date,
                            e.target.value
                          ),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  Location
                </label>
                <input
                  type="text"
                  value={modalData.location || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, location: e.target.value })
                  }
                  placeholder="e.g., Conference Room A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={modalData.description || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, description: e.target.value })
                  }
                  placeholder="Add meeting agenda, notes, or other details..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1.5" />
                  Attendees
                </label>
                <input
                  type="text"
                  value={(modalData.attendees || []).join(", ")}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      attendees: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={modalData.color || "#3B82F6"}
                    onChange={(e) =>
                      setModalData({ ...modalData, color: e.target.value })
                    }
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <div className="flex gap-2">
                    {[
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                      "#EC4899",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setModalData({ ...modalData, color })}
                        className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            modalData.color === color
                              ? "#1F2937"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              {editingEvent && (
                <button
                  onClick={() =>
                    editingEvent.id && deleteEvent(editingEvent.id)
                  }
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div
                className={`flex items-center gap-3 ${
                  !editingEvent ? "ml-auto" : ""
                }`}
              >
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalData(null);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
                    saving ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    "Saving..."
                  ) : editingEvent ? (
                    <>
                      <Pencil className="w-4 h-4" /> Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
