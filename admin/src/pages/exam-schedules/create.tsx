// import {
//   Create,
//   useAutocomplete,
// } from "@refinedev/mui";
// import { useForm } from "@refinedev/react-hook-form";

// import {
//   TextField,
//   Box,
//   Stack,
//   MenuItem,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import dayjs from "dayjs";

// export const ExamScheduleCreate: React.FC = () => {
//   const {
//     saveButtonProps,
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm();

//   const { autocompleteProps: roomAutocompleteProps } = useAutocomplete({
//     resource: "exam-rooms",
//     optionLabel: "room_name",
//     optionValue: "room_id",
//   });

//   return (
//     <Create saveButtonProps={saveButtonProps}>
//       <Box
//         component="form"
//         autoComplete="off"
//         onSubmit={handleSubmit(() => {})}
//       >
//         <Stack gap={3}>
//           <TextField
//             {...register("name_schedule", {
//               required: "Tên lịch thi là bắt buộc",
//             })}
//             label="Tên lịch thi"
//             error={!!errors.name_schedule}
//             helperText={errors.name_schedule?.message}
//             fullWidth
//           />

//           <DateTimePicker
//             label="Thời gian bắt đầu"
//             value={watch("start_time") ? dayjs(watch("start_time")) : null}
//             onChange={(value) => {
//               setValue("start_time", value?.toISOString());
//             }}
//             slotProps={{
//               textField: {
//                 fullWidth: true,
//                 error: !!errors.start_time,
//                 helperText: errors.start_time?.message,
//               },
//             }}
//           />

//           <DateTimePicker
//             label="Thời gian kết thúc"
//             value={watch("end_time") ? dayjs(watch("end_time")) : null}
//             onChange={(value) => {
//               setValue("end_time", value?.toISOString());
//             }}
//             slotProps={{
//               textField: {
//                 fullWidth: true,
//                 error: !!errors.end_time,
//                 helperText: errors.end_time?.message,
//               },
//             }}
//           />

//           <TextField
//             select
//             label="Phòng thi"
//             fullWidth
//             {...register("room.room_id", {
//               required: "Phòng thi là bắt buộc",
//               valueAsNumber: true,
//             })}
//             error={!!errors.room?.room_id}
//             helperText={errors.room?.room_id?.message}
//           >
//             {roomAutocompleteProps?.options?.map((option) => (
//               <MenuItem key={option.room_id} value={option.room_id}>
//                 {option.room_name}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             select
//             label="Trạng thái"
//             fullWidth
//             {...register("status", { required: "Trạng thái là bắt buộc" })}
//             error={!!errors.status}
//             helperText={errors.status?.message}
//             defaultValue="scheduled"
//           >
//             <MenuItem value="scheduled">Scheduled</MenuItem>
//             <MenuItem value="completed">Completed</MenuItem>
//             <MenuItem value="cancelled">Cancelled</MenuItem>
//           </TextField>
//         </Stack>
//       </Box>
//     </Create>
//   );
// };
