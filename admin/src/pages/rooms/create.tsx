// import { type HttpError, useTranslate } from "@refinedev/core";
// import { useForm } from "@refinedev/react-hook-form";
// import { TextField, Box, MenuItem } from "@mui/material";
// import { Create } from "@refinedev/mui";
// import { Controller } from "react-hook-form";
// import type { Room } from "./types";

// export const RoomCreate: React.FC = () => {
//   const translate = useTranslate();
//   const {
//     saveButtonProps,
//     refineCore: { formLoading },
//     register,
//     control,
//     formState: { errors },
//   } = useForm<Room, HttpError, Room>({
//     defaultValues: {
//       status: "schedule",
//     },
//   });

//   return (
//     <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
//       <Box
//         component="form"
//         sx={{ display: "flex", flexDirection: "column" }}
//         autoComplete="off"
//       >
//         <TextField
//           {...register("room_name", {
//             required: translate("form.required"),
//           })}
//           error={!!errors?.room_name}
//           helperText={<>{errors?.room_name?.message}</>}
//           margin="normal"
//           fullWidth
//           label="Room Name"
//         />
//         <TextField
//           {...register("capacity", {
//             required: translate("form.required"),
//             min: {
//               value: 1,
//               message: "Capacity must be at least 1",
//             },
//             valueAsNumber: true,
//           })}
//           error={!!errors?.capacity}
//           helperText={<>{errors?.capacity?.message}</>}
//           margin="normal"
//           fullWidth
//           type="number"
//           label="Capacity"
//         />
//         <TextField
//           {...register("location", {
//             required: translate("form.required"),
//           })}
//           error={!!errors?.location}
//           helperText={<>{errors?.location?.message}</>}
//           margin="normal"
//           fullWidth
//           label="Location"
//         />
//         <Controller
//           control={control}
//           name="status"
//           defaultValue="scheduled"
//           rules={{ required: translate("form.required") }}
//           render={({ field }) => (
//             <TextField
//               {...field}
//               select
//               label="Trạng thái"
//               fullWidth
//               margin="normal"
//               error={!!errors?.status}
//               helperText={errors?.status?.message}
//             >
//               <MenuItem value="schedule">Đã lên lịch</MenuItem>
//               <MenuItem value="complete">Hoàn thành</MenuItem>
//               <MenuItem value="cancel">Đã hủy</MenuItem>
//             </TextField>
//           )}
//         />
//       </Box>
//     </Create>
//   );
// };

import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, MenuItem } from "@mui/material";
import { Create } from "@refinedev/mui";
import { Controller } from "react-hook-form";
import type { Room } from "./types";

export const RoomCreate: React.FC = () => {
  const translate = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<Room, HttpError, Room>({
    defaultValues: {
      status: "schedule",
    },
  });

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
          defaultValue="schedule"
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
              <MenuItem value="schedule">{translate("rooms.status.schedule")}</MenuItem>
              <MenuItem value="complete">{translate("rooms.status.complete")}</MenuItem>
              <MenuItem value="cancel">{translate("rooms.status.cancel")}</MenuItem>
            </TextField>
          )}
        />
      </Box>
    </Create>
  );
};
