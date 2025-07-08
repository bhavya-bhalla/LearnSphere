import React, { useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

Modal.setAppElement("#root");

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);

  // Add New Event
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setEventTitle("");
    setEditMode(false);
    setModalOpen(true);
  };

  // Edit Existing Event
  const handleSelectEvent = (event) => {
    const index = events.findIndex((e) =>
      isSameDay(e.start, event.start) && e.title === event.title
    );
    setSelectedDate(event.start);
    setEventTitle(event.title);
    setEditMode(true);
    setSelectedEventIndex(index);
    setModalOpen(true);
  };

  // Save Event (Add or Update)
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;

    if (editMode && selectedEventIndex !== null) {
      const updated = [...events];
      updated[selectedEventIndex] = {
        ...updated[selectedEventIndex],
        title: eventTitle,
      };
      setEvents(updated);
    } else {
      setEvents([
        ...events,
        {
          title: eventTitle,
          start: selectedDate,
          end: selectedDate,
          allDay: true,
        },
      ]);
    }

    setEventTitle("");
    setModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = () => {
    if (editMode && selectedEventIndex !== null) {
      const updated = events.filter((_, i) => i !== selectedEventIndex);
      setEvents(updated);
      setModalOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        📆 Full Calendar View
      </h2>

      <div className="overflow-x-auto">
        <div style={{ minWidth: "750px", height: "500px" }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            views={["month", "week", "day"]}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            popup
            style={{ height: "100%" }}
            dayPropGetter={(date) => {
              const hasEvent = events.some((event) =>
                isSameDay(event.start, date)
              );
              return {
                style: {
                  backgroundColor: hasEvent ? "#fef9c3" : undefined, // Yellow-100
                },
              };
            }}
          />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Add/Edit Event"
        className="relative z-50 bg-white p-6 rounded-xl shadow-md w-full max-w-sm mx-auto border border-gray-200"
        overlayClassName="fixed inset-0 z-40 bg-black bg-opacity-40 flex items-center justify-center"
      >
        <h3 className="text-lg font-semibold mb-3 text-center">
          {editMode ? "Edit Event" : "Add Event"} for{" "}
          {selectedDate?.toDateString()}
        </h3>
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Enter event title"
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          {editMode && (
            <button
              onClick={handleDeleteEvent}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSaveEvent}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {editMode ? "Update" : "Add"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventCalendar;
