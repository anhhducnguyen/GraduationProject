
// import {
//   type HttpError,
//   useTranslate,
// } from "@refinedev/core";
// import { useForm } from "@refinedev/react-hook-form";
// import {
//   Box,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormHelperText,
//   Typography,
// } from "@mui/material";
// import { Create } from "@refinedev/mui";
// import { useTheme } from "@mui/material/styles";
// import React, { useState } from "react";
// import { Controller } from "react-hook-form";


// type User = {
//   id?: string;
//   first_name: string;
//   last_name: string;
//   age: number;
//   gender: string;
//   avatar?: string;
//   email: string;
//   username: string;
//   password: string;
//   role: string;
//   examScheduleId?: number;
// };

// export const AddStudentToExamSchedule: React.FC = () => {
//   const translate = useTranslate();
//   const theme = useTheme();

//   const {
//     saveButtonProps,
//     refineCore: { formLoading },
//     register,
//     setValue,
//     control,
//     formState: { errors },
//   } = useForm<User, HttpError, User>({
//     defaultValues: {
//       role: "student",
//     },
//   });

//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const fileUrl = URL.createObjectURL(file);
//       setAvatarPreview(fileUrl);
//       setValue("avatar", file.name); 
//     }
//   };

//   return (
//     <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
//       <Box
//         component="form"
//         sx={{ display: "flex", flexDirection: "column" }}
//         autoComplete="off"
//       >
//         <TextField
//           {...register("first_name", { required: "Required" })}
//           error={!!errors?.first_name}
//           helperText={errors?.first_name?.message}
//           margin="normal"
//           fullWidth
//           label="First Name"
//         />

//         <TextField
//           {...register("last_name", { required: "Required" })}
//           error={!!errors?.last_name}
//           helperText={errors?.last_name?.message}
//           margin="normal"
//           fullWidth
//           label="Last Name"
//         />

//         <TextField
//           {...register("age", {
//             required: "Required",
//             valueAsNumber: true,
//             min: { value: 0, message: "Age must be >= 0" },
//           })}
//           error={!!errors?.age}
//           helperText={errors?.age?.message}
//           margin="normal"
//           fullWidth
//           type="number"
//           label="Age"
//         />

//         <FormControl fullWidth margin="normal" error={!!errors?.gender}>
//           <InputLabel id="gender-label">Gender</InputLabel>
//           <Select
//             labelId="gender-label"
//             defaultValue=""
//             {...register("gender", { required: "Required" })}
//             label="Gender"
//           >
//             <MenuItem value=""><em>Choose...</em></MenuItem>
//             <MenuItem value="male">Male</MenuItem>
//             <MenuItem value="female">Female</MenuItem>
//           </Select>
//           <FormHelperText>{errors?.gender?.message}</FormHelperText>
//         </FormControl>

//         {/* Auth fields */}
//         <TextField
//           {...register("email", { required: "Required" })}
//           error={!!errors?.email}
//           helperText={errors?.email?.message}
//           margin="normal"
//           fullWidth
//           label="Email"
//           type="email"
//         />

//         <TextField
//           {...register("username", { required: "Required" })}
//           error={!!errors?.username}
//           helperText={errors?.username?.message}
//           margin="normal"
//           fullWidth
//           label="Username"
//         />

//         <TextField
//           {...register("password", {
//             required: "Required",
//             minLength: {
//               value: 6,
//               message: "Password must be at least 6 characters",
//             },
//           })}
//           error={!!errors?.password}
//           helperText={errors?.password?.message}
//           margin="normal"
//           fullWidth
//           type="password"
//           label="Password"
//         />

//         <FormControl fullWidth margin="normal" error={!!errors?.role}>
//           <InputLabel id="role-label">Role</InputLabel>
//           <Controller
//             name="role"
//             control={control}
//             rules={{ required: "Required" }}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 labelId="role-label"
//                 label="Role"
//                 defaultValue="student"
//               >
//                 <MenuItem value=""><em>Choose...</em></MenuItem>
//                 <MenuItem value="student">Student</MenuItem>
//                 <MenuItem value="admin">Admin</MenuItem>
//                 <MenuItem value="teacher">Teacher</MenuItem>
//               </Select>
//             )}
//           />
//           <FormHelperText>{errors?.role?.message}</FormHelperText>
//         </FormControl>


//         {/* Avatar Upload */}
//         <Box mt={2}>
//           <Box
//             component="label"
//             htmlFor="avatar"
//             sx={{
//               border: `1px solid ${theme.palette.divider}`,
//               borderRadius: "6px",
//               padding: "14px 16px",
//               backgroundColor: theme.palette.background.paper,
//               display: "block",
//               cursor: "pointer",
//               color: theme.palette.text.primary,
//             }}
//           >
//             <input
//               id="avatar"
//               type="file"
//               accept="image/*"
//               hidden
//               onChange={handleAvatarChange}
//             />
//             <Typography variant="body2">
//               {avatarPreview ? "Change Image" : "Choose Image"}
//             </Typography>
//           </Box>

//           {avatarPreview && (
//             <Box mt={2}>
//               <Typography variant="body2">Avatar Preview:</Typography>
//               <img
//                 src={avatarPreview}
//                 alt="Avatar preview"
//                 style={{ width: "120px", height: "auto", marginTop: "8px" }}
//               />
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Create>
//   );
// };

// import React from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
// } from "@mui/material";
// import { useForm } from "@refinedev/react-hook-form";
// import { Create } from "@refinedev/mui";

// type AssignPayload = {
//   username: string;
//   examScheduleId: number;
// };

// export const AddStudentToExamSchedule: React.FC = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<AssignPayload>();

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

//       alert("Student assigned successfully!");
//     } catch (error: any) {
//       alert("Error: " + error.message);
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
//           // helperText={errors.username?.message}
//           fullWidth
//         />

//         <TextField
//           {...register("examScheduleId", {
//             required: "Schedule ID is required",
//             valueAsNumber: true,
//           })}
//           label="Schedule ID"
//           type="number"
//           error={!!errors.examScheduleId}
//           // helperText={errors.examScheduleId?.message}
//           fullWidth
//         />

//         <Button type="submit" variant="contained" color="primary">
//           Assign
//         </Button>
//       </Box>
//     </Create>
//   );
// };

import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { Create } from "@refinedev/mui";

type AssignPayload = {
  username: string;
  examScheduleId: number;
};

export const AddStudentToExamSchedule: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignPayload, any, AssignPayload>(); // ✅ Fix lỗi TypeScript tại đây

  const onSubmit = async (data: AssignPayload) => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/exam-attendance/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: data.username,
          schedule_id: data.examScheduleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign student.");
      }

      alert("Student assigned successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <Create title="Assign Student to Exam">
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 400,
          mt: 2,
        }}
        autoComplete="off"
      >
        <Typography variant="h6">Assign Student to Exam Schedule</Typography>

        <TextField
          {...register("username", { required: "Student ID is required" })}
          label="Student ID"
          error={!!errors.username}
          helperText={errors.username?.message}
          fullWidth
        />

        <TextField
          {...register("examScheduleId", {
            required: "Schedule ID is required",
            valueAsNumber: true,
          })}
          label="Schedule ID"
          type="number"
          error={!!errors.examScheduleId}
          helperText={errors.examScheduleId?.message}
          fullWidth
        />

        <Button type="submit" variant="contained" color="primary">
          Assign
        </Button>
      </Box>
    </Create>
  );
};
