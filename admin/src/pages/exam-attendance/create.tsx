// // import { type HttpError, useTranslate } from "@refinedev/core";
// // import { useForm } from "@refinedev/react-hook-form";
// // import { Box, TextField } from "@mui/material";
// // import { Create } from "@refinedev/mui";

// // type User = {
// //   id?: string;
// //   first_name: string;
// //   last_name: string;
// //   age: number;
// //   gender: string;
// //   avatar?: string;
// //   created_at?: string;
// //   updated_at?: string;
// // };

// // export const UserCreate: React.FC = () => {
// //   const translate = useTranslate();

// //   const {
// //     saveButtonProps,
// //     refineCore: { formLoading },
// //     register,
// //     formState: { errors },
// //   } = useForm<User, HttpError, User>();

// //   return (
// //     <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
// //       <Box
// //         component="form"
// //         sx={{ display: "flex", flexDirection: "column" }}
// //         autoComplete="off"
// //       >
// //         <TextField
// //           {...register("first_name", {
// //             required: translate("form.required"),
// //           })}
// //           error={!!errors?.first_name}
// //           helperText={errors?.first_name?.message}
// //           margin="normal"
// //           fullWidth
// //           type="text"
// //           label={translate("users.fields.first_name")}
// //           name="first_name"
// //         />
// //         <TextField
// //           {...register("last_name", {
// //             required: translate("form.required"),
// //           })}
// //           error={!!errors?.last_name}
// //           helperText={errors?.last_name?.message}
// //           margin="normal"
// //           fullWidth
// //           type="text"
// //           label={translate("users.fields.last_name")}
// //           name="last_name"
// //         />
// //         <TextField
// //           {...register("age", {
// //             required: translate("form.required"),
// //             valueAsNumber: true,
// //             min: {
// //               value: 0,
// //               message: translate("form.validation.min", { min: 0 }),
// //             },
// //           })}
// //           error={!!errors?.age}
// //           helperText={errors?.age?.message}
// //           margin="normal"
// //           fullWidth
// //           type="number"
// //           label={translate("users.fields.age")}
// //           name="age"
// //         />
// //         <TextField
// //           {...register("gender", {
// //             required: translate("form.required"),
// //           })}
// //           error={!!errors?.gender}
// //           helperText={errors?.gender?.message}
// //           margin="normal"
// //           fullWidth
// //           type="text"
// //           label={translate("users.fields.gender")}
// //           name="gender"
// //         />
// //         <TextField
// //           {...register("avatar")}
// //           error={!!errors?.avatar}
// //           helperText={errors?.avatar?.message}
// //           margin="normal"
// //           fullWidth
// //           type="url"
// //           label={translate("users.fields.avatar")}
// //           name="avatar"
// //         />
// //       </Box>
// //     </Create>
// //   );
// // };


// // import { type HttpError, useTranslate } from "@refinedev/core";
// // import { useForm } from "@refinedev/react-hook-form";
// // import {
// //   Box,
// //   TextField,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   FormHelperText,
// // } from "@mui/material";
// // import { Create } from "@refinedev/mui";

// // type User = {
// //   id?: string;
// //   first_name: string;
// //   last_name: string;
// //   age: number;
// //   gender: string;
// //   avatar?: string;
// //   created_at?: string;
// //   updated_at?: string;
// // };

// // export const UserCreate: React.FC = () => {
// //   const translate = useTranslate();

// //   const {
// //     saveButtonProps,
// //     refineCore: { formLoading },
// //     register,
// //     formState: { errors },
// //   } = useForm<User, HttpError, User>();

// //   return (
// //     <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
// //       <Box
// //         component="form"
// //         sx={{ display: "flex", flexDirection: "column" }}
// //         autoComplete="off"
// //       >
// //         <TextField
// //           {...register("first_name", {
// //             required: translate("form.required"),
// //           })}
// //           error={!!errors?.first_name}
// //           helperText={errors?.first_name?.message}
// //           margin="normal"
// //           fullWidth
// //           type="text"
// //           label={translate("users.fields.first_name")}
// //           name="first_name"
// //         />
// //         <TextField
// //           {...register("last_name", {
// //             required: translate("form.required"),
// //           })}
// //           error={!!errors?.last_name}
// //           helperText={errors?.last_name?.message}
// //           margin="normal"
// //           fullWidth
// //           type="text"
// //           label={translate("users.fields.last_name")}
// //           name="last_name"
// //         />
// //         <TextField
// //           {...register("age", {
// //             required: translate("form.required"),
// //             valueAsNumber: true,
// //             min: {
// //               value: 0,
// //               message: translate("form.validation.min", { min: 0 }),
// //             },
// //           })}
// //           error={!!errors?.age}
// //           helperText={errors?.age?.message}
// //           margin="normal"
// //           fullWidth
// //           type="number"
// //           label={translate("users.fields.age")}
// //           name="age"
// //         />

// //         <FormControl
// //           fullWidth
// //           margin="normal"
// //           error={!!errors?.gender}
// //         >
// //           <InputLabel id="gender-label">{translate("users.fields.gender")}</InputLabel>
// //           <Select
// //             labelId="gender-label"
// //             label={translate("users.fields.gender")}
// //             {...register("gender", {
// //               required: translate("form.required"),
// //             })}
// //             defaultValue=""
// //             name="gender"
// //           >
// //             <MenuItem value=""><em>{translate("form.select_gender") || "-- Chọn giới tính --"}</em></MenuItem>
// //             <MenuItem value="male">{translate("users.gender.male") || "Nam"}</MenuItem>
// //             <MenuItem value="female">{translate("users.gender.female") || "Nữ"}</MenuItem>
// //           </Select>
// //           <FormHelperText>{errors?.gender?.message}</FormHelperText>
// //         </FormControl>

