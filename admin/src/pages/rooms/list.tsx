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
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import type { ExamRoom } from "./types";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Tag } from 'antd';

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
        headerName: translate("rooms.fields.status", "Trạng thái"),
        flex: 1,
        minWidth: 20,
        renderCell: ({ value }) => {
          let color: "green" | "blue" | "red" | "default" = "default";
          let label = value;
          let icon = null;

          switch (value) {
            case "available":
              color = "green";
              label = translate("rooms.status.available", "Phòng trống");
              icon = <CheckCircleOutlined />;
              break;
            case "scheduled":
              color = "blue";
              label = translate("rooms.status.scheduled", "Đã đặt lịch");
              icon = <CalendarOutlined />;
              break;
            case "in_use":
              color = "red";
              label = translate("rooms.status.in_use", "Đang thi");
              icon = <ClockCircleOutlined />;
              break;
            default:
              label = value;
          }

          return <Tag color={color} icon={icon}>{label}</Tag>;
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
        minWidth: 180,
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
