
import { useContext, useEffect, useMemo } from 'react';
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/calendar.css";
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import TimeGridEvent from '../../components/time-grid-event';
import CustomEventModal from '../../components/event-modal';
import { formatInTimeZone } from 'date-fns-tz';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import { ColorModeContext } from '../../context/color-mode';
import type { ApiResponse, ApiEventItem, MyCalendarEvent } from './types'

function SchedulePage() {
  const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);
  const { mode } = useContext(ColorModeContext);

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
    ],
    defaultView: 'month-grid',
    events: [],
    selectedDate: new Date().toISOString().split('T')[0],
    plugins: [
      createEventModalPlugin(),
      createDragAndDropPlugin(),
      calendarControls,
    ],
    locale: 'vi-VN',
  });

  // Thiết lập theme và giới hạn giờ hiển thị
  useEffect(() => {
    calendarControls.setDayBoundaries({
      start: '03:00',
      end: '22:00',
    });
    if (calendar) {
      calendar.setTheme(mode === 'dark' ? 'dark' : 'light');
    }
  }, [mode, calendar]);

  // Hàm fetch dữ liệu từ API và cập nhật lên lịch
  const fetchData = () => {
    const range = calendarControls.getRange();
    if (!range) return;

    const params = new URLSearchParams({
      _start: range.start,
      _end: range.end,
    });

    fetch(`/api/v1/exam-schedule?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        if (!data || !Array.isArray(data.results)) {
          console.error('Fetched data.results is not in the expected format:', data);
          return;
        }

        const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

        const mappedEvents: MyCalendarEvent[] = data.results.map((item: ApiEventItem) => ({
          id: item.schedule_id,
          title: item.name_schedule,
          start: formatInTimeZone(item.start_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
          end: formatInTimeZone(item.end_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
          description: item.name_schedule,
          room: item.room_name,
          status: item.status,
          color:
            item.status === 'scheduled'
              ? 'bg-blue-900'
              : item.status === 'completed'
                ? 'bg-green-500'
                : 'bg-orange-500',
        }));

        if (calendar) {
          calendar.events.set(mappedEvents);
        }
      })
      .catch(error => console.error('Lỗi fetch dữ liệu:', error));
  };

  // Theo dõi thay đổi ngày hoặc view, và fetch dữ liệu ban đầu
  useEffect(() => {
    let prevDate = calendarControls.getDate();
    let prevView = calendarControls.getView();

    // Fetch dữ liệu ngay lần đầu
    fetchData();

    const interval = setInterval(() => {
      const currentDate = calendarControls.getDate();
      const currentView = calendarControls.getView();

      if (currentDate !== prevDate || currentView !== prevView) {
        prevDate = currentDate;
        prevView = currentView;
        fetchData();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [calendar, calendarControls]);

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <ScheduleXCalendar
          calendarApp={calendar}
          customComponents={{
            timeGridEvent: TimeGridEvent,
            eventModal: CustomEventModal,
          }}
        />
      </div>
    </div>
  );
}

export default SchedulePage;

// import { useContext, useEffect, useMemo } from 'react';
// import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
// import {
//   createViewDay,
//   createViewWeek,
//   createViewMonthGrid,
// } from "@schedule-x/calendar";
// import "@schedule-x/theme-default/dist/calendar.css"; // Default theme
// import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
// import { createEventModalPlugin } from '@schedule-x/event-modal';
// import TimeGridEvent from '../../components/time-grid-event';
// import CustomEventModal from '../../components/event-modal';

// // Import date-fns-tz for timezone conversion
// import { formatInTimeZone } from 'date-fns-tz';
// import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
// import { ColorModeContext } from '../../context/color-mode';

// // Define a type for your event data for better type safety
// interface MyCalendarEvent {
//   id: number | string;
//   title: string;
//   start: string;
//   end: string;
//   description?: string;
//   room?: string;
//   teacher?: string;
//   color?: string;
//   status?: string;
//   [key: string]: any;
// }

// // Define a type for the raw API event item
// interface ApiEventItem {
//   schedule_id: number;
//   start_time: string;
//   end_time: string;
//   room_id: number;
//   status: 'scheduled' | 'completed' | 'cancelled' | string;
//   name_schedule: string;
//   room_name: string;
// }

// // Define a type for the API response structure
// interface ApiResponse {
//   results: ApiEventItem[];
// }

// function SchedulePage() {
//   const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);
//   const { mode } = useContext(ColorModeContext);

//   const calendar = useCalendarApp({
//     views: [
//       createViewDay(),
//       createViewWeek(),
//       createViewMonthGrid(),
//     ],
//     // defaultView: 'week',
//     defaultView: 'month-grid',
//     events: [],
//     selectedDate: new Date().toISOString().split('T')[0],
//     plugins: [
//       createEventModalPlugin(),
//       createDragAndDropPlugin(),
//       calendarControls,
//     ],
//     locale: 'vi-VN',
//   });

//   useEffect(() => {
//     calendarControls.setDayBoundaries({
//       start: '03:00',
//       end: '22:00'
//     });
//     if (calendar) {
//       calendar.setTheme(mode === 'dark' ? 'dark' : 'light');
//     }
//   }, [mode, calendar]);

//   useEffect(() => {
//     let prevDate = calendarControls.getDate();
//     let prevView = calendarControls.getView();

//     const interval = setInterval(() => {
//       const currentDate = calendarControls.getDate();
//       const currentView = calendarControls.getView();

//       // Nếu date hoặc view thay đổi, thực hiện fetch dữ liệu
//       if (currentDate !== prevDate || currentView !== prevView) {
//         prevDate = currentDate;
//         prevView = currentView;

//         const range = calendarControls.getRange();
//         if (!range) return;

//         console.log('--- Calendar Controls Info ---');
//         console.log('Current Date:', currentDate);
//         console.log('Current View:', currentView);
//         console.log('Visible Range:', range);
//         console.log('Current Date:', calendarControls.getDate());
//         console.log('Current View:', calendarControls.getView());
//         console.log('Visible Range:', calendarControls.getRange());
//         console.log('First Day of Week:', calendarControls.getFirstDayOfWeek());
//         console.log('Locale:', calendarControls.getLocale());
//         console.log('Available Views:', calendarControls.getViews());
//         console.log('Day Boundaries:', calendarControls.getDayBoundaries());
//         console.log('Week Options:', calendarControls.getWeekOptions());
//         console.log('Calendars:', calendarControls.getCalendars());
//         console.log('Min Date:', calendarControls.getMinDate());
//         console.log('Max Date:', calendarControls.getMaxDate());
//         console.log('Month Grid Options:', calendarControls.getMonthGridOptions());
//         console.log('------------------------------');

//         const params = new URLSearchParams({
//           _start: range.start,
//           _end: range.end
//         });

//         fetch(`/api/v1/exam-schedule?${params.toString()}`)
//           .then(response => {
//             if (!response.ok) {
//               throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//           })
//           .then(data => {
//             if (!data || !Array.isArray(data.results)) {
//               console.error('Fetched data.results is not in the expected format:', data);
//               return;
//             }

//             const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

//             const mappedEvents: MyCalendarEvent[] = data.results.map((item: ApiEventItem) => ({
//               id: item.schedule_id,
//               title: item.name_schedule,
//               start: formatInTimeZone(item.start_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
//               end: formatInTimeZone(item.end_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
//               description: item.name_schedule,
//               room: item.room_name,
//               status: item.status,
//               color:
//                 item.status === 'scheduled'
//                   ? 'bg-blue-900'
//                   : item.status === 'completed'
//                     ? 'bg-green-500'
//                     : 'bg-orange-500',
//             }));

//             console.log(data.results);

//             if (calendar) {
//               calendar.events.set(mappedEvents);
//             }
//           })
//           .catch(error => console.error('Lỗi fetch dữ liệu:', error));
//       }
//     }, 500); 

//     return () => clearInterval(interval);
//   }, [calendar, calendarControls]);

//   return (
//     <div className="flex h-screen">
//       <div className="flex-1">
//         <ScheduleXCalendar
//           calendarApp={calendar}
//           customComponents={{
//             timeGridEvent: TimeGridEvent,
//             eventModal: CustomEventModal,
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default SchedulePage;
