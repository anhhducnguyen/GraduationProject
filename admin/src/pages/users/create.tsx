import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField } from "@mui/material";
import { Create } from "@refinedev/mui";

type User = {
  id?: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
};

export const UserCreate: React.FC = () => {
  const translate = useTranslate();

  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
  } = useForm<User, HttpError, User>();

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("first_name", {
            required: translate("form.required"),
          })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message}
          margin="normal"
          fullWidth
          type="text"
          label={translate("users.fields.first_name")}
          name="first_name"
        />
        <TextField
          {...register("last_name", {
            required: translate("form.required"),
          })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message}
          margin="normal"
          fullWidth
          type="text"
          label={translate("users.fields.last_name")}
          name="last_name"
        />
        <TextField
          {...register("age", {
            required: translate("form.required"),
            valueAsNumber: true,
            min: {
              value: 0,
              message: translate("form.validation.min", { min: 0 }),
            },
          })}
          error={!!errors?.age}
          helperText={errors?.age?.message}
          margin="normal"
          fullWidth
          type="number"
          label={translate("users.fields.age")}
          name="age"
        />
        <TextField
          {...register("gender", {
            required: translate("form.required"),
          })}
          error={!!errors?.gender}
          helperText={errors?.gender?.message}
          margin="normal"
          fullWidth
          type="text"
          label={translate("users.fields.gender")}
          name="gender"
        />
        <TextField
          {...register("avatar")}
          error={!!errors?.avatar}
          helperText={errors?.avatar?.message}
          margin="normal"
          fullWidth
          type="url"
          label={translate("users.fields.avatar")}
          name="avatar"
        />
      </Box>
    </Create>
  );
};
