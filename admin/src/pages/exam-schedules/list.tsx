import { useMemo } from "react";
import "dayjs/locale/vi";
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
      headerName: translate("schedules.fields.id"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "name_schedule",
      headerName: translate("schedules.fields.name_schedule"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "room",
      headerName: translate("rooms.fields.room_name"),
      flex: 1,
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
      flex: 2,
      minWidth: 180,
      renderCell: ({ value }) =>
        dayjs(value).locale(locale ?? "en").format("dddd, DD/MM/YYYY HH:mm"),
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

        return `${durationMinutes} ${translate("schedules.fields.minutes", "minutes")}`;
      },
    },
    {
      field: "status",
      headerName: translate("schedules.fields.status"),
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
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
            <DeleteButton hideText recordItemId={row.schedule_id} />
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