// //         <TextField
// //           {...register("avatar")}
// //           error={!!errors?.avatar}
// //           helperText={errors?.avatar?.message}
// //           margin="normal"
// //           fullWidth
// //           type="url"
// //           label={translate("users.fields.avatar")}
// //           name="avatar"
// //         />
// //       </Box>
// //     </Create>
// //   );
// // };

// import { type HttpError, useTranslate } from "@refinedev/core";
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
// import { useState } from "react";

// type User = {
//   id?: string;
//   first_name: string;
//   last_name: string;
//   age: number;
//   gender: string;
//   avatar?: File | string;
//   created_at?: string;
//   updated_at?: string;
// };

// export const UserCreate: React.FC = () => {
//   const translate = useTranslate();

//   const {
//     saveButtonProps,
//     refineCore: { formLoading },
//     register,
//     setValue,
//     formState: { errors },
//   } = useForm<User, HttpError, User>();

//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

//   const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setValue("avatar", file);
//       setAvatarPreview(URL.createObjectURL(file));
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
//           {...register("first_name", {
//             required: translate("form.required"),
//           })}
//           error={!!errors?.first_name}
//           helperText={errors?.first_name?.message}
//           margin="normal"
//           fullWidth
//           type="text"
//           label={translate("users.fields.first_name")}
//           name="first_name"
//         />
//         <TextField
//           {...register("last_name", {
//             required: translate("form.required"),
//           })}
//           error={!!errors?.last_name}
//           helperText={errors?.last_name?.message}
//           margin="normal"
//           fullWidth
//           type="text"
//           label={translate("users.fields.last_name")}
//           name="last_name"
//         />
//         <TextField
//           {...register("age", {
//             required: translate("form.required"),
//             valueAsNumber: true,
//             min: {
//               value: 0,
//               message: translate("form.validation.min", { min: 0 }),
//             },
//           })}
//           error={!!errors?.age}
//           helperText={errors?.age?.message}
//           margin="normal"
//           fullWidth
//           type="number"
//           label={translate("users.fields.age")}
//           name="age"
//         />

//         <FormControl fullWidth margin="normal" error={!!errors?.gender}>
//           <InputLabel id="gender-label">
//             {translate("users.fields.gender")}
//           </InputLabel>
//           <Select
//             labelId="gender-label"
//             label={translate("users.fields.gender")}
//             defaultValue=""
//             {...register("gender", {
//               required: translate("form.required"),
//             })}
//             name="gender"
//           >
//             <MenuItem value="">
//               <em>{translate("form.select_gender")}</em>
//             </MenuItem>
//             <MenuItem value="male">
//               {translate("users.gender.male") || "Nam"}
//             </MenuItem>
//             <MenuItem value="female">
//               {translate("users.gender.female") || "Nữ"}
//             </MenuItem>
//           </Select>
//           <FormHelperText>{errors?.gender?.message}</FormHelperText>
//         </FormControl>

//         <Box mt={2}>
//           <Typography variant="body1" fontWeight="bold" mb={1}>
//             {translate("users.fields.avatar")}
//           </Typography>
//           <input
//             type="file"
//             accept="image/*"
//             id="avatar"
//             onChange={handleAvatarChange}
//             style={{
//               padding: "12px 10px",
//               border: "1px solid #ccc",
//               borderRadius: "6px",
//               height: "50px",
//               width: "100%",
//               backgroundColor: "#fafafa",
//               cursor: "pointer",
//             }}
//           />
//           {avatarPreview && (
//             <Box mt={2}>
//               <Typography variant="body2">Xem trước ảnh:</Typography>
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


import {
  type HttpError,
  useTranslate,
} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";

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
  const theme = useTheme();

  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    setValue,
    formState: { errors },
  } = useForm<User, HttpError, User>();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setAvatarPreview(fileUrl);
      // Giả sử bạn chỉ lưu URL (hoặc có thể thay đổi để upload lên server và lấy link)
      setValue("avatar", file.name); // hoặc fileUrl nếu bạn xử lý blob
    }
  };

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

        <FormControl
          fullWidth
          margin="normal"
          error={!!errors?.gender}
        >
          <InputLabel id="gender-label">
            {translate("users.fields.gender")}
          </InputLabel>
          <Select
            labelId="gender-label"
            label={translate("users.fields.gender")}
            defaultValue=""
            {...register("gender", {
              required: translate("form.required"),
            })}
          >
            <MenuItem value="">
              <em>{translate("form.select_gender")}</em>
            </MenuItem>
            <MenuItem value="male">
              {translate("users.gender.male")}
            </MenuItem>
            <MenuItem value="female">
              {translate("users.gender.female")}
            </MenuItem>
          </Select>
          <FormHelperText>{errors?.gender?.message}</FormHelperText>
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
              // height: "56px"
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
              {avatarPreview
                ? translate("form.change_image")
                : translate("form.choose_image")}
            </Typography>
          </Box>

          {avatarPreview && (
            <Box mt={2}>
              <Typography variant="body2">Xem trước ảnh:</Typography>
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{ width: "120px", height: "auto", marginTop: "8px" }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Create>
  );
};
