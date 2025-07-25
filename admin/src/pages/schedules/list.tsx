
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
import CustomEventModal from './show';
import { formatInTimeZone } from 'date-fns-tz';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import { ColorModeContext } from '../../context/color-mode';
import type { ApiResponse, ApiEventItem, MyCalendarEvent } from './types';

import React, { useState } from 'react';
import { Button, Flex } from 'antd';
import { IoCalendarSharp } from "react-icons/io5";
import type { ConfigProviderProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslate } from "@refinedev/core";
import { RiFileExcel2Fill } from 'react-icons/ri';

import { Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { format, parseISO } from 'date-fns';


const token = localStorage.getItem("refine-auth");

const props: UploadProps = {
  name: 'file',
  accept: '.xlsx,.xls',
  showUploadList: false,
  action: 'https://graduationproject-nx7m.onrender.com/api/v1/exam-schedule/import', 
  headers: {
    Authorization: `Bearer ${token}`, 
  },
  onChange(info) {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
    }
  },
};

type SizeType = ConfigProviderProps['componentSize'];

function SchedulePage() {
  const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);
  const { mode } = useContext(ColorModeContext);
  const [size, setSize] = useState<SizeType>('large');
  const navigate = useNavigate();
  const translate = useTranslate();


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
    // locale: 'vi-VN',
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

    fetch(`https://graduationproject-nx7m.onrender.com/api/v1/exam-schedule?${params.toString()}`, {
    // fetch(`http://localhost:5000/api/v1/exam-schedule?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`,
      },
    })
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
          // start: formatInTimeZone(item.start_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
          // end: formatInTimeZone(item.end_time, vietnamTimeZone, 'yyyy-MM-dd HH:mm'),
          start: format(parseISO(item.start_time), 'yyyy-MM-dd HH:mm'),
        end: format(parseISO(item.end_time), 'yyyy-MM-dd HH:mm'),
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
        <Flex gap="small" wrap justify="end" className="mb-4">
          <Upload {...props}>
            <Button icon={<RiFileExcel2Fill />} size={size} style={{ backgroundColor: '#1976d2', color: 'white', borderColor: '#1890ff' }}>
              {translate("schedules.import_excel", "Nhập lịch từ Excel")}
            </Button>
          </Upload>

          <Button
            icon={<IoCalendarSharp />}
            size={size}
            style={{
              backgroundColor: '#1976d2',
              borderColor: '#1890ff',
              color: 'white',
            }}
            onClick={() => navigate('/exam-schedules/new')}
          >
            {translate("schedules.buttons.add", "Add exam schedule")}
          </Button>

          <Button
            shape="circle"
            icon={<DownloadOutlined />}
            size={size}
            style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
          />
        </Flex>

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


// import React, { useEffect, useMemo, useContext, useState } from 'react';
// import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
// import {
//   createViewDay,
//   createViewWeek,
//   createViewMonthGrid,
// } from "@schedule-x/calendar";
// import "@schedule-x/theme-default/dist/calendar.css";
// import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
// import { createEventModalPlugin } from '@schedule-x/event-modal';
// import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';

// import TimeGridEvent from '../../components/time-grid-event';
// import CustomEventModal from './show';
// import { formatInTimeZone } from 'date-fns-tz';
// import { ColorModeContext } from '../../context/color-mode';
// import type { ApiResponse, ApiEventItem, MyCalendarEvent } from './types';

// import { Button, Flex, Upload, message } from 'antd';
// import { DownloadOutlined } from '@ant-design/icons';
// import { IoCalendarSharp } from "react-icons/io5";
// import { RiFileExcel2Fill } from 'react-icons/ri';
// import type { UploadProps } from 'antd';
// import { useTranslate } from "@refinedev/core";
// import { useNavigate } from 'react-router-dom';
// import type { ConfigProviderProps } from 'antd';

// const uploadProps: UploadProps = {
//   name: 'file',
//   accept: '.xlsx,.xls',
//   showUploadList: false,
//   action: '/api/v1/exam-schedule/import',
//   onChange(info) {
//     if (info.file.status === 'done') {
//       message.success(`${info.file.name} uploaded successfully`);
//     } else if (info.file.status === 'error') {
//       message.error(`${info.file.name} upload failed.`);
//     }
//   },
// };

