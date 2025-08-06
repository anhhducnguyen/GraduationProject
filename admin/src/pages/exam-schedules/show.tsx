import React, { useEffect, useMemo } from "react";
import { useShow, useTranslate, useGetLocale } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import {
  Typography,
  Divider,
  Skeleton,
  Stack,
  Button,
  Grid,
  Box,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Tag } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { vi } from "date-fns/locale";

import type { ExamSchedule } from './types'

export const ExamScheduleShow: React.FC = () => {
  const translate = useTranslate();
  const locale = useGetLocale()();
  const isVi = locale === "vi";
  const t = (en: string, viText: string) => (isVi ? viText : en);

  const {
    query: { data, isLoading, isFetching, refetch },
  } = useShow<ExamSchedule>();
  const schedule = data?.data;

  useEffect(() => {
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const renderDate = (value: string) => {
    const date = new Date(value);
    return (
      <Typography variant="body2">
        {format(date, isVi ? "EEEE, dd/MM/yyyy 'lúc' HH:mm" : "EEE/dd/yyyy HH:mm", {
          locale: isVi ? vi : undefined,
        })}
      </Typography>
    );
  };

  const renderStatusTag = (value: string | undefined) => {
    if (!value) return <Skeleton height="20px" width="100px" />;
    let color: "blue" | "green" | "red" | "default" = "default";
    let label = value;
    let icon = null;

    switch (value) {
      case "scheduled":
        color = "blue";
        label = t("Scheduled", "Đã lên lịch");
        icon = <CalendarOutlined />;
        break;
      case "completed":
        color = "green";
        label = t("Completed", "Đã hoàn thành");
        icon = <CheckCircleOutlined />;
        break;
      case "cancelled":
        color = "red";
        label = t("Cancelled", "Đã hủy");
        icon = <CloseCircleOutlined />;
        break;
      default:
        label = value;
    }

    return <Tag color={color} icon={icon}>{label}</Tag>;
  };

  const studentColumns: GridColDef[] = useMemo(
    () => [
      {
        field: "student_id",
        headerName: t("Student ID", "Mã SV"),
        flex: 1,
      },
      {
        field: "last_name",
        headerName: t("Last Name", "Họ"),
        flex: 1.5,
      },
      {
        field: "first_name",
        headerName: t("First Name", "Tên"),
        flex: 1.5,
      },
      {
        field: "is_present",
        headerName: t("Present", "Có mặt"),
        flex: 1,
        minWidth: 120,
        renderCell: ({ value }) => {
          let color: "green" | "red" | "default" = "default";
          let label = value;
          let icon = null;

          switch (value) {
            case 1:
              color = "green";
              label = t("Present", "Có mặt");
              icon = <CheckCircleOutlined />;
              break;
            case 0:
              color = "red";
              label = t("Absent", "Vắng mặt");
              icon = <CloseCircleOutlined />;
              break;
            default:
              label = String(value);
          }

          return <Tag color={color} icon={icon}>{label}</Tag>;
        },
      },
      // {
      //   field: "confidence",
      //   headerName: t("Confidence", "Độ chính xác (%)"),
      //   flex: 1,
      //   minWidth: 120,
      //   align: 'right',
      //   renderCell: ({ value }) => `${value?.toFixed?.(2) ?? '-'}%`,
      // },
      // {
      //   field: "realFace",
      //   headerName: t("Real Face", "Real Face"),
      //   flex: 1,
      //   minWidth: 100,
      //   renderCell: ({ value }) => {
      //     if (value === null || value === undefined) return "-";
      //     const isReal = value === true || value === 1 || value === "1";
      //     const color = isReal ? "green" : "red";
      //     const label = isReal ? t("Real", "Thật") : t("Fake", "Giả");
      //     return <Tag color={color}>{label}</Tag>;
      //   },
      // },


      {
        field: "updated_at",
        headerName: t("Last Updated", "Cập nhật lần cuối"),
        flex: 2,
        // renderCell: ({ value }) => renderDate(value),
        renderCell: ({ value }) =>
          dayjs(value).locale(locale ?? "en").format("dddd, DD/MM/YYYY HH:mm"),
      },
    ],
    [translate, locale]
  );

  const renderRow = (label: string, value: React.ReactNode) => (
  <Box display="flex" gap={1} mb={1}>
    <Typography fontWeight="bold" minWidth={160}>
      {label}
    </Typography>
    <Box>
      {value !== undefined ? value : <Skeleton width="100px" />}
    </Box>
  </Box>
);


  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Grid container spacing={1}>
          {/* Cột 1 */}
          <Grid item xs={12} md={4}>
            {renderRow(t("Schedule ID", "Mã lịch"), schedule?.schedule_id)}
            {renderRow(t("Schedule Name", "Tên lịch"), schedule?.name_schedule)}
          </Grid>

          {/* Cột 2 */}
          <Grid item xs={12} md={4}>
            {renderRow(t("Room Name", "Tên phòng"), schedule?.room?.room_name)}
            {renderRow(t("Capacity", "Sức chứa"), schedule?.room?.capacity)}
          </Grid>

          {/* Cột 3 */}
          <Grid item xs={12} md={4}>
            {renderRow(t("Start Time", "Bắt đầu"), schedule?.start_time ? renderDate(schedule.start_time) : undefined)}
            {renderRow(t("End Time", "Kết thúc"), schedule?.end_time ? renderDate(schedule.end_time) : undefined)}
            {renderRow(t("Status", "Trạng thái"), renderStatusTag(schedule?.status))}
          </Grid>
        </Grid>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {t("Student List", "Danh sách sinh viên")}
          </Typography>
          <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? t("Refreshing...", "Đang làm mới...") : t("Refresh", "Làm mới")}
          </Button>
        </Stack>

        {schedule?.students?.length ? (
          <DataGrid
            rows={schedule.students
              .filter((s) => s.student_id != null)
              .map((s) => ({ ...s, id: s.student_id }))}
            columns={studentColumns}
            pageSizeOptions={[20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            disableRowSelectionOnClick
          />
        ) : (
          <Typography>{t("No students found for this schedule.", "Không có sinh viên nào trong lịch thi này.")}</Typography>
        )}
      </Stack>
    </Show>
  );
};
