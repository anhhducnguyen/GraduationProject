// import { type HttpError, useTranslate, useMany } from "@refinedev/core";
// import { useForm } from "@refinedev/react-hook-form";
// import { TextField, Box } from "@mui/material";
// import { Create } from "@refinedev/mui";
// import { useMemo } from "react";
// import { Select, MenuItem } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers";
// import dayjs from "dayjs";
// import { Controller } from "react-hook-form";
// // import type { ExamSchedule } from "./types";
// import {
//     useDataGrid,
// } from "@refinedev/mui";

// type ExamSchedule = {
//     schedule_id: number;
//     start_time: string;
//     end_time: string;
//     room: { room_id: number; room_name: string } | null;
//     created_by?: string | null;
//     status: string;
//     name_schedule: string;
// };

// export const ExamScheduleCreate: React.FC = () => {
//     const { dataGridProps } = useDataGrid<ExamSchedule>();
//     const translate = useTranslate();
//     const {
//         saveButtonProps,
//         refineCore: { formLoading, onFinish },
//         register,
//         control,
//         formState: { errors },
//     } = useForm<ExamSchedule, HttpError, ExamSchedule>();

//     const roomIds = [
//         ...new Set(
//             dataGridProps?.rows
//                 ?.map((item) => item?.room?.room_id)
//                 .filter((id): id is number => typeof id === "number")
//         ),
//     ];

//     const {
//         data: roomData,
//         isLoading: roomLoading,
//     } = useMany({
//         resource: "exam-rooms",
//         ids: roomIds,
//         queryOptions: { enabled: roomIds.length > 0 },
//     });

//     const roomMap = useMemo(() => {
//         const map: Record<number, string> = {};
//         roomData?.data?.forEach((room) => {
//             map[room.room_id] = room.room_name;
//         });
//         return map;
//     }, [roomData?.data]);

//     console.log("roomMap", roomMap);

//     return (
//         <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
//             <Box
//                 component="form"
//                 sx={{ display: "flex", flexDirection: "column" }}
//                 autoComplete="off"
//             >
//                 <TextField
//                     {...register("name_schedule", {
//                         required: translate("form.required"),
//                     })}
//                     error={!!errors?.name_schedule}
//                     helperText={<>{errors?.name_schedule?.message}</>}
//                     margin="normal"
//                     fullWidth
//                     label="name_schedule"
//                 />
//                 {/* <TextField
//                     {...register("start_time", {
//                         required: translate("form.required"),
//                     })}
//                     error={!!errors?.start_time}
//                     helperText={<>{errors?.start_time?.message}</>}
//                     margin="normal"
//                     fullWidth
//                     label="start_time"
//                 /> */}
//                 <Controller
//     control={control}
//     name="start_time"
//     rules={{ required: translate("form.required") }}
//     render={({ field }) => (
//         <DateTimePicker
//             label="Start Time"
//             value={field.value ? dayjs(field.value) : null}
//             onChange={(value) => field.onChange(value?.toISOString())}
//             slotProps={{
//                 textField: {
//                     fullWidth: true,
//                     margin: "normal",
//                     error: !!errors?.start_time,
//                     helperText: errors?.start_time?.message,
//                 },
//             }}
//         />
//     )}
// />
//                 <TextField
//                     {...register("end_time", {
//                         required: translate("form.required"),
//                     })}
//                     error={!!errors?.end_time}
//                     helperText={<>{errors?.end_time?.message}</>}
//                     margin="normal"
//                     fullWidth
//                     label="end_time"
//                 />
//                 <Select
//                     labelId="room-label"
//                     label="Phòng thi"
//                     {...register("room.room_id", {
//                         required: translate("form.required"),
//                         valueAsNumber: true, 
//                     })}
//                     defaultValue=""
//                 >
//                     {Object.entries(roomMap).map(([id, name]) => (
//                         <MenuItem key={id} value={Number(id)}>
//                             {name}
//                         </MenuItem>
//                     ))}
//                 </Select>      
//                 <TextField
//                     {...register("status", {
//                         required: translate("form.required"),
//                     })}
//                     error={!!errors?.status}
//                     helperText={<>{errors?.status?.message}</>}
//                     margin="normal"
//                     fullWidth
//                     label="status"
//                 />
//             </Box>
//         </Create>
//     );
// };

