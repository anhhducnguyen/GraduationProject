import { useContext, useEffect, useMemo } from 'react';
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/calendar.css"; // Default theme
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import TimeGridEvent from '../../components/time-grid-event';
import CustomEventModal from '../../components/event-modal';
// import Sidebar from '../components/side-bar.tsx';

// Import date-fns-tz for timezone conversion
import { formatInTimeZone } from 'date-fns-tz';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls'
import { ColorModeContext } from '../../context/color-mode';

// Define a type for your event data for better type safety
interface MyCalendarEvent {
  id: number | string;
  title: string;
  start: string;
  end: string;
  description?: string;
  room?: string;
  teacher?: string;
  color?: string;
  status?: string;
  [key: string]: any;
}

// Define a type for the raw API event item
interface ApiEventItem {
  schedule_id: number;
  start_time: string;
  end_time: string;
  room_id: number;
  status: 'scheduled' | 'completed' | 'cancelled' | string;
  name_schedule: string;
  room_name: string;
}

// Define a type for the API response structure
interface ApiResponse {
  results: ApiEventItem[];
}

function SchedulePage() {
  const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);
  const { mode } = useContext(ColorModeContext);

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
    ],
    defaultView: 'week',
    events: [],
    selectedDate: '2025-05-20',
    plugins: [
      createEventModalPlugin(),
      createDragAndDropPlugin(),
      calendarControls,
    ],
    isDark: mode === 'dark',
    locale: 'vi-VN',
  });

  useEffect(() => {
    // console.log('Current calendar date:', calendarControls.getDate(), calendarControls.getFirstDayOfWeek(), calendarControls.getLocale(), calendarControls.getWeekOptions());
    console.log('--- Calendar Controls Info ---');
  console.log('Current Date:', calendarControls.getDate());
  console.log('Current View:', calendarControls.getView());
  console.log('Visible Range:', calendarControls.getRange());
  console.log('First Day of Week:', calendarControls.getFirstDayOfWeek());
  console.log('Locale:', calendarControls.getLocale());
  console.log('Available Views:', calendarControls.getViews());
  console.log('Day Boundaries:', calendarControls.getDayBoundaries());
  console.log('Week Options:', calendarControls.getWeekOptions());
  console.log('Calendars:', calendarControls.getCalendars());
  console.log('Min Date:', calendarControls.getMinDate());
  console.log('Max Date:', calendarControls.getMaxDate());
  console.log('Month Grid Options:', calendarControls.getMonthGridOptions());
  console.log('------------------------------');
    // You can also set view or date here if you want
    // calendarControls.setView('week');
    // calendarControls.setDate('2025-05-20');
  }, [calendarControls]);

  useEffect(() => {
    fetch('/api/v1/exam-schedule')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json() as Promise<ApiResponse>;
      })
      .then(data => {
        if (!data || !data.results || !Array.isArray(data.results)) {
          console.error('Fetched data.results is not in the expected format:', data);
          return;
        }

        const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

        const mappedEvents: MyCalendarEvent[] = data.results.map((item: ApiEventItem) => {
          const localStartTime = formatInTimeZone(
            item.start_time,
            vietnamTimeZone,
            'yyyy-MM-dd HH:mm'
          );

          const localEndTime = formatInTimeZone(
            item.end_time,
            vietnamTimeZone,
            'yyyy-MM-dd HH:mm'
          );

          return {
            id: item.schedule_id,
            title: item.name_schedule,
            start: localStartTime,
            end: localEndTime,
            description: `${item.name_schedule}`,
            room: item.room_name,
            status: item.status,
            color:
              item.status === 'scheduled'
                ? 'bg-blue-900'
                : item.status === 'completed'
                ? 'bg-green-500'
                : 'bg-orange-500',
          };
        });

        if (calendar) {
          calendar.events.set(mappedEvents);
        }
      })
      .catch(error => console.error('Lỗi fetch dữ liệu:', error));
  }, [calendar]);

  return (
    <div className="flex h-screen">
      {/* <Sidebar /> */}
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

// import { useContext, useEffect } from 'react';
// import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
// import {
//   createViewDay,
//   createViewWeek,
//   createViewMonthGrid,
// } from "@schedule-x/calendar";
// import "@schedule-x/theme-default/dist/calendar.css"; // Default theme
// // import '@schedule-x/theme-shadcn/dist/index.css'; // Shadcn theme (remove or keep one)
// import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
// import { createEventModalPlugin } from '@schedule-x/event-modal';
// import TimeGridEvent from '../../components/time-grid-event';
// import CustomEventModal from '../../components/event-modal';
// // import Sidebar from '../components/side-bar.tsx';

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
//   status?: string; // Added status to be potentially used by custom components
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
//   const calendarControls = createCalendarControlsPlugin();
//   let { mode } = useContext(ColorModeContext);
  
//   const calendar = useCalendarApp({
//     views: [
//       createViewDay(),      // Correct: No arguments for default day view
//       createViewWeek(),     // Correct: No arguments for default week view
//       createViewMonthGrid() // Correct: No arguments for default month grid view
//     ],
//     defaultView: 'week',
//     events: [],
//     selectedDate: '2025-05-20',
//     plugins: [
//       createEventModalPlugin(),
//       createDragAndDropPlugin(),
//       calendarControls,
//     ],
//     isDark: mode === 'dark',

//     // isDark: false,
//     // isDark: mode === "dark",
    
//     locale: 'vi-VN',
//   });
//   // calendarControls.getDate();
//     // calendarControls.setView('week')
//     // const firstDay = calendarControls.getFirstDayOfWeek();
//     // console.log(firstDay);
//   useEffect(() => {
//     fetch('/api/v1/exam-schedule')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json() as Promise<ApiResponse>;
//       })
//       .then(data => {
//         if (!data || !data.results || !Array.isArray(data.results)) {
//           console.error('Fetched data.results is not in the expected format:', data);
//           return;
//         }

//         const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

//         const mappedEvents: MyCalendarEvent[] = data.results.map((item: ApiEventItem) => {
//           const localStartTime = formatInTimeZone(
//             item.start_time,
//             vietnamTimeZone,
//             'yyyy-MM-dd HH:mm'
//           );

//           const localEndTime = formatInTimeZone(
//             item.end_time,
//             vietnamTimeZone,
//             'yyyy-MM-dd HH:mm'
//           );

//           return {
//             id: item.schedule_id,
//             title: item.name_schedule,
//             start: localStartTime,
//             end: localEndTime,
//             description: `${item.name_schedule}`,
//             room: item.room_name,
//             status: item.status, // Pass status for custom components
//             color: item.status === 'scheduled'
//               ? 'bg-blue-900'
//               : item.status === 'completed'
//               ? 'bg-green-500'
//               : 'bg-orange-500',
//           };
//         });

//         if (calendar) {
//           calendar.events.set(mappedEvents);
//         }
//       })
//       .catch(error => console.error('Lỗi fetch dữ liệu:', error));
//   }, [calendar]);

//   return (
//     <div className="flex h-screen">
//       {/* <Sidebar /> */}
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

// // import { useEffect } from "react";
// // import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
// // import { createViewWeek } from "@schedule-x/calendar";
// // import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";

// // const calendarControls = createCalendarControlsPlugin();

// // const SchedulePage = () => {
// //   const calendar = useCalendarApp({
// //     plugins: [calendarControls],
// //     views: [createViewWeek()],
// //     defaultView: "week",
// //     selectedDate: "2025-05-20",
// //     locale: "vi-VN",
// //     // options: {
// //     //   week: {
// //     //     firstDayOfWeek: 1, // 1 = Thứ Hai
// //     //   },
// //     // },
// //   });

// //   useEffect(() => {
// //     const firstDay = calendarControls.getFirstDayOfWeek();
// //     console.log("Ngày đầu tuần là:", firstDay); // 0 = Chủ Nhật, 1 = Thứ Hai, ...
// //   }, []);

// //   return (
// //     <ScheduleXCalendar
// //       calendarApp={calendar}
// //     />
// //   );
// // };

// // export default SchedulePage;
