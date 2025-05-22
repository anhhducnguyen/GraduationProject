import { useMemo } from "react";
import {
  useGetLocale,
  useList,
  useTranslate,
} from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  NumberField,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";

// Define the product type with the category field
type ExamRoom = {
  room_id: string;
  room_name: string;
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
        headerName: translate("rooms.fields.id"),
        minWidth: 300,
      },
      {
        field: "room_name",
        flex: 1,
        headerName: translate("rooms.fields.room_name"),
        minWidth: 300,
      },
      {
        field: "capacity",
        flex: 1,
        headerName: translate("rooms.fields.capacity"),
        minWidth: 100,
        renderCell: ({ value }) => <NumberField value={value} />,
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
    [
      locale, translate]
  );

  return (
    <List>
      <DataGrid {...dataGridProps} getRowId={(row) => row.room_id} columns={columns} />
    </List>
  );
};


// import { useMemo } from "react";
// import {
//   useGetLocale,
//   useTranslate,
// } from "@refinedev/core";
// import {
//   DataGrid,
//   type GridColDef,
// } from "@mui/x-data-grid";
// import {
//   DeleteButton,
//   EditButton,
//   List,
//   NumberField,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";

// // Định nghĩa kiểu dữ liệu đúng với dữ liệu trả về từ API
// type ExamRoom = {
//   room_id: number;
//   room_name: string;
//   capacity: number;
// };

// export const ExamRoomList = () => {
//   // Lấy dữ liệu từ API
//   const { dataGridProps } = useDataGrid<ExamRoom>({
//     // resource: "examrooms", // tên resource đúng với API endpoint
//   });

//   const locale = useGetLocale()();
//   const translate = useTranslate();

//   // Cấu hình cột
//   const columns = useMemo<GridColDef[]>(
//     () => [
//       {
//         field: "room_id",
//         flex: 1,
//         headerName: translate("rooms.fields.id", "ID"),
//         minWidth: 80,
//       },
//       {
//         field: "room_name",
//         flex: 1,
//         headerName: translate("rooms.fields.room_name", "Room Name"),
//         minWidth: 200,
//       },
//       {
//         field: "capacity",
//         flex: 1,
//         headerName: translate("rooms.fields.capacity", "Capacity"),
//         minWidth: 100,
//         renderCell: ({ value }) => <NumberField value={value} />,
//       },
//       {
//         field: "actions",
//         headerName: translate("table.actions", "Actions"),
//         sortable: false,
//         renderCell: ({ row }) => (
//           <>
//             <ShowButton hideText recordItemId={row.room_id} />
//             <EditButton hideText recordItemId={row.room_id} />
//             <DeleteButton hideText recordItemId={row.room_id} />
//           </>
//         ),
//         align: "center",
//         headerAlign: "center",
//         minWidth: 180,
//       },
//     ],
//     [locale, translate]
//   );

//   return (
//     <List>
//       <DataGrid {...dataGridProps} getRowId={(row) => row.room_id} columns={columns} autoHeight />
//     </List>
//   );
// };
