// import { useMemo } from "react";
// import "dayjs/locale/vi";
// import {
//   useGetLocale,
//   useTranslate,
//   useMany,
// } from "@refinedev/core";
// import {
//   DataGrid,
//   type GridColDef,
// } from "@mui/x-data-grid";
// import {
//   DeleteButton,
//   EditButton,
//   List,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";
// import dayjs from "dayjs";
// import {
//   Chip,
//   Box,
//   Paper,
//   useTheme,
// } from "@mui/material";
// import { Tag } from 'antd';

// import {
//   CalendarOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   HourglassOutlined
// } from "@ant-design/icons";

// import ReplayIcon from "@mui/icons-material/Replay";
// import { Button } from "@mui/material";

// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";
// import "dayjs/locale/vi";

// dayjs.extend(utc);
// dayjs.extend(timezone);

// import { useList } from "@refinedev/core";



// type ExamSchedule = {
//   schedule_id: number;
//   start_time: string;
//   end_time: string;
//   room: { room_id: number; room_name: string } | null;
//   created_by?: string | null;
//   status: string;
//   name_schedule: string;
// };

// export const ExamScheduleList = () => {
//   const { dataGridProps } = useDataGrid<ExamSchedule>();
//   const { data: listData, refetch } = useList<ExamSchedule>({
//     resource: "exam-schedules",
//   });

//   const locale = useGetLocale()();
//   const translate = useTranslate();
//   const theme = useTheme();

//   const roomIds = [
//     ...new Set(
//       dataGridProps?.rows
//         ?.map((item) => item?.room?.room_id)
//         .filter((id): id is number => typeof id === "number")
//     ),
//   ];

//   const {
//     data: roomData,
//     isLoading: roomLoading,
//   } = useMany({
//     resource: "exam-rooms",
//     ids: roomIds,
//     queryOptions: { enabled: roomIds.length > 0 },
//   });

//   const roomMap = useMemo(() => {
//     const map: Record<number, string> = {};
//     roomData?.data?.forEach((room) => {
//       map[room.room_id] = room.room_name;
//     });
//     return map;
//   }, [roomData?.data]);

//   const columns = useMemo<GridColDef[]>(() => [
//     {
//       field: "schedule_id",
//       headerName: translate("schedules.fields.id"),
//       flex: 1,
//       minWidth: 100,
//     },
//     {
//       field: "name_schedule",
//       headerName: translate("schedules.fields.name_schedule"),
//       flex: 1.5,
//       minWidth: 180,
//     },
//     {
//       field: "duration",
//       headerName: translate("schedules.fields.duration"),
//       flex: 1,
//       minWidth: 120,
//       renderCell: ({ row }) => {
//         const start = dayjs(row.start_time);
//         const end = dayjs(row.end_time);
//         const durationMinutes = end.diff(start, "minute");

//         return `${durationMinutes} ${translate("schedules.fields.minutes", "minutes")}`;
//       },
//     },
//     {
//       field: "room",
//       headerName: translate("rooms.fields.room_name"),
//       flex: 1.2,
//       minWidth: 140,
//       renderCell: ({ row }) => {
//         const roomId = row.room?.room_id;
//         const roomName = roomMap[roomId];
//         return roomId && roomName
//           ? roomName
//           : translate("form.unknown", "Unknown");
//       },
//     },
//     {
//       field: "start_time",
//       headerName: translate("schedules.fields.start_time"),
//       flex: 1.5,
//       minWidth: 180,
//       renderCell: ({ value }) =>
//         dayjs.utc(value).tz("Asia/Ho_Chi_Minh").locale(locale ?? "en").format("dddd, DD/MM/YYYY HH:mm"),
//     },
//     {
//       field: "status",
//       headerName: translate("schedules.fields.status"),
//       flex: 1,
//       minWidth: 120,
//       renderCell: ({ value }) => {
//         let color: "blue" | "green" | "red" | "orange" | "default" = "default";
//         let label = value;
//         let icon = null;

