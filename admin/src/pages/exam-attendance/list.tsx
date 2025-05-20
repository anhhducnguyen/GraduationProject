import { useMany } from "@refinedev/core";
import React from "react";

import { List, useDataGrid, DateField } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Avatar, Typography } from "@mui/material";


export const ExamAttendanceList = () => {
  const { dataGridProps } = useDataGrid();

  const { data: students, isLoading } = useMany({
    resource: "users",
    ids:
      dataGridProps?.rows?.map((item) => item?.student?.id).filter(Boolean) ??
      [],
    queryOptions: {
      enabled: !!dataGridProps?.rows,
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      // { field: "id", headerName: "ID", type: "number" },
      {
        field: "avatar",
        flex: 0.5,
        headerName: "Avatar",
        renderCell: ({ row }) => {
          if (isLoading) return "Loading...";
          const student = students?.data?.find((item) => item.id === row?.user?.id);
          return (
            <Avatar
              alt={`${student?.first_name ?? ""} ${student?.last_name ?? ""}`}
              src={student?.avatar}
              sx={{ width: 45, height: 45, mt: 0.4, }}
            />
          );
        },
      },

      {
        field: "student_id",
        flex: 0.7,
        headerName: "MSSV",
        renderCell: ({ row }) =>
          isLoading
            ? "Loading..."
            : students?.data?.find((item) => item.id === row?.user?.id)?.id,
      },
      {
        field: "last_name",
        flex: 1,
        headerName: "Last Name",
        renderCell: ({ row }) =>
          isLoading
            ? "Loading..."
            : students?.data?.find((item) => item.id === row?.user?.id)?.last_name,
      },
      {
        field: "user",
        flex: 1,
        headerName: "First Name",
        display: "flex",
        renderCell: ({ value }) =>
          isLoading
            ? "Loading..."
            : students?.data?.find((item) => item.id === value?.id)?.first_name,
      },
      {
        field: "isPresent",
        flex: 1,
        headerName: "Status",
        display: "flex",
        renderCell: ({ value }) =>
          isLoading
            ? "Loading..."
            : students?.data?.find((item) => item.id === value?.id)?.isPresent,
      },
      {
        field: "createdAt",
        flex: 1,
        headerName: "Created at",
        display: "flex",
        renderCell: ({ value }) => <DateField value={value} />,
      },
      {
        field: "updatedAt",
        flex: 1,
        headerName: "Update at",
        display: "flex",
        renderCell: ({ value }) => <DateField value={value} />,
      },
    ],
    [students?.data, isLoading],
  );

  return (
    <List>
      <DataGrid {...dataGridProps}
        columns={columns} />
    </List>
  );
};