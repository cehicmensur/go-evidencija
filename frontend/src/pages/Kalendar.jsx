import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function Kalendar() {
  const [events, setEvents] = useState([]);
  const [greska, setGreska] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/godisnji`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const kalendarDogadjaji = data.map((o) => ({
          id: o.id,
          title: o.zaposlenik?.ime || "Nepoznato",
          start: new Date(o.od),
          end: new Date(o.do),
          status: o.status,
          vrsta: o.vrsta,
          napomena: o.napomena,
          zaposlenik: o.zaposlenik?.ime || "Nepoznato",
          allDay: true,
        }));

        setEvents(kalendarDogadjaji);
      })
      .catch(() => {
        setGreska("Greška kod učitavanja kalendara.");
      });
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#eab308";

    if (event.status === "odobreno") {
      backgroundColor = "#10b981";
    }

    if (event.status === "odbijeno") {
      backgroundColor = "#ef4444";
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "6px",
      },
    };
  };

  const formatDatum = (datum) => {
    return moment(datum).format("DD.MM.YYYY.");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        Kalendar odsustava
      </h1>

      <p className="text-slate-500 mb-8">
        Pregled odsustava po mjesecima
      </p>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow">
        <div className="flex gap-6 mb-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Odobreno</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Na čekanju</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Odbijeno</span>
          </div>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          messages={{
            next: "Sljedeći",
            previous: "Prethodni",
            today: "Danas",
            month: "Mjesec",
            week: "Sedmica",
            day: "Dan",
            agenda: "Agenda",
          }}
        />
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] shadow-xl">
            <h2 className="text-2xl font-bold mb-4">
              Detalji odsustva
            </h2>

            <div className="space-y-3">
              <p>
                <strong>Zaposlenik:</strong>{" "}
                {selectedEvent.zaposlenik}
              </p>

              <p>
                <strong>Vrsta:</strong>{" "}
                {selectedEvent.vrsta}
              </p>

              <p>
                <strong>Od:</strong>{" "}
                {formatDatum(selectedEvent.start)}
              </p>

              <p>
                <strong>Do:</strong>{" "}
                {formatDatum(selectedEvent.end)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedEvent.status}
              </p>

              <p>
                <strong>Napomena:</strong>{" "}
                {selectedEvent.napomena || "-"}
              </p>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 bg-slate-800 text-white px-4 py-2 rounded-lg"
            >
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kalendar;