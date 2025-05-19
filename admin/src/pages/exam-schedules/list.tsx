import { useMemo } from "react";
import {
  useGetLocale,
  useTranslate,
  useMany,
} from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import dayjs from "dayjs";
import { Chip } from "@mui/material";

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
  const { dataGridProps } = useDataGrid<ExamSchedule>();
  const locale = useGetLocale()();
  const translate = useTranslate();

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

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: "schedule_id",
      headerName: translate("schedules.fields.id", "ID"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "name_schedule",
      headerName: translate("schedules.fields.name_schedule", "Schedule Name"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "room",
      headerName: "Phòng học",
      flex: 1,
      renderCell: ({ row }) => {
        const roomId = row.room?.room_id;
        const roomName = roomMap[roomId];
        return roomId && roomName ? roomName : "Không xác định";
      },
    },
    {
      field: "start_time",
      headerName: translate("schedules.fields.start_time", "Start Time"),
      flex: 1,
      minWidth: 180,
      renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      field: "end_time",
      headerName: translate("schedules.fields.end_time", "End Time"),
      flex: 1,
      minWidth: 180,
      renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      field: "status",
      headerName: translate("schedules.fields.status", "Status"),
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
        let label = value;
        switch (value) {
          case "scheduled":
            color = "info";
            label = "Scheduled";
            break;
          case "completed":
            color = "success";
            label = "Completed";
            break;
          case "cancelled":
            color = "error";
            label = "Cancelled";
            break;
        }
        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: translate("table.actions"),
      sortable: false,
      display: "flex",
      renderCell: function render({ row }) {
        return (
          <>
            <ShowButton hideText recordItemId={row.id} />
            <EditButton hideText recordItemId={row.id} />
            <DeleteButton hideText recordItemId={row.id} />
          </>
        );
      },
      align: "center",
      headerAlign: "center",
      minWidth: 80,
    },
  ], [locale, translate, roomMap]);

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        getRowId={(row) => row.schedule_id}
        columns={columns}
      />
    </List>
  );
};


// import { useMemo } from "react";
// import {
//   useGetLocale,
//   useList,
//   useTranslate,
// } from "@refinedev/core";
// import { DataGrid, type GridColDef } from "@mui/x-data-grid";
// import {
//   DeleteButton,
//   EditButton,
//   List,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";
// import dayjs from "dayjs";
// import { Chip } from "@mui/material";
// import { log } from "console";


// // Define the ExamSchedule type
// type ExamSchedule = {
//   schedule_id: number;
//   start_time: string;
//   end_time: string;
//   // room_id: number;
//   room: { room_id: string; room_name: string };
//   created_by?: string | null;
//   status: string;
//   name_schedule: string;
// };

// export const ExamScheduleList = () => {
//   const { dataGridProps } = useDataGrid<ExamSchedule>();

//   const locale = useGetLocale()();
//   const translate = useTranslate();

//   const { data: roomData, isLoading: roomLoading } = useList({
//       resource: "exam-rooms",
//       pagination: {
//         mode: "off",
//       },
//     });

//     console.log(roomData, "roomData");
//     console.log(roomLoading, "roomLoading");

//   const columns = useMemo<GridColDef[]>(() => [
//     {
//       field: "schedule_id",
//       headerName: translate("schedules.fields.id", "ID"),
//       flex: 1,
//       minWidth: 100,
//     },
//     {
//       field: "name_schedule",
//       headerName: translate("schedules.fields.name_schedule", "Schedule Name"),
//       flex: 1,
//       minWidth: 200,
//     },
//     {
//         field: "room",
//         flex: 1,
//         headerName: translate("schedules.fields.room"),
//         minWidth: 200,
//         valueGetter: ({ row }: { row: ExamSchedule }) => {
//           const value = row?.room?.room_id;
//           return value;
//         },
//         display: "flex",
//         renderCell: function render({ value }) {
//           return roomLoading ? (
//             <>{translate("loading")}</>
//           ) : (
//             // roomData?.data?.find((item) => item.id === value)?.title ?? null
//             roomData?.data?.find((item) => item.room_id === value)?.room_name ?? "Unknown"
//           );
//         },
//       },
//     // {
//     //   field: "room_id",
//     //   headerName: translate("schedules.fields.room_id", "Room ID"),
//     //   flex: 1,
//     //   minWidth: 100,
//     // },
//     {
//       field: "start_time",
//       headerName: translate("schedules.fields.start_time", "Start Time"),
//       flex: 1,
//       minWidth: 180,
//       renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
//     },
//     {
//       field: "end_time",
//       headerName: translate("schedules.fields.end_time", "End Time"),
//       flex: 1,
//       minWidth: 180,
//       renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
//     },
//     // {
//     //   field: "status",
//     //   headerName: translate("schedules.fields.status", "Status"),
//     //   flex: 1,
//     //   minWidth: 120,
//     // },
//     {
//       field: "status",
//       headerName: translate("schedules.fields.status", "Status"),
//       flex: 1,
//       minWidth: 120,
//       renderCell: ({ value }) => {
//         let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
//         let label = value;

//         switch (value) {
//           case "scheduled":
//             color = "info";
//             label = "Scheduled";
//             break;
//           case "completed":
//             color = "success";
//             label = "Completed";
//             break;
//           case "cancelled":
//             color = "error";
//             label = "Cancelled";
//             break;
//           default:
//             color = "default";
//             label = value;
//             break;
//         }

