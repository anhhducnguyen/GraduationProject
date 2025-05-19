import { useShow, useTranslate } from "@refinedev/core";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  NumberField,
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui";

import type { User } from "./types"; // bạn nên định nghĩa User type tương tự như ở phần Create

export const UserShow: React.FC = () => {
  const translate = useTranslate();
  const {
    query: { data: userResult, isLoading },
  } = useShow<User>();

  const user = userResult?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.id")}
        </Typography>
        {user ? (
          <NumberField value={user.id} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.first_name")}
        </Typography>
        {user ? (
          <TextField value={user.first_name} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.last_name")}
        </Typography>
        {user ? (
          <TextField value={user.last_name} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.age")}
        </Typography>
        {user ? (
          <NumberField value={user.age} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.gender")}
        </Typography>
        {user ? (
          <TextField value={user.gender} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        {/* <Typography variant="body1" fontWeight="bold">
          {translate("users.fields.avatar")}
        </Typography>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.first_name} ${user.last_name}`}
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
        ) : isLoading ? (
          <Skeleton height="120px" width="200px" />
        ) : (
          <TextField value="No avatar" />
        )} */}
      </Stack>
    </Show>
  );
};