import { type HttpError, useTranslate, useMany } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, Select, MenuItem } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDataGrid } from "@refinedev/mui";

type ExamSchedule = {
    schedule_id: number;
    start_time: string;
    end_time: string;
    room: { room_id: number; room_name: string } | null;
    created_by?: string | null;
    status: string;
    name_schedule: string;
};

export const ExamScheduleCreate: React.FC = () => {
    const { dataGridProps } = useDataGrid<ExamSchedule>();
    const translate = useTranslate();

    const {
        saveButtonProps,
        refineCore: { formLoading, onFinish },
        register,
        control,
        formState: { errors },
    } = useForm<ExamSchedule, HttpError, ExamSchedule>();

    const roomIds = [
        ...new Set(
            dataGridProps?.rows
                ?.map((item) => item?.room?.room_id)
                .filter((id): id is number => typeof id === "number")
        ),
    ];

    const {
        data: roomData,
        isLoading: roomLoading,
    } = useMany({
        resource: "exam-rooms",
        ids: roomIds,
        queryOptions: { enabled: roomIds.length > 0 },
    });

    const roomMap = useMemo(() => {
        const map: Record<number, string> = {};
        roomData?.data?.forEach((room) => {
            map[room.room_id] = room.room_name;
        });
        return map;
    }, [roomData?.data]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
                <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column" }}
                    autoComplete="off"
                >
                    {/* Tên lịch thi */}
                    <TextField
                        {...register("name_schedule", {
                            required: translate("form.required"),
                        })}
                        error={!!errors?.name_schedule}
                        helperText={<>{errors?.name_schedule?.message}</>}
                        margin="normal"
                        fullWidth
                        label="Tên lịch thi"
                    />

                    {/* Thời gian bắt đầu */}
                    <Controller
                        control={control}
                        name="start_time"
                        rules={{ required: translate("form.required") }}
                        render={({ field }) => (
                            <DateTimePicker
                                label="Thời gian bắt đầu"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(value) =>
                                    field.onChange(value?.toISOString())
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors?.start_time,
                                        helperText: errors?.start_time?.message,
                                    },
                                }}
                            />
                        )}
                    />

                    {/* Thời gian kết thúc */}
                    <Controller
                        control={control}
                        name="end_time"
                        rules={{ required: translate("form.required") }}
                        render={({ field }) => (
                            <DateTimePicker
                                label="Thời gian kết thúc"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(value) =>
                                    field.onChange(value?.toISOString())
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "normal",
                                        error: !!errors?.end_time,
                                        helperText: errors?.end_time?.message,
                                    },
                                }}
                            />
                        )}
                    />

                    {/* Phòng thi */}
                    <Controller
                        control={control}
                        name="room.room_id"
                        rules={{ required: translate("form.required") }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                displayEmpty
                                fullWidth
                                // margin="normal"
                                error={!!errors?.room?.room_id}
                            >
                                <MenuItem value="" disabled>
                                    Chọn phòng thi
                                </MenuItem>
                                {Object.entries(roomMap).map(([id, name]) => (
                                    <MenuItem key={id} value={Number(id)}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />

                    {/* Trạng thái */}
                    <TextField
                        {...register("status", {
                            required: translate("form.required"),
                        })}
                        error={!!errors?.status}
                        helperText={<>{errors?.status?.message}</>}
                        margin="normal"
                        fullWidth
                        label="Trạng thái"
                    />
                </Box>
            </Create>
        </LocalizationProvider>
    );
};
