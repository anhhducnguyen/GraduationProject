import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box } from "@mui/material";
import { Create } from "@refinedev/mui";
import type { Room } from "./types";

export const RoomCreate: React.FC = () => {
  const translate = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
  } = useForm<Room, HttpError, Room>();

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        {/* <TextField
          {...register("room_id", {
            required: translate("form.required"),
          })}
          error={!!errors?.room_id}
          helperText={<>{errors?.room_id?.message}</>}
          margin="normal"
          fullWidth
          label="Room ID"
        /> */}
        <TextField
          {...register("room_name", {
            required: translate("form.required"),
          })}
          error={!!errors?.room_name}
          helperText={<>{errors?.room_name?.message}</>}
          margin="normal"
          fullWidth
          label="Room Name"
        />
        <TextField
          {...register("capacity", {
            required: translate("form.required"),
            min: {
              value: 1,
              message: "Capacity must be at least 1",
            },
            valueAsNumber: true,
          })}
          error={!!errors?.capacity}
          helperText={<>{errors?.capacity?.message}</>}
          margin="normal"
          fullWidth
          type="number"
          label="Capacity"
        />
        <TextField
          {...register("location", {
            required: translate("form.required"),
          })}
          error={!!errors?.location}
          helperText={<>{errors?.location?.message}</>}
          margin="normal"
          fullWidth
          label="Location"
        />
        <TextField
          {...register("status", {
            required: translate("form.required"),
          })}
          error={!!errors?.status}
          helperText={<>{errors?.status?.message}</>}
          margin="normal"
          fullWidth
          label="Status"
        />
      </Box>
    </Create>
  );
};
