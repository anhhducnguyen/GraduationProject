import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, MenuItem } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { Controller } from "react-hook-form";
import type { User } from "./types";
import {
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

export const UserEdit: React.FC = () => {
  const translate = useTranslate();
  const theme = useTheme();

  const {
    saveButtonProps,
    refineCore: { formLoading, queryResult },
    register,
    setValue,
    control,
    formState: { errors },
  } = useForm<User, HttpError, User>();

  const record: User | undefined = queryResult?.data?.data;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (record?.avatar) {
      setAvatarPreview(record.avatar);
    }
  }, [record]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setAvatarPreview(fileUrl);
      setValue("avatar", file.name);
    }
  };

  return (
    <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("first_name", { required: "Required" })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message}
          margin="normal"
          fullWidth
          label="First Name"
        />

        <TextField
          {...register("last_name", { required: "Required" })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message}
          margin="normal"
          fullWidth
          label="Last Name"
        />

        <TextField
          {...register("age", {
            required: "Required",
            valueAsNumber: true,
            min: { value: 0, message: "Age must be >= 0" },
          })}
          error={!!errors?.age}
          helperText={errors?.age?.message}
          margin="normal"
          fullWidth
          type="number"
          label="Age"
        />

        <FormControl fullWidth margin="normal" error={!!errors?.gender}>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Controller
            control={control}
            name="gender"
            defaultValue={record?.gender ?? ""}
            rules={{ required: "Required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="gender-label"
                label="Gender"
              >
                <MenuItem value=""><em>Choose...</em></MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>{errors?.gender?.message}</FormHelperText>
        </FormControl>

        <TextField
          {...register("email", { required: "Required" })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
          margin="normal"
          fullWidth
          label="Email"
          type="email"
        />

        <TextField
          {...register("username", { required: "Required" })}
          error={!!errors?.username}
          helperText={errors?.username?.message}
          margin="normal"
          fullWidth
          label="Username"
        />

        <TextField
          {...register("password", {
            required: "Required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors?.password}
          helperText={errors?.password?.message}
          margin="normal"
          fullWidth
          type="password"
          label="Password"
        />

        <FormControl fullWidth margin="normal" error={!!errors?.role}>
          <InputLabel id="role-label">Role</InputLabel>
          <Controller
            name="role"
            control={control}
            defaultValue={record?.role ?? ""}
            rules={{ required: "Required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="role-label"
                label="Role"
              >
                <MenuItem value=""><em>Choose...</em></MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            )}
          />
          <FormHelperText>{errors?.role?.message}</FormHelperText>
        </FormControl>

        {/* Avatar Upload */}
        <Box mt={2}>
          <Box
            component="label"
            htmlFor="avatar"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "6px",
              padding: "14px 16px",
              backgroundColor: theme.palette.background.paper,
              display: "block",
              cursor: "pointer",
              color: theme.palette.text.primary,
            }}
          >
            <input
              id="avatar"
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <Typography variant="body2">
              {avatarPreview ? "Change Image" : "Choose Image"}
            </Typography>
          </Box>

          {avatarPreview && (
            <Box mt={2}>
              <Typography variant="body2">Avatar Preview:</Typography>
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{ width: "120px", height: "auto", marginTop: "8px" }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Edit>
  );
};
