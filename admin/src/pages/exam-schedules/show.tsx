import React, { useMemo } from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  DateField,
  Show,
} from "@refinedev/mui";

import {
  Chip,
} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
} from "@mui/x-data-grid";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { format } from "date-fns";


type Room = {
  room_id: number;
  room_name: string;
  capacity: number;
};

type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  is_present: number;
  updated_at: string;
};

type ExamSchedule = {
  schedule_id: number;
  name_schedule: string;
  status: string;
  start_time: string;
  end_time: string;
  room?: Room;
  students?: Student[];
};

export const ExamScheduleShow: React.FC = () => {
  const translate = useTranslate();

  const {
    query: { data, isLoading },
  } = useShow<ExamSchedule>();

  const schedule = data?.data;

  // Các cột DataGrid cho danh sách sinh viên
  const studentColumns: GridColDef[] = useMemo(() => [
    {
      field: "student_id",
      headerName: translate("students.fields.student_id", "Student ID"),
      flex: 1,
    },
    {
      field: "last_name",
      headerName: translate("users.fields.last_name", "Last Name"),
      flex: 1.5,
    },
    {
      field: "first_name",
      headerName: translate("users.fields.first_name", "First Name"),
      flex: 1.5,
    },

    // {
    //   field: "is_present",
    //   headerName: translate("students.fields.is_present", "Present"),
    //   flex: 1,
    //   renderCell: ({ value }) => (value ? "Yes" : "No"),
    // },
    {
      field: "is_present",
      headerName: translate("students.fields.is_present", "Present"),
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }) => {
        const isYes = Boolean(value);
        const label = isYes
          ? translate("students.status.present", "Present")
          : translate("students.status.absent", "Absent");

        const color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = isYes ? "success" : "error";

        return <Chip label={label} color={color} size="small" variant="outlined" />;
      },
    },

    // {
    //   field: "updated_at",
    //   headerName: translate("students.fields.updated_at", "Last Updated"),
    //   flex: 2,
    // },
    {
      field: "updated_at",
      headerName: translate("students.fields.updated_at", "Last Updated"),
      flex: 2,
      renderCell: ({ value }) => {
        if (!value) return "-";
        const formatted = format(new Date(value), "dd/MM/yyyy HH:mm"); // hoặc "PPPp" cho định dạng quốc tế
        return formatted;
      },
    }
  ], [translate]);

  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Typography variant="h5" fontWeight="bold">
          {translate("exams.title", "Exam Schedule Details")}
        </Typography>

        <Divider />

        <Stack gap={1}>
          <Typography fontWeight="bold">Schedule ID</Typography>
          {schedule ? (
            <Typography>{schedule.schedule_id}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Schedule Name</Typography>
          {schedule ? (
            <Typography>{schedule.name_schedule}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Status</Typography>
          {schedule ? (
            <Typography>{schedule.status}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Start Time</Typography>
          {schedule ? (
            <DateField value={schedule.start_time} />
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">End Time</Typography>
          {schedule ? (
            <DateField value={schedule.end_time} />
          ) : (
            <Skeleton height="20px" width="200px" />
          )}
        </Stack>

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Room Information
        </Typography>
        {schedule?.room ? (
          <Stack gap={1}>
            <Typography>
              Room Name: <strong>{schedule.room.room_name}</strong>
            </Typography>
            <Typography>
              Capacity: <strong>{schedule.room.capacity}</strong>
            </Typography>
          </Stack>
        ) : (
          <Skeleton height="50px" width="100%" />
        )}

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Student List
        </Typography>

        {schedule?.students?.length ? (
          // <Paper style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={schedule.students.map((student) => ({
              ...student,
              id: student.student_id,
            }))}
            columns={studentColumns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            disableRowSelectionOnClick
          // autoHeight={false}
          />
          // </Paper>
        ) : (
          <Typography>No students found for this schedule.</Typography>
        )}
      </Stack>
    </Show>
  );
};


// import React, { useMemo } from "react";
// import { useShow, useTranslate } from "@refinedev/core";
// import {
//   Card,
//   Descriptions,
//   Table,
//   Typography,
//   Divider,
//   Skeleton,
//   Space,
// } from "antd";
// import dayjs from "dayjs";

// type Room = {
//   room_id: number;
//   room_name: string;
//   capacity: number;
// };

// type Student = {
//   student_id: number;
//   first_name: string;
//   last_name: string;
//   is_present: number;
//   updated_at: string;
// };

// type ExamSchedule = {
//   schedule_id: number;
//   name_schedule: string;
//   status: string;
//   start_time: string;
//   end_time: string;
//   room?: Room;
//   students?: Student[];
// };

// export const ExamScheduleShow: React.FC = () => {
//   const translate = useTranslate();

//   const {
//     query: { data, isLoading },
//   } = useShow<ExamSchedule>();

//   const schedule = data?.data;

//   const studentColumns = useMemo(
//     () => [
//       {
//         title: translate("students.fields.student_id", "Student ID"),
//         dataIndex: "student_id",
//         key: "student_id",
//         sorter: (a: Student, b: Student) => a.student_id - b.student_id,
//         width: 100,
//         fixed: "left",
//       },
//       {
//         title: translate("users.fields.first_name", "First Name"),
//         dataIndex: "first_name",
//         key: "first_name",
//         sorter: (a: Student, b: Student) =>
//           a.first_name.localeCompare(b.first_name),
//         width: 150,
//       },
//       {
//         title: translate("users.fields.last_name", "Last Name"),
//         dataIndex: "last_name",
//         key: "last_name",
//         sorter: (a: Student, b: Student) =>
//           a.last_name.localeCompare(b.last_name),
//         width: 150,
//       },
//       {
//         title: translate("students.fields.is_present", "Present"),
//         dataIndex: "is_present",
//         key: "is_present",
//         width: 100,
//         render: (value: number) =>
//           value ? (
//             <Typography.Text type="success" strong>
//               Yes
//             </Typography.Text>
//           ) : (
//             <Typography.Text type="danger" strong>
//               No
//             </Typography.Text>
//           ),
//         filters: [
//           { text: translate("common.yes", "Yes"), value: 1 },
//           { text: translate("common.no", "No"), value: 0 },
//         ],
//         onFilter: (value: any, record: Student) => record.is_present === value,
//       },
//       {
//         title: translate("students.fields.updated_at", "Last Updated"),
//         dataIndex: "updated_at",
//         key: "updated_at",
//         width: 180,
//         render: (value: string) =>
//           dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
//         sorter: (a: Student, b: Student) =>
//           dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix(),
//       },
//     ],
//     [translate]
//   );

//   return (
//     <Card
//       title={
//         <Typography.Title level={3} style={{ marginBottom: 0 }}>
//           {translate("exams.title", "Exam Schedule Details")}
//         </Typography.Title>
//       }
//       loading={isLoading}
//       style={{ maxWidth: 900, margin: "24px auto", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
//       bordered={false}
//     >
//       {!schedule && !isLoading ? (
//         <Typography.Text type="warning">No data found.</Typography.Text>
//       ) : (
//         <>
//           <Descriptions
//             bordered
//             column={1}
//             size="middle"
//             layout="vertical"
//             style={{ marginBottom: 24 }}
//           >
//             <Descriptions.Item label={translate("exams.fields.schedule_id", "Schedule ID")}>
//               {schedule ? (
//                 <Typography.Text code>{schedule.schedule_id}</Typography.Text>
//               ) : (
//                 <Skeleton.Input active size="small" style={{ width: 100 }} />
//               )}
//             </Descriptions.Item>

//             <Descriptions.Item label={translate("exams.fields.name_schedule", "Schedule Name")}>
//               {schedule ? schedule.name_schedule : <Skeleton.Input active size="small" />}
//             </Descriptions.Item>

//             <Descriptions.Item label={translate("exams.fields.status", "Status")}>
//               {schedule ? (
//                 <Typography.Text
//                   type={
//                     schedule.status.toLowerCase() === "active"
//                       ? "success"
//                       : schedule.status.toLowerCase() === "cancelled"
//                       ? "danger"
//                       : "secondary"
//                   }
//                   strong
//                 >
//                   {schedule.status}
//                 </Typography.Text>
//               ) : (
//                 <Skeleton.Input active size="small" />
//               )}
//             </Descriptions.Item>

//             <Descriptions.Item label={translate("exams.fields.start_time", "Start Time")}>
//               {schedule ? (
//                 <Typography.Text>
//                   {dayjs(schedule.start_time).format("dddd, DD/MM/YYYY HH:mm")}
//                 </Typography.Text>
//               ) : (
//                 <Skeleton.Input active size="small" />
//               )}
//             </Descriptions.Item>

//             <Descriptions.Item label={translate("exams.fields.end_time", "End Time")}>
//               {schedule ? (
//                 <Typography.Text>
//                   {dayjs(schedule.end_time).format("dddd, DD/MM/YYYY HH:mm")}
//                 </Typography.Text>
//               ) : (
//                 <Skeleton.Input active size="small" />
//               )}
//             </Descriptions.Item>
//           </Descriptions>

//           <Divider />

//           <Typography.Title level={4} style={{ marginBottom: 16 }}>
//             {translate("rooms.title", "Room Information")}
//           </Typography.Title>
//           {schedule?.room ? (
//             <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
//               <Descriptions.Item label={translate("rooms.fields.room_name", "Room Name")}>
//                 <Typography.Text strong>{schedule.room.room_name}</Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label={translate("rooms.fields.capacity", "Capacity")}>
//                 <Typography.Text strong>{schedule.room.capacity}</Typography.Text>
//               </Descriptions.Item>
//             </Descriptions>
//           ) : (
//             <Skeleton active paragraph={{ rows: 2 }} />
//           )}

//           <Divider />

//           <Typography.Title level={4} style={{ marginBottom: 16 }}>
//             {translate("students.title", "Student List")}
//           </Typography.Title>

//           {schedule?.students?.length ? (
//             <Table<Student>
//               dataSource={schedule.students.map((student) => ({
//                 ...student,
//                 key: student.student_id,
//               }))}
//               columns={studentColumns}
//               pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: ["5", "10", "20"] }}
//               scroll={{ x: 700, y: 350 }}
//               bordered
//               size="middle"
//             />
//           ) : (
//             <Typography.Text type="secondary">
//               {translate("students.no_students", "No students found for this schedule.")}
//             </Typography.Text>
//           )}
//         </>
//       )}
//     </Card>
//   );
// };
