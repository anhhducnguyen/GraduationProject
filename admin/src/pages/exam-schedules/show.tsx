// import React, { useEffect, useMemo } from "react";
// import { useShow, useTranslate } from "@refinedev/core";
// import {
//   DateField,
//   Show,
// } from "@refinedev/mui";
// import {
//   Chip,
//   Typography,
//   Divider,
//   Skeleton,
//   Stack,
//   Button,
//   Grid,
// } from "@mui/material";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { format } from "date-fns";

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
//     query: { data, isLoading, isFetching, refetch },
//   } = useShow<ExamSchedule>();

//   const schedule = data?.data;

//   useEffect(() => {
//     const interval = setInterval(() => refetch(), 5000);
//     return () => clearInterval(interval);
//   }, [refetch]);

//   const renderPresenceChip = (value: number) => {
//     const isPresent = Boolean(value);
//     return (
//       <Chip
//         label={
//           isPresent
//             ? translate("students.status.present", "Present")
//             : translate("students.status.absent", "Absent")
//         }
//         color={isPresent ? "success" : "error"}
//         size="small"
//         variant="outlined"
//       />
//     );
//   };

//   const renderDate = (value: string) => {
//     return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "-";
//   };

//   const renderStatusChip = (value: string | undefined) => {
//     if (!value) return <Skeleton height="20px" width="100px" />;

//     let color:
//       | "default"
//       | "primary"
//       | "secondary"
//       | "error"
//       | "info"
//       | "success"
//       | "warning" = "default";
//     let label = value;

//     switch (value) {
//       case "scheduled":
//         color = "info";
//         label = translate("schedules.status.scheduled", "Scheduled");
//         break;
//       case "completed":
//         color = "success";
//         label = translate("schedules.status.completed", "Completed");
//         break;
//       case "cancelled":
//         color = "error";
//         label = translate("schedules.status.cancelled", "Cancelled");
//         break;
//     }

//     return <Chip label={label} color={color} size="small" variant="outlined" />;
//   };

//   const studentColumns: GridColDef[] = useMemo(
//     () => [
//       {
//         field: "student_id",
//         headerName: translate("students.fields.student_id", "Student ID"),
//         flex: 1,
//       },
//       {
//         field: "last_name",
//         headerName: translate("users.fields.last_name", "Last Name"),
//         flex: 1.5,
//       },
//       {
//         field: "first_name",
//         headerName: translate("users.fields.first_name", "First Name"),
//         flex: 1.5,
//       },
//       {
//         field: "is_present",
//         headerName: translate("students.fields.is_present", "Present"),
//         flex: 1,
//         minWidth: 120,
//         renderCell: ({ value }) => renderPresenceChip(value),
//       },
//       {
//         field: "updated_at",
//         headerName: translate("students.fields.updated_at", "Last Updated"),
//         flex: 2,
//         renderCell: ({ value }) => renderDate(value),
//       },
//     ],
//     [translate]
//   );

//   return (
//     <Show isLoading={isLoading}>
//       <Stack gap={2}>
//         <Grid container spacing={2}>
//           {([
//             ["Schedule ID", schedule?.schedule_id],
//             ["Schedule Name", schedule?.name_schedule],
//             ["Status", renderStatusChip(schedule?.status)],
//             [
//               "Start Time",
//               schedule?.start_time ? (
//                 <DateField value={schedule.start_time} />
//               ) : (
//                 <Skeleton height="20px" width="100px" />
//               ),
//             ],
//             [
//               "End Time",
//               schedule?.end_time ? (
//                 <DateField value={schedule.end_time} />
//               ) : (
//                 <Skeleton height="20px" width="100px" />
//               ),
//             ],
//             ["Room Name", schedule?.room?.room_name],
//             ["Capacity", schedule?.room?.capacity],
//           ] as [string, React.ReactNode][]).map(([label, value]) => (
//             <React.Fragment key={label}>
//               <Grid item xs={4} sm={3}>
//                 <Typography fontWeight="bold">{label}</Typography>
//               </Grid>
//               <Grid item xs={8} sm={9}>
//                 {value !== undefined ? (
//                   typeof value === "string" || typeof value === "number" ? (
//                     <Typography>{value}</Typography>
//                   ) : (
//                     value
//                   )
//                 ) : (
//                   <Skeleton height="20px" width="200px" />
//                 )}
//               </Grid>
//             </React.Fragment>
//           ))}
//         </Grid>

//         <Divider />