//         switch (value) {
//           case "scheduled":
//             color = "blue";
//             label = translate("schedules.status.scheduled", "Đã lên lịch");
//             icon = <CalendarOutlined />;
//             break;
//           case "completed":
//             color = "green";
//             label = translate("schedules.status.completed", "Đã hoàn thành");
//             icon = <CheckCircleOutlined />;
//             break;
//           case "cancelled":
//             color = "red";
//             label = translate("schedules.status.cancelled", "Đã hủy");
//             icon = <CloseCircleOutlined />;
//             break;
//           case "in_progress":
//             color = "orange";
//             label = translate("schedules.status.in_progress", "Đang diễn ra");
//             icon = <HourglassOutlined />;
//             break;
//           default:
//             label = value;
//         }

//         return (
//           <Tag color={color} icon={icon}>
//             {label}
//           </Tag>
//         );
//       },
//     },

//     {
//       field: "actions",
//       headerName: translate("table.actions"),
//       sortable: false,
//       disableColumnMenu: true,
//       flex: 1,
//       minWidth: 120,
//       align: "center",
//       headerAlign: "center",
//       renderCell: ({ row }) => (
//         <Box display="flex" justifyContent="center" gap={1}>
//           <ShowButton hideText size="small" recordItemId={row.schedule_id} />
//           <EditButton hideText size="small" recordItemId={row.schedule_id} />
//           <DeleteButton hideText size="small" recordItemId={row.schedule_id} />
//         </Box>
//       ),
//     },
//   ], [locale, translate, roomMap]);

//   return (
//     <List headerButtons={({ defaultButtons }) => (
//       <Box display="flex" gap={1}>
//         {defaultButtons}
//         <Button
//           onClick={() => refetch?.()}
//           variant="contained"
//           color="primary"
//           startIcon={<ReplayIcon />}
//         >
//           Tải lại dữ liệu
//         </Button>
//       </Box>
//     )}>
//       <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
//         <DataGrid
//           {...dataGridProps}
//           getRowId={(row) => row.schedule_id}
//           columns={columns}
//           autoHeight
//           rowHeight={52}
//           sx={{
//             "& .MuiDataGrid-columnHeaders": {
//               backgroundColor: theme.palette.grey[100],
//               fontWeight: 600,
//               fontSize: "0.9rem",
//             },
//             "& .MuiDataGrid-cell": {
//               fontSize: "0.875rem",
//             },
//             border: "none",
//           }}
//         />
//       </Paper>
//     </List>
//   );
// };


import { useMemo } from "react";
import "dayjs/locale/vi";
import {
  useGetLocale,
  useTranslate,
  useMany,
} from "@refinedev/core";
import {
  DataGrid,
  type GridColDef,
} from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import dayjs from "dayjs";
import {
  Chip,
  Box,
  Paper,
  useTheme,
  Button,
} from "@mui/material";
import { Tag } from "antd";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
} from "@ant-design/icons";

import ReplayIcon from "@mui/icons-material/Replay";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi";
import { useNotification } from "@refinedev/core";

dayjs.extend(utc);
dayjs.extend(timezone);

type ExamSchedule = {
  schedule_id: number;
  start_time: string;
  end_time: string;
  room: { room_id: number; room_name: string } | null;
  created_by?: string | null;
  status: string;
  name_schedule: string;
};

