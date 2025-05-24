import { useMemo } from "react";
import {
  useGetLocale,
  useTranslate,
} from "@refinedev/core";
import {
  DataGrid,
  type GridColDef,
} from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  NumberField,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import { Chip } from "@mui/material";

type ExamRoom = {
  room_id: string;       
  room_name: string;
  capacity: number;
  location: string;
  status: "schedule" | "ongoing" | "complete" | "cancelled"; 
};

export const ExamRoomList = () => {
  const { dataGridProps } = useDataGrid<ExamRoom>();

  const locale = useGetLocale()();
  const translate = useTranslate();

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "room_id",
        flex: 1,
        headerName: translate("rooms.fields.id", "Room ID"),
        minWidth: 100,
      },
      {
        field: "room_name",
        flex: 1,
        headerName: translate("rooms.fields.room_name", "Room Name"),
        minWidth: 150,
      },
      {
        field: "capacity",
        flex: 1,
        headerName: translate("rooms.fields.capacity", "Capacity"),
        minWidth: 100,
      },
      {
        field: "location",
        flex: 1,
        headerName: translate("rooms.fields.location", "Location"),
        minWidth: 150,
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
            case "schedule":
              color = "info";
              label = translate("schedules.status.scheduled", "Scheduled");
              break;
            case "complete":
              color = "success";
              label = translate("schedules.status.completed", "Completed");
              break;
            case "cancel":
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
              <ShowButton hideText recordItemId={row.room_id} />
              <EditButton hideText recordItemId={row.room_id} />
              <DeleteButton hideText recordItemId={row.room_id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 80,
      },
    ],
    [locale, translate],
  );

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        getRowId={(row) => row.room_id}
        columns={columns}
      />
    </List>
  );
};