// type SizeType = ConfigProviderProps['componentSize'];

// const TopControls = ({ size, translate, navigate }: {
//   size: SizeType,
//   translate: ReturnType<typeof useTranslate>,
//   navigate: ReturnType<typeof useNavigate>
// }) => (
//   <Flex gap="small" wrap justify="end" className="mb-4">
//     <Upload {...uploadProps}>
//       <Button icon={<RiFileExcel2Fill />} size={size} style={{ backgroundColor: '#1976d2', color: 'white', borderColor: '#1890ff' }}>
//         {translate("schedules.import_excel", "Nhập lịch từ Excel")}
//       </Button>
//     </Upload>

//     <Button
//       icon={<IoCalendarSharp />}
//       size={size}
//       style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
//       onClick={() => navigate('/exam-schedules/new')}
//     >
//       {translate("schedules.buttons.add", "Add exam schedule")}
//     </Button>

//     <Button
//       shape="circle"
//       icon={<DownloadOutlined />}
//       size={size}
//       style={{ backgroundColor: '#1976d2', borderColor: '#1890ff', color: 'white' }}
//     />
//   </Flex>
// );

// function SchedulePage() {
//   const { mode } = useContext(ColorModeContext);
//   const [size] = useState<SizeType>('large');
//   const translate = useTranslate();
//   const navigate = useNavigate();

//   const calendarControls = useMemo(() => createCalendarControlsPlugin(), []);
//   const calendar = useCalendarApp({
//     views: [
//       createViewDay(),
//       createViewWeek(),
//       createViewMonthGrid(),
//     ],
//     defaultView: 'month-grid',
//     events: [],
//     selectedDate: new Date().toISOString().split('T')[0],
//     plugins: [
//       createEventModalPlugin(),
//       createDragAndDropPlugin(),
//       calendarControls,
//     ],
//   });

//   useEffect(() => {
//     calendarControls.setDayBoundaries({ start: '03:00', end: '22:00' });
//     if (calendar) {
//       calendar.setTheme(mode === 'dark' ? 'dark' : 'light');
//     }
//   }, [mode]);

//   const fetchData = () => {
//     const range = calendarControls.getRange();
//     if (!range) return;

//     const params = new URLSearchParams({ _start: range.start, _end: range.end });

//     fetch(`/api/v1/exam-schedule?${params.toString()}`)
//       .then(res => res.ok ? res.json() : Promise.reject(res))
//       .then((data: ApiResponse) => {
//         if (!Array.isArray(data.results)) return;
//         const mapped: MyCalendarEvent[] = data.results.map((item: ApiEventItem) => ({
//           id: item.schedule_id,
//           title: item.name_schedule,
//           start: formatInTimeZone(item.start_time, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm'),
//           end: formatInTimeZone(item.end_time, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm'),
//           description: item.name_schedule,
//           room: item.room_name,
//           status: item.status,
//           color:
//             item.status === 'scheduled' ? 'bg-blue-900' :
//             item.status === 'completed' ? 'bg-green-500' : 'bg-orange-500',
//         }));
//         if (calendar) {
//           calendar.events.set(mapped);
//         }
//       })
//       .catch(error => console.error('Fetch error:', error));
//   };

//   useEffect(() => {
//     let prevDate = calendarControls.getDate();
//     let prevView = calendarControls.getView();

//     fetchData();

//     const interval = setInterval(() => {
//       const currentDate = calendarControls.getDate();
//       const currentView = calendarControls.getView();

//       if (currentDate !== prevDate || currentView !== prevView) {
//         prevDate = currentDate;
//         prevView = currentView;
//         fetchData();
//       }
//     }, 500);

//     return () => clearInterval(interval);
//   }, [calendar]);

//   return (
//     <div className="flex h-screen">
//       <div className="flex-1">
//         {/* ✅ Render nhóm nút sớm để giảm LCP */}
//         <TopControls size={size} translate={translate} navigate={navigate} />

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
