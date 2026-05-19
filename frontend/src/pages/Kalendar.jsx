import { useEffect, useState } from "react";

import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function Kalendar() {
  const [dogadjaji, setDogadjaji] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/godisnji", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {

        const events = data
          .filter((z) => z.status === "odobreno")
          .map((z) => ({
            title: z.zaposlenik?.ime,
            start: new Date(z.od),
            end: new Date(z.do),
          }));

        setDogadjaji(events);
      });

  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Kalendar godišnjih odmora
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow">
        <Calendar
          localizer={localizer}
          events={dogadjaji}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
        />
      </div>
    </div>
  );
}

export default Kalendar;