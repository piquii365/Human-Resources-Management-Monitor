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

export default function CalendarPageNew() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(new Date());

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const loadEvents = useCallback(async (monthDate: Date) => {
    setLoading(true);
    try {
      const from = startOfMonth(monthDate).toISOString().slice(0, 10);
      const to = endOfMonth(monthDate).toISOString().slice(0, 10);
      const res = await fetchCalendarEvents(from, to);
      let data: any[] = [];
      if (Array.isArray(res)) data = res;
      else if (
        res &&
        typeof res === "object" &&
        Array.isArray((res as any).data)
      )
        data = (res as any).data;
      setEvents(data as EventItem[]);
    } catch (err) {
      console.error("loadEvents", err);
      setEvents([]);
    } finally {
      setLoading(false);
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
    const title = window.prompt(
      "Create event title:",
      `Event on ${iso.slice(0, 10)}`
    );
    if (!title) return;
    try {
      const payload = {
        title,
        start_date: iso,
        end_date: new Date(
          new Date(iso).getTime() + 60 * 60 * 1000
        ).toISOString(),
      };
      const r = await fetch(`/api/calendar/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.success) await refresh();
      else alert("Failed to create event");
    } catch (e) {
      console.error(e);
      alert("Create failed");
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
          {Array.from({ length: daysInMonth(current) }).map((_, i) => {
            const day = i + 1;
            const iso = new Date(current.getFullYear(), current.getMonth(), day)
              .toISOString()
              .slice(0, 10);
            const evs = eventsForDay(iso);
            const isToday =
              new Date().toDateString() ===
              new Date(
                current.getFullYear(),
                current.getMonth(),
                day
              ).toDateString();
            return (
              <div key={day} className="relative">
                <div
                  onClick={() =>
                    createEvent(
                      new Date(
                        current.getFullYear(),
                        current.getMonth(),
                        day
                      ).toISOString()
                    )
                  }
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                    isToday
                      ? "bg-[#5A5FEF] text-white font-bold"
                      : evs.length
                      ? "bg-blue-50 text-[#5A5FEF] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {day}
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
    </div>
  );
}
