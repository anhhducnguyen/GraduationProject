import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, MenuItem } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { Controller } from "react-hook-form";
import type { Room } from "./types";

export const RoomEdit: React.FC = () => {
  const translate = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading, queryResult },
    register,
    control,
    formState: { errors },
  } = useForm<Room, HttpError, Room>({
    refineCoreProps: {
      action: "edit",
      successNotification: () => {
        return {
          message: "Cập nhật phòng thi thành công",
          type: "success",
        };
      },
    },
  });

  const record = queryResult?.data?.data;

  return (
    <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("room_name", {
            required: translate("form.required"),
          })}
          error={!!errors?.room_name}
          helperText={<>{errors?.room_name?.message}</>}
          margin="normal"
          fullWidth
          label={translate("rooms.fields.room_name")}
        />

        <TextField
          {...register("capacity", {
            required: translate("form.required"),
            min: {
              value: 1,
              message: translate("form.required"),
            },
            valueAsNumber: true,
          })}
          error={!!errors?.capacity}
          helperText={<>{errors?.capacity?.message}</>}
          margin="normal"
          fullWidth
          type="number"
          label={translate("rooms.fields.capacity")}
        />

        <TextField
          {...register("location", {
            required: translate("form.required"),
          })}
          error={!!errors?.location}
          helperText={<>{errors?.location?.message}</>}
          margin="normal"
          fullWidth
          label={translate("rooms.fields.location")}
        />

        <Controller
          control={control}
          name="status"
          defaultValue={record?.status ?? "schedule"}
          rules={{ required: translate("form.required") }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label={translate("rooms.fields.status")}
              fullWidth
              margin="normal"
              error={!!errors?.status}
              helperText={errors?.status?.message}
            >
              <MenuItem value="available">
                {translate("rooms.status.available", "Phòng trống")}
              </MenuItem>
              <MenuItem value="scheduled">
                {translate("rooms.status.scheduled", "Đã đặt lịch")}
              </MenuItem>
              <MenuItem value="in_use">
                {translate("rooms.status.in_use", "Đang thi")}
              </MenuItem>

            </TextField>
          )}
        />
      </Box>
    </Edit>
  );
};