export const ExamScheduleList = () => {
  const {
    dataGridProps,
    tableQueryResult: { refetch },
  } = useDataGrid<ExamSchedule>();

  const locale = useGetLocale()();
  const translate = useTranslate();
  const theme = useTheme();
  const { open } = useNotification();


  const roomIds = [
    ...new Set(
      dataGridProps?.rows
        ?.map((item) => item?.room?.room_id)
        .filter((id): id is number => typeof id === "number")
    ),
  ];

  const {
    data: roomData,
    isLoading: roomLoading,
  } = useMany({
    resource: "exam-rooms",
    ids: roomIds,
    queryOptions: { enabled: roomIds.length > 0 },
  });

  const roomMap = useMemo(() => {
    const map: Record<number, string> = {};
    roomData?.data?.forEach((room) => {
      map[room.room_id] = room.room_name;
    });
    return map;
  }, [roomData?.data]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "schedule_id",
        headerName: translate("schedules.fields.id"),
        flex: 1,
        minWidth: 100,
      },
      {
        field: "name_schedule",
        headerName: translate("schedules.fields.name_schedule"),
        flex: 1.5,
        minWidth: 180,
      },
      {
        field: "duration",
        headerName: translate("schedules.fields.duration"),
        flex: 1,
        minWidth: 120,
        renderCell: ({ row }) => {
          const start = dayjs(row.start_time);
          const end = dayjs(row.end_time);
          const durationMinutes = end.diff(start, "minute");

          return `${durationMinutes} ${translate(
            "schedules.fields.minutes",
            "minutes"
          )}`;
        },
      },
      {
        field: "room",
        headerName: translate("rooms.fields.room_name"),
        flex: 1.2,
        minWidth: 140,
        renderCell: ({ row }) => {
          const roomId = row.room?.room_id;
          const roomName = roomMap[roomId];
          return roomId && roomName
            ? roomName
            : translate("form.unknown", "Unknown");
        },
      },
      {
        field: "start_time",
        headerName: translate("schedules.fields.start_time"),
        flex: 1.5,
        minWidth: 180,
        renderCell: ({ value }) =>
          dayjs
            .utc(value)
            .tz("Asia/Ho_Chi_Minh")
            .locale(locale ?? "en")
            .format("dddd, DD/MM/YYYY HH:mm"),
      },
      {
        field: "status",
        headerName: translate("schedules.fields.status"),
        flex: 1,
        minWidth: 120,
        renderCell: ({ value }) => {
          let color: "blue" | "green" | "red" | "orange" | "default" = "default";
          let label = value;
          let icon = null;

          switch (value) {
            case "scheduled":
              color = "blue";
              label = translate("schedules.status.scheduled", "Đã lên lịch");
              icon = <CalendarOutlined />;
              break;
            case "completed":
              color = "green";
              label = translate("schedules.status.completed", "Đã hoàn thành");
              icon = <CheckCircleOutlined />;
              break;
            case "cancelled":
              color = "red";
              label = translate("schedules.status.cancelled", "Đã hủy");
              icon = <CloseCircleOutlined />;
              break;
            case "in_progress":
              color = "orange";
              label = translate("schedules.status.in_progress", "Đang diễn ra");
              icon = <HourglassOutlined />;
              break;
            default:
              label = value;
          }

          return (
            <Tag color={color} icon={icon}>
              {label}
            </Tag>
          );
        },
      },
      {
        field: "actions",
        headerName: translate("table.actions"),
        sortable: false,
        disableColumnMenu: true,
        flex: 1,
        minWidth: 120,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => (
          <Box display="flex" justifyContent="center" gap={1}>
            <ShowButton hideText size="small" recordItemId={row.schedule_id} />
            <EditButton hideText size="small" recordItemId={row.schedule_id} />
            <DeleteButton
              hideText
              size="small"
              successNotification={false}
              recordItemId={row.schedule_id}
              onSuccess={(response) => {
                open?.({
                  type: "success",
                  message: response?.data?.message || "Xóa thành công",
                });
              }}
            />
          </Box>
        ),
      },
    ],
    [locale, translate, roomMap]
  );

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <Box display="flex" gap={1} flexWrap="wrap">
          {defaultButtons}
          <Button
            onClick={() => refetch?.()}
            variant="contained"
            color="primary"
            startIcon={<ReplayIcon />}
          >
            Tải lại dữ liệu
          </Button>
        </Box>
      )}
    >
      <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
        <DataGrid
          {...dataGridProps}
          getRowId={(row) => row.schedule_id}
          columns={columns}
          autoHeight
          rowHeight={52}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.grey[100],
              fontWeight: 600,
              fontSize: "0.9rem",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem",
            },
            border: "none",
          }}
        />
      </Paper>
    </List>
  );
};
