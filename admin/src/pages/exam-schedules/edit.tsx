import { type HttpError, useTranslate, useMany } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { TextField, Box, MenuItem, Autocomplete } from "@mui/material";
import { Edit } from "@refinedev/mui";
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

export const ExamScheduleEdit: React.FC = () => {
    const { dataGridProps } = useDataGrid<ExamSchedule>();
    const translate = useTranslate();

    const {
        saveButtonProps,
        refineCore: { formLoading, queryResult },
        register,
        control,
        formState: { errors },
    } = useForm<ExamSchedule, HttpError, ExamSchedule>({
        refineCoreProps: {
            action: "edit",
            successNotification: () => {
                return {
                    message: "Cập nhật lịch thi thành công",
                    type: "success",
                };
            },
        },
    });

    const record = queryResult?.data?.data;

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
            <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
                        label={translate("schedules.fields.name_schedule", "Tên lịch thi")}
                    />

                    {/* Thời gian bắt đầu */}
                    <Controller
                        control={control}
                        name="start_time"
                        rules={{ required: translate("form.required") }}
                        render={({ field }) => (
                            <DateTimePicker
                                label={translate("schedules.fields.start_time", "Thời gian bắt đầu")}
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(value) =>
                                    value
                                        ? field.onChange(dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
                                        : field.onChange("")
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
                                label={translate("schedules.fields.end_time", "Thời gian kết thúc")}
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(value) =>
                                    value
                                        ? field.onChange(dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
                                        : field.onChange("")
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
                            <Autocomplete
                                options={Object.entries(roomMap).map(([id, name]) => ({
                                    label: name,
                                    value: Number(id),
                                }))}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                onChange={(_, value) => field.onChange(value?.value ?? "")}
                                value={
                                    Object.entries(roomMap)
                                        .map(([id, name]) => ({
                                            label: name,
                                            value: Number(id),
                                        }))
                                        .find((item) => item.value === field.value) || null
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={translate("rooms.fields.room_name", "Chọn phòng thi")}
                                        fullWidth
                                        margin="normal"
                                        error={!!errors?.room?.room_id}
                                        helperText={errors?.room?.room_id?.message}
                                    />
                                )}
                            />
                        )}
                    />

                    {/* Trạng thái */}
                    <Controller
                        control={control}
                        name="status"
                        defaultValue="scheduled"
                        rules={{ required: translate("form.required") }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label={translate("schedules.fields.status", "Trạng thái")}
                                fullWidth
                                margin="normal"
                                error={!!errors?.status}
                                helperText={errors?.status?.message}
                            >
                                <MenuItem value="scheduled">
                                    {translate("schedules.status.scheduled", "Đã lên lịch")}
                                </MenuItem>
                                <MenuItem value="completed">
                                    {translate("schedules.status.completed", "Hoàn thành")}
                                </MenuItem>
                                <MenuItem value="cancelled">
                                    {translate("schedules.status.cancelled", "Đã hủy")}
                                </MenuItem>
                            </TextField>
                        )}
                    />
                </Box>
            </Edit>
        </LocalizationProvider>
    );
};
