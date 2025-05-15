// import './App.css';
// import './index.css';
// import HomePage from './home/HomePage.tsx';
// import { Route, Routes, useLocation } from "react-router-dom";



// import { useEffect } from 'react';
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
// import TimeGridEvent from './components/time-grid-event.tsx';
// import CustomEventModal from './components/event-modal.tsx';
// import Sidebar from './components/side-bar.tsx';

// // Import date-fns-tz for timezone conversion
// import { formatInTimeZone } from 'date-fns-tz';

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

// function App() {
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
//       createDragAndDropPlugin()
//     ],
//     // locale: 'vi-VN',
//   });

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
//       <Sidebar />
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

// export default App;



import './App.css';
import './index.css';
import HomePage from './home/HomePage.tsx';
import NewsPage from './news/NewsPage.tsx';
import Sidebar from './components/side-bar';
import SchedulePage from './schedule/SchedulePage.tsx';


import { Route, Routes } from "react-router-dom";

function App() {
  return (  // Bạn đã thiếu return ở đây
    <div className="app">
      <Sidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
      </Routes>      
    </div>
  );
}

export default App;