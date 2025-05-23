import { useShow, useTranslate } from "@refinedev/core";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  NumberField,
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui";

import type { Room } from "./types";

export const RoomShow: React.FC = () => {
  const translate = useTranslate();
  const {
    query: { data: roomResult, isLoading },
  } = useShow<Room>();

  const room = roomResult?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {translate("rooms.fields.id", "Room ID")}
        </Typography>
        {room ? (
          <TextField value={room.room_id} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("rooms.fields.room_name", "Room Name")}
        </Typography>
        {room ? (
          <TextField value={room.room_name} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("rooms.fields.capacity", "Capacity")}
        </Typography>
        {room ? (
          <NumberField value={room.capacity} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("rooms.fields.location", "Location")}
        </Typography>
        {room ? (
          <TextField value={room.location} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}

        <Typography variant="body1" fontWeight="bold">
          {translate("rooms.fields.status", "Status")}
        </Typography>
        {room ? (
          <TextField value={room.status} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
      </Stack>
    </Show>
  );
};
