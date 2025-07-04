import { CalendarEvent } from "@schedule-x/calendar";
import dayjs from "dayjs";

type Props = {
  calendarEvent: CalendarEvent;
};

export default function TimeGridEvent({ calendarEvent }: Props) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const duration = dayjs(calendarEvent.end).diff(dayjs(calendarEvent.start), "minute");

  return (
    <div className={`${calendarEvent.color} text-white p-0.5 text-center font-bold overflow-hidden h-full flex flex-col`}>
      <div className={`${calendarEvent.color} text-white px-2 pt-1 pb-0.5 text-center font-bold`}>
        <p className="text-sm truncate">{calendarEvent.title}</p>

        <div className="text-xs font-light leading-snug mt-0.5 whitespace-normal">
          {formatTime(calendarEvent.start)} - {formatTime(calendarEvent.end)} ({duration} phút)
        </div>
      </div>

      <div className="bg-white text-black p-2 text-xs text-center font-normal flex-grow flex flex-col justify-center items-center space-y-1">
        {calendarEvent.description && <p>{calendarEvent.description}</p>}
        {calendarEvent.room && <p>{calendarEvent.room}</p>}
        {calendarEvent.teacher && <p>{calendarEvent.teacher}</p>}
      </div>
    </div>
  );
}
