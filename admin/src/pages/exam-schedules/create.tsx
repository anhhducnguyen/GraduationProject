import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box } from "@mui/material";
import { Create } from "@refinedev/mui";
import type { ExamSchedule } from "./types";

export const ExamScheduleCreate: React.FC = () => {
  const translate = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading, onFinish },
    register,
    formState: { errors },
  } = useForm<ExamSchedule, HttpError, ExamSchedule>();

  const onSubmit = (data: ExamSchedule) => {
  console.log("DATA:", data);
  onFinish(data);
};

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("schedule_id", {
            required: translate("form.required"),
          })}
          error={!!errors?.schedule_id}
          helperText={<>{errors?.schedule_id?.message}</>}
          margin="normal"
          fullWidth
          label="schedule_id"
        />
        <TextField
          {...register("name_schedule", {
            required: translate("form.required"),
          })}
          error={!!errors?.name_schedule}
          helperText={<>{errors?.name_schedule?.message}</>}
          margin="normal"
          fullWidth
          label="name_schedule"
        />
        <TextField
          {...register("start_time", {
            required: translate("form.required"),
          })}
          error={!!errors?.start_time}
          helperText={<>{errors?.start_time?.message}</>}
          margin="normal"
          fullWidth
          label="start_time"
        />
        <TextField
          {...register("end_time", {
            required: translate("form.required"),
          })}
          error={!!errors?.end_time}
          helperText={<>{errors?.end_time?.message}</>}
          margin="normal"
          fullWidth
          label="end_time"
        />
        <TextField
          {...register("room_id", {
            required: translate("form.required"),
          })}
          error={!!errors?.room_id}
          helperText={<>{errors?.room_id?.message}</>}
          margin="normal"
          fullWidth
          label="room_id"
        />
        <TextField
          {...register("status", {
            required: translate("form.required"),
          })}
          error={!!errors?.status}
          helperText={<>{errors?.status?.message}</>}
          margin="normal"
          fullWidth
          label="status"
        />
      </Box>
    </Create>
  );
};
