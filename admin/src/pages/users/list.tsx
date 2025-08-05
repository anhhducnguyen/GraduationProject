import { useMemo } from "react";
import { Chip } from "@mui/material";
import { Table, Tag, Button, Flex, Tooltip, Input, Space } from 'antd';
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
  email: string;
  role: string;
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
        field: "email",
        flex: 1,
        headerName: translate("users.fields.email") || "Email",
        minWidth: 120,
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
        field: "role",
        flex: 1,
        minWidth: 120,
        headerName: translate("users.fields.role") || "Role",
        renderCell: ({ value }) => {
          let color: "red" | "blue" | "green" | "default" = "default";
          let label = value;

          switch (value) {
            case "admin":
              color = "red";
              label = translate("users.roles.admin", "Admin");
              break;
            case "teacher":
              color = "blue";
              label = translate("users.roles.teacher", "Teacher");
              break;
            case "student":
              color = "green";
              label = translate("users.roles.student", "Student");
              break;
            default:
              label = value;
          }

          return <Tag color={color}>{label}</Tag>;
        },
      },

      {
        field: "actions",
        type: "actions",
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
