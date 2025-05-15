import { CalendarEvent } from "@schedule-x/calendar";

type Props = {
  calendarEvent: CalendarEvent;
};

export default function TimeGridEvent({ calendarEvent }: Props) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`${calendarEvent.color} text-white p-0.5 text-center font-bold overflow-hidden h-full flex flex-col`}>
      <div className="text-sm px-1 truncate">{calendarEvent.title}</div>
        <p className="m-1 text-xs text-white">
          {formatTime(calendarEvent.start)} - {formatTime(calendarEvent.end)}
        </p>
        <div className="bg-white text-black p-2 text-xs text-center font-normal flex-grow flex flex-col justify-center items-center">
          <p className="text-black">{calendarEvent.description}</p>
          <p className="text-black">{calendarEvent.room}</p>
          <p className="text-black">{calendarEvent.teacher}</p>
        </div>
    </div>
  );
}
