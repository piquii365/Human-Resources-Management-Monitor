import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { fetchCalendarEvents } from "../api";

type EventItem = {
  id?: string | number;
  title?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
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
    // open modal instead of prompt — set modal state with initial iso
    const startDate = new Date(iso);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    setModalData({
      start_date: toLocalDateTimeInput(startDate),
      end_date: toLocalDateTimeInput(endDate),
      title: `Event on ${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`,
    });
    setIsModalOpen(true);
  };

  // modal state and helpers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [saving, setSaving] = useState(false);

  const handleModalSave = async () => {
    if (!modalData) return;
    // basic validation
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
      console.debug("Creating calendar event payload:", payload);

      const r = await fetch(`/api/calendar/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      interface CreateResp {
        success?: boolean;
        error?: string;
        message?: string;
      }
      let j: CreateResp | null = null;
      try {
        j = (await r.json()) as CreateResp;
      } catch (parseErr) {
        console.error("Failed to parse JSON response", parseErr);
      }
      console.debug("Create event response status", r.status, j);
      if (r.ok && j && j.success) {
        await refresh();
        setIsModalOpen(false);
        setModalData(null);
      } else {
        const msg =
          (j && (j.error || j.message)) || `Server returned ${r.status}`;
        alert(`Failed to create event: ${msg}`);
      }
    } catch (e) {
      console.error(e);
      alert("Create failed");
    } finally {
      setSaving(false);
    }
  };

  const editOrDeleteEvent = async (ev: EventItem) => {
    const newTitle = window.prompt(
      "Edit event title (leave empty to delete):",
      ev.title || ""
    );
    if (newTitle === null) return;
    try {
      if (newTitle === "") {
        const ok = window.confirm("Delete this event?");
        if (!ok) return;
        const r = await fetch(`/api/calendar/events/${ev.id}`, {
          method: "DELETE",
        });
        const j = await r.json();
        if (j.success) await refresh();
        else alert("Delete failed");
      } else {
        const r = await fetch(`/api/calendar/events/${ev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        const j = await r.json();
        if (j.success) await refresh();
        else alert("Update failed");
      }
    } catch (e) {
      console.error(e);
      alert("Operation failed");
    }
  };

  // compute how many blank cells to prepend so the 1st of month aligns with weekday
  const firstDayIndex = new Date(
    current.getFullYear(),
    current.getMonth(),
    1
  ).getDay();
  const totalSlots = Math.ceil((firstDayIndex + daysInMonth(current)) / 7) * 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <CalIcon className="w-5 h-5 text-[#5A5FEF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1931]">Calendar</h1>
            <p className="text-gray-600 text-sm">
              Manage events — click a day to create, click count to edit/delete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={prev}
            className="p-2 bg-white rounded-xl"
          >
            <ChevronLeft />
          </button>
          <div className="px-4 py-2 bg-white rounded-xl font-medium">
            {current.toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            aria-label="Next month"
            onClick={next}
            className="p-2 bg-white rounded-xl"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const slotIndex = idx;
            const dayNumber = slotIndex - firstDayIndex + 1;
            const isInMonth =
              dayNumber >= 1 && dayNumber <= daysInMonth(current);

            if (!isInMonth) {
              // empty placeholder to keep grid alignment
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-lg"
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
              <div key={dayNumber} className="relative">
                <div
                  onClick={() =>
                    createEvent(
                      new Date(
                        current.getFullYear(),
                        current.getMonth(),
                        dayNumber
                      ).toISOString()
                    )
                  }
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg border transition-colors duration-150 ${
                    isToday
                      ? "bg-[#5A5FEF] text-white font-bold border-[#4f51e8]"
                      : evs.length
                      ? "bg-blue-50 text-[#5A5FEF] font-medium border-transparent hover:border-gray-200 cursor-pointer"
                      : "text-gray-700 border-transparent hover:border-gray-200 cursor-pointer"
                  }`}
                >
                  {dayNumber}
                </div>
                {evs.length > 0 && (
                  <div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full leading-none cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (evs.length === 1) editOrDeleteEvent(evs[0]);
                      else {
                        const list = evs
                          .map((ev, idx) => `${idx + 1}. ${ev.title}`)
                          .join("\n");
                        const choice = window.prompt(
                          `Select event to edit:\n${list}`
                        );
                        const idx = choice ? parseInt(choice, 10) - 1 : -1;
                        if (isFinite(idx) && idx >= 0 && idx < evs.length)
                          editOrDeleteEvent(evs[idx]);
                      }
                    }}
                  >
                    {evs.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            className="px-3 py-2 bg-[#5A5FEF] text-white rounded"
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black opacity-30 z-0"
            onClick={() => {
              setIsModalOpen(false);
              setModalData(null);
            }}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-20 modal-content">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Add Event</h2>
                <p className="text-sm text-gray-500">Create a calendar event</p>
              </div>
              <div>
                <button
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalData(null);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Title
                </label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A5FEF]"
                  value={modalData.title || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, title: e.target.value })
                  }
                  placeholder="Event title"
                />

                <label className="text-xs font-medium text-gray-600 mt-2">
                  Location
                </label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                  value={modalData.location || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, location: e.target.value })
                  }
                  placeholder="Location (optional)"
                />

                <label className="text-xs font-medium text-gray-600 mt-2">
                  Attendees
                </label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none"
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
                  placeholder="Comma-separated emails or IDs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Start
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    aria-label="Start date"
                    className="w-1/2 border rounded px-3 py-2 focus:outline-none"
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
                  />
                  <select
                    aria-label="Start time"
                    className="w-1/2 border rounded px-3 py-2"
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
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="text-xs font-medium text-gray-600 mt-2">
                  End
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    aria-label="End date"
                    className="w-1/2 border rounded px-3 py-2 focus:outline-none"
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
                  />
                  <select
                    aria-label="End time"
                    className="w-1/2 border rounded px-3 py-2"
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
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="text-xs font-medium text-gray-600 mt-2">
                  Color
                </label>
                <input
                  type="color"
                  aria-label="Event color"
                  className="w-16 h-10 border rounded px-1 py-1"
                  value={modalData.color || "#5A5FEF"}
                  onChange={(e) =>
                    setModalData({ ...modalData, color: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">
                Description
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none"
                value={modalData.description || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border text-sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalData(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-[#5A5FEF] text-white rounded text-sm shadow ${
                  saving ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                }`}
                onClick={handleModalSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
