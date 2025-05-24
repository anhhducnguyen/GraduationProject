import { useShow, useTranslate } from "@refinedev/core";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

import {
  DateField,
  TextFieldComponent as TextField,
  Show,
} from "@refinedev/mui";

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

  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Typography variant="h5" fontWeight="bold">
          {translate("exams.title", "Exam Schedule Details")}
        </Typography>

        <Divider />

        <Stack gap={1}>
          <Typography fontWeight="bold">Schedule ID</Typography>
          {schedule ? <TextField value={schedule.schedule_id} /> : <Skeleton height="20px" width="200px" />}

          <Typography fontWeight="bold">Schedule Name</Typography>
          {schedule ? <TextField value={schedule.name_schedule} /> : <Skeleton height="20px" width="200px" />}

          <Typography fontWeight="bold">Status</Typography>
          {schedule ? <TextField value={schedule.status} /> : <Skeleton height="20px" width="200px" />}

          <Typography fontWeight="bold">Start Time</Typography>
          {schedule ? <DateField value={schedule.start_time} /> : <Skeleton height="20px" width="200px" />}

          <Typography fontWeight="bold">End Time</Typography>
          {schedule ? <DateField value={schedule.end_time} /> : <Skeleton height="20px" width="200px" />}
        </Stack>

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Room Information
        </Typography>
        {schedule?.room ? (
          <Stack gap={1}>
            <Typography>Room Name: <strong>{schedule.room.room_name}</strong></Typography>
            <Typography>Capacity: <strong>{schedule.room.capacity}</strong></Typography>
          </Stack>
        ) : (
          <Skeleton height="50px" width="100%" />
        )}

        <Divider />

        <Typography variant="h6" fontWeight="bold">
          Student List
        </Typography>
        {schedule?.students?.length ? (
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell>{student.is_present ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <DateField value={student.updated_at} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Typography>No students found for this schedule.</Typography>
        )}
      </Stack>
    </Show>
  );
};
