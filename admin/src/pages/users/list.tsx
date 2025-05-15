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
//   NumberField,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";

// // Define the product type with the category field
// type User = {
//   id: string;
//   first_name: string;
// };

// export const UserList = () => {
//   const { dataGridProps } = useDataGrid<User>(); // Use the Product type

//   const locale = useGetLocale()();
//   const translate = useTranslate();


//   const columns = useMemo<GridColDef[]>(
//     () => [
//       {
//         field: "id",
//         flex: 1,
//         headerName: translate("users.fields.id"),
//         minWidth: 300,
//       },
//       {
//         field: "first_name",
//         flex: 1,
//         headerName: translate("users.fields.firstName"),
//         minWidth: 300,
//       },
//       {
//         field: "actions",
//         headerName: translate("table.actions"),
//         sortable: false,
//         display: "flex",
//         renderCell: function render({ row }) {
//           return (
//             <>
//               <ShowButton hideText recordItemId={row.id} />
//               <EditButton hideText recordItemId={row.id} />
//               <DeleteButton hideText recordItemId={row.id} />
//             </>
//           );
//         },
//         align: "center",
//         headerAlign: "center",
//         minWidth: 80,
//       },
//     ],
//     [
//       // categoryLoading, 
//       // categoryData, 
//       locale, translate]
//   );

//   return (
//     <List>
//       <DataGrid {...dataGridProps} columns={columns} />
//     </List>
//   );
// };




import { useMemo } from "react";
import {
  useGetLocale,
  useTranslate,
} from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";

// Define the product type with the category field
type User = {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: "male" | "female" | "other";
};

export const UserList = () => {
  const { dataGridProps } = useDataGrid<User>();

  const locale = useGetLocale()();
  const translate = useTranslate();

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        flex: 1,
        headerName: translate("users.fields.id") || "ID",
        minWidth: 100,
      },
      {
        field: "last_name",
        flex: 1,
        headerName: translate("users.fields.last_name") || "Last Name",
        minWidth: 150,
      },
      {
        field: "first_name",
        flex: 1,
        headerName: translate("users.fields.first_name") || "First Name",
        minWidth: 150,
      },
      {
        field: "age",
        flex: 1,
        headerName: translate("users.fields.age") || "Age",
        minWidth: 100,
        type: "number",
      },
      {
        field: "gender",
        flex: 1,
        headerName: translate("users.fields.gender") || "Gender",
        minWidth: 120,
      },
      {
        field: "actions",
        type: "actions", // <-- thêm dòng này
        headerName: translate("table.actions") || "Actions",
        sortable: false,
        renderCell: ({ row }) => (
          <>
            <ShowButton hideText recordItemId={row.id} />
            <EditButton hideText recordItemId={row.id} />
            <DeleteButton hideText recordItemId={row.id} />
          </>
        ),
        align: "center",
        headerAlign: "center",
        minWidth: 150,
      }

    ],
    [locale, translate]
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} />
    </List>
  );
};