//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//         >
//           <Typography variant="h6" fontWeight="bold">
//             Student List
//           </Typography>
//           <Button
//             variant="outlined"
//             onClick={() => refetch()}
//             disabled={isFetching}
//           >
//             {isFetching ? "Refreshing..." : "Refresh"}
//           </Button>
//         </Stack>

//         {schedule?.students?.length ? (
//           <DataGrid
//             rows={schedule.students
//               .filter((s) => s.student_id != null)
//               .map((s) => ({ ...s, id: s.student_id }))}
//             columns={studentColumns}
//             pageSizeOptions={[20, 50, 100]}
//             initialState={{
//               pagination: { paginationModel: { pageSize: 50, page: 0 } },
//             }}
//             disableRowSelectionOnClick
//           />
//         ) : (
//           <Typography>No students found for this schedule.</Typography>
//         )}
//       </Stack>
//     </Show>
//   );
// };

import React, { useEffect, useMemo } from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  Show,
} from "@refinedev/mui";
import {
  Chip,
  Typography,
  Divider,
  Skeleton,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
    query: { data, isLoading, isFetching, refetch },
  } = useShow<ExamSchedule>();

  const schedule = data?.data;

  useEffect(() => {
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const renderPresenceChip = (value: number) => {
    const isPresent = Boolean(value);
    return (
      <Chip
        label={
          isPresent
            ? translate("students.status.present", "Present")
            : translate("students.status.absent", "Absent")
        }
        color={isPresent ? "success" : "error"}
        size="small"
        variant="outlined"
      />
    );
  };

  // Sửa hàm renderDate để hiển thị theo format mong muốn
  const renderDate = (value: string) => {
    // Format: Thứ viết tắt (3 ký tự)/Ngày/4 số năm Giờ:Phút
    // VD: Fri/08/2025 09:00
    return value ? format(new Date(value), "EEE/dd/yyyy HH:mm") : "-";
  };

  const renderStatusChip = (value: string | undefined) => {
    if (!value) return <Skeleton height="20px" width="100px" />;

    let color:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning" = "default";
    let label = value;

    switch (value) {
      case "scheduled":
        color = "info";
        label = translate("schedules.status.scheduled", "Scheduled");
        break;
      case "completed":
        color = "success";
        label = translate("schedules.status.completed", "Completed");
        break;
      case "cancelled":
        color = "error";
        label = translate("schedules.status.cancelled", "Cancelled");
        break;
    }

    return <Chip label={label} color={color} size="small" variant="outlined" />;
  };

  const studentColumns: GridColDef[] = useMemo(
    () => [
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
      {
        field: "is_present",
        headerName: translate("students.fields.is_present", "Present"),
        flex: 1,
        minWidth: 120,
        renderCell: ({ value }) => renderPresenceChip(value),
      },
      {
        field: "updated_at",
        headerName: translate("students.fields.updated_at", "Last Updated"),
        flex: 2,
        renderCell: ({ value }) => renderDate(value),
      },
    ],
    [translate]
  );

  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Grid container spacing={2}>
          {([
            ["Schedule ID", schedule?.schedule_id],
            ["Schedule Name", schedule?.name_schedule],
            ["Status", renderStatusChip(schedule?.status)],
            [
              "Start Time",
              schedule?.start_time ? (
                <Typography>{renderDate(schedule.start_time)}</Typography>
              ) : (
                <Skeleton height="20px" width="100px" />
              ),
            ],
            [
              "End Time",
              schedule?.end_time ? (
                <Typography>{renderDate(schedule.end_time)}</Typography>
              ) : (
                <Skeleton height="20px" width="100px" />
              ),
            ],
            ["Room Name", schedule?.room?.room_name],
            ["Capacity", schedule?.room?.capacity],
          ] as [string, React.ReactNode][]).map(([label, value]) => (
            <React.Fragment key={label}>
              <Grid item xs={4} sm={3}>
                <Typography fontWeight="bold">{label}</Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                {value !== undefined ? (
                  typeof value === "string" || typeof value === "number" ? (
                    <Typography>{value}</Typography>
                  ) : (
                    value
                  )
                ) : (
                  <Skeleton height="20px" width="200px" />
                )}
              </Grid>
            </React.Fragment>
          ))}
        </Grid>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            Student List
          </Typography>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </Stack>

        {schedule?.students?.length ? (
          <DataGrid
            rows={schedule.students
              .filter((s) => s.student_id != null)
              .map((s) => ({ ...s, id: s.student_id }))}
            columns={studentColumns}
            pageSizeOptions={[20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            disableRowSelectionOnClick
          />
        ) : (
          <Typography>No students found for this schedule.</Typography>
        )}
      </Stack>
    </Show>
  );
};