//         return <Chip label={label} color={color} size="small" />;
//       },
//     },
//     {
//       field: "actions",
//       headerName: translate("table.actions"),
//       sortable: false,
//       display: "flex",
//       renderCell: function render({ row }) {
//         return (
//           <>
//             <ShowButton hideText recordItemId={row.id} />
//             <EditButton hideText recordItemId={row.id} />
//             <DeleteButton hideText recordItemId={row.id} />
//           </>
//         );
//       },
//       align: "center",
//       headerAlign: "center",
//       minWidth: 80,
//     },
//   ], [locale, translate]);

//   return (
//     <List>
//       <DataGrid
//         {...dataGridProps}
//         getRowId={(row) => row.schedule_id}
//         columns={columns}
//       />
//     </List>
//   );
// };

// import { useMemo } from "react";
// import {
//   useGetLocale,
//   useTranslate,
//   useMany,
// } from "@refinedev/core";
// import { DataGrid, type GridColDef } from "@mui/x-data-grid";
// import {
//   DeleteButton,
//   EditButton,
//   List,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";
// import dayjs from "dayjs";
// import { Chip } from "@mui/material";

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

//   const locale = useGetLocale()();
//   const translate = useTranslate();

//   // 🐞 Debug log - dữ liệu gốc từ API
//   console.log("Raw rows from dataGridProps:", dataGridProps?.rows);

//   // 🔍 Lấy roomIds và loại bỏ null/undefined/trùng lặp
//   const roomIds = [
//     ...new Set(
//       dataGridProps?.rows
//         ?.map((item) => item?.room?.room_id)
//         .filter((id): id is number => typeof id === "number")
//     ),
//   ];

//   // 🐞 Debug log
//   console.log("roomIds for useMany:", roomIds);

//   const {
//     data: roomData,
//     isLoading: roomLoading,
//   } = useMany({
//     resource: "exam-rooms",
//     ids: roomIds,
//     queryOptions: {
//       enabled: roomIds.length > 0,
//     },
//   });

//   const roomMap = useMemo(() => {
//   const map: Record<number, string> = {};
//   roomData?.data?.forEach((room) => {
//     map[room.room_id] = room.room_name;
//   });
//   return map;
// }, [roomData?.data]);


//   // 🐞 Debug log
//   console.log("roomData:", roomData);
//   console.log("roomLoading:", roomLoading);

//   const columns = useMemo<GridColDef[]>(
//     () => [
//       {
//         field: "schedule_id",
//         headerName: translate("schedules.fields.id", "ID"),
//         flex: 1,
//         minWidth: 100,
//       },
//       {
//         field: "name_schedule",
//         headerName: translate("schedules.fields.name_schedule", "Schedule Name"),
//         flex: 1,
//         minWidth: 200,
//       },
//       // {
//       //   field: "room",
//       //   flex: 1,
//       //   headerName: translate("schedules.fields.room", "Room"),
//       //   minWidth: 200,
//       //   valueGetter: ({ row }: { row: ExamSchedule }) => row?.room?.room_id,
//       //   renderCell: ({ value }) => {
//       //     if (roomLoading) return translate("loading");

//       //     const roomId = Number(value); // 🔄 Ép kiểu cẩn thận
//       //     const room = roomData?.data?.find(
//       //       (r) => Number(r.room_id) === roomId
//       //     );

//       //     // 🐞 Log từng cell nếu lỗi
//       //     if (!room) {
//       //       console.warn(`Không tìm thấy phòng với ID: ${roomId}`);
//       //     }

//       //     return room ? room.room_name : "Unknown";
//       //   },
//       // },
//       {
//   field: 'room',
//   headerName: 'Phòng học',
//   flex: 1,
//   renderCell: ({ row }) => {
//     const roomId = row.room?.room_id;
//     const roomName = roomMap[roomId];

//     if (!roomId || !roomName) {
//       console.warn('Không tìm thấy phòng với ID:', roomId);
//       return 'Không xác định';
//     }

//     return roomName;
//   },
// },

//       {
//         field: "start_time",
//         headerName: translate("schedules.fields.start_time", "Start Time"),
//         flex: 1,
//         minWidth: 180,
//         renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
//       },
//       {
//         field: "end_time",
//         headerName: translate("schedules.fields.end_time", "End Time"),
//         flex: 1,
//         minWidth: 180,
//         renderCell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm"),
//       },
//       {
//         field: "status",
//         headerName: translate("schedules.fields.status", "Status"),
//         flex: 1,
//         minWidth: 120,
//         renderCell: ({ value }) => {
//           let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
//           let label = value;

//           switch (value) {
//             case "scheduled":
//               color = "info";
//               label = "Scheduled";
//               break;
//             case "completed":
//               color = "success";
//               label = "Completed";
//               break;
//             case "cancelled":
//               color = "error";
//               label = "Cancelled";
//               break;
//           }

//           return <Chip label={label} color={color} size="small" />;
//         },
//       },
//       {
//         field: "actions",
//         headerName: translate("table.actions"),
//         sortable: false,
//         renderCell: ({ row }) => (
//           <>
//             <ShowButton hideText recordItemId={row.schedule_id} />
//             <EditButton hideText recordItemId={row.schedule_id} />
//             <DeleteButton hideText recordItemId={row.schedule_id} />
//           </>
//         ),
//         align: "center",
//         headerAlign: "center",
//         minWidth: 80,
//       },
//     ],
//     [locale, translate, roomData?.data, roomLoading]
//   );

//   return (
//     <List>
//       <DataGrid
//         {...dataGridProps}
//         getRowId={(row) => row.schedule_id}
//         columns={columns}
//       />
//     </List>
//   );
// };
