// import React from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
// } from "@mui/material";
// import { useForm } from "@refinedev/react-hook-form";
// import { Create } from "@refinedev/mui";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useNotification } from "@refinedev/core";

// type AssignPayload = {
//   username: string;
//   examScheduleId: number;
// };

// export const AddStudentToExamSchedule: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { open } = useNotification();

//   const examScheduleIdFromState = location.state?.examScheduleId || 0;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<AssignPayload>({
//     defaultValues: {
//       examScheduleId: examScheduleIdFromState,
//     },
//   });

//   const onSubmit = async (data: AssignPayload) => {
//     try {
//       const response = await fetch("http://localhost:5000/api/v1/exam-attendance/assign", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           student_id: data.username,
//           schedule_id: data.examScheduleId,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to assign student.");
//       }

//       open?.({
//         type: "success",
//         message: "Thành công",
//         description: "Sinh viên đã được thêm vào ca thi",
//       });

//       navigate("/schedules");
//     } catch (error: any) {
//       open?.({
//         type: "error",
//         message: "Thất bại",
//         description: error.message,
//       });
//     }
//   };

//   return (
//     <Create title="Assign Student to Exam">
//       <Box
//         component="form"
//         onSubmit={handleSubmit(onSubmit)}
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           gap: 2,
//           maxWidth: 400,
//           mt: 2,
//         }}
//         autoComplete="off"
//       >
//         <Typography variant="h6">Assign Student to Exam Schedule</Typography>

//         <TextField
//           {...register("username", { required: "Student ID is required" })}
//           label="Student ID"
//           error={!!errors.username}
//           helperText={errors.username?.message}
//           fullWidth
//         />

//         <input
//           type="hidden"
//           {...register("examScheduleId", {
//             required: true,
//             valueAsNumber: true,
//           })}
//         />

//         <Button type="submit" variant="contained" color="primary">
//           Assign
//         </Button>
//       </Box>
//     </Create>
//   );
// };

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { Create } from "@refinedev/mui";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "@refinedev/core";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
};

type AssignPayload = {
  student: Student | null;
  examScheduleId: number;
};

export const AddStudentToExamSchedule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useNotification();

  const examScheduleIdFromState = location.state?.examScheduleId || 0;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignPayload>({
    defaultValues: {
      student: null,
      examScheduleId: examScheduleIdFromState,
    },
  });

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Gọi API để lấy danh sách sinh viên
    fetch("http://localhost:5000/api/v1/users/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((error) => console.error("Failed to fetch students:", error));
  }, []);

  const onSubmit = async (data: AssignPayload) => {
    if (!data.student?.id) {
      open?.({
        type: "error",
        message: "Thiếu thông tin",
        description: "Vui lòng chọn sinh viên hợp lệ.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/v1/exam-attendance/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: data.student.id,
          schedule_id: data.examScheduleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Assign failed");
      }

      open?.({
        type: "success",
        message: "Thành công",
        description: "Sinh viên đã được thêm vào ca thi",
      });

      navigate("/schedules");
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Thất bại",
        description: error.message,
      });
    }
  };

  return (
    <Create title="Assign Student to Exam">
      <Box
        component="form"
        // onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500, mt: 2 }}
        autoComplete="off"
      >
        <Typography variant="h6">Assign Student to Exam Schedule</Typography>

        <Controller
          name="student"
          control={control}
          rules={{ required: "Please select a student" }}
          render={({ field }) => (
            <Autocomplete<Student>
              {...field}
              options={students}
              getOptionLabel={(option) =>
                `${option.id} - ${option.first_name} ${option.last_name}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Student"
                  error={!!errors.student}
                  // helperText={errors.student?.message}
                />
              )}
            />
          )}
        />

        {/* Hidden input for schedule ID */}
        <input
          type="hidden"
          {...register("examScheduleId", {
            required: true,
            valueAsNumber: true,
          })}
        />

        <Button type="submit" variant="contained" color="primary">
          Assign
        </Button>
      </Box>
    </Create>
  );
};
