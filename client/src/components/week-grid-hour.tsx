import { CalendarEvent } from "@schedule-x/calendar";

type Props = {
    calendarEvent: CalendarEvent;
};

export default function TimeGridHeader({ calendarEvent }: Props) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  };

  return (
    <div className="text-gray-800 font-medium text-sm p-1 text-center">
      {formatTime(calendarEvent.date)}
    </div>
  );
}
