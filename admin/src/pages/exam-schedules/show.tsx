import React, { useMemo } from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  DateField,
  Show,
} from "@refinedev/mui";

import {
  Chip,
} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
} from "@mui/x-data-grid";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
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
    query: { data, isLoading },
  } = useShow<ExamSchedule>();

  const schedule = data?.data;

  // Các cột DataGrid cho danh sách sinh viên
  const studentColumns: GridColDef[] = useMemo(() => [
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
      renderCell: ({ value }) => {
        const isYes = Boolean(value);
        const label = isYes
          ? translate("students.status.present", "Present")
          : translate("students.status.absent", "Absent");

        const color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = isYes ? "success" : "error";

        return <Chip label={label} color={color} size="small" variant="outlined" />;
      },
    },
    {
      field: "updated_at",
      headerName: translate("students.fields.updated_at", "Last Updated"),
      flex: 2,
      renderCell: ({ value }) => {
        if (!value) return "-";
        const formatted = format(new Date(value), "dd/MM/yyyy HH:mm"); 
        return formatted;
      },
    }
  ], [translate]);

  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Typography variant="h5" fontWeight="bold">
          {translate("exams.title", "Exam Schedule Details")}
        </Typography>

        <Divider />

        <Stack gap={1}>
          <Typography fontWeight="bold">Schedule ID</Typography>
          {schedule ? (
            <Typography>{schedule.schedule_id}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Schedule Name</Typography>
          {schedule ? (
            <Typography>{schedule.name_schedule}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Status</Typography>
          {schedule ? (
            <Typography>{schedule.status}</Typography>
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">Start Time</Typography>
          {schedule ? (
            <DateField value={schedule.start_time} />
          ) : (
            <Skeleton height="20px" width="200px" />
          )}

          <Typography fontWeight="bold">End Time</Typography>
          {schedule ? (
            <DateField value={schedule.end_time} />
          ) : (
            <Skeleton height="20px" width="200px" />
          )}
        </Stack>

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Room Information
        </Typography>
        {schedule?.room ? (
          <Stack gap={1}>
            <Typography>
              Room Name: <strong>{schedule.room.room_name}</strong>
            </Typography>
            <Typography>
              Capacity: <strong>{schedule.room.capacity}</strong>
            </Typography>
          </Stack>
        ) : (
          <Skeleton height="50px" width="100%" />
        )}

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Student List
        </Typography>

        {schedule?.students?.length ? (
          <DataGrid
            rows={schedule.students.map((student) => ({
              ...student,
              id: student.student_id,
            }))}
            columns={studentColumns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            disableRowSelectionOnClick
          />
        ) : (
          <Typography>No students found for this schedule.</Typography>
        )}
      </Stack>
    </Show>
  );
};

