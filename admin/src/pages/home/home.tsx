// export default Home;
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
  PieChart,
  PropertyReferrals,
  TotalRevenue,
} from "@/components";

import axios from "@/utils/axios"; // axios đã cấu hình baseURL

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const Home = () => {
  const [stats, setStats] = useState({
    fakeFaceTotal: 0,
    totalStudents: 0,
    statusCount: { scheduled: 0, completed: 0, cancelled: 0 },
    topFakeSchedules: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/dashboard/overview`);
        const result = response.data.data;

        setStats({
          fakeFaceTotal: result.total_fake_faces,
          totalStudents: result.total_students,
          statusCount: result.statusCount,
          topFakeSchedules: result.topFakeSchedules,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const fakeFaceOthers = Math.max(stats.totalStudents - stats.fakeFaceTotal, 0);

  return (
    <Box>
      <Box mt="20px" display="flex" flexWrap="wrap" gap={4}>
        <PieChart
          title="Tổng khuôn mặt giả"
          value={stats.fakeFaceTotal}
          series={[stats.fakeFaceTotal, fakeFaceOthers]}
          colors={["#1976d2", "#c4e8ef"]}
        />
        <PieChart
          title="Lịch đã hoàn thành"
          value={stats.statusCount.completed}
          series={[
            stats.statusCount.completed,
            stats.statusCount.scheduled + stats.statusCount.cancelled,
          ]}
          colors={["#4caf50", "#e0e0e0"]}
        />
        <PieChart
          title="Lịch đang chờ"
          value={stats.statusCount.scheduled}
          series={[
            stats.statusCount.scheduled,
            stats.statusCount.completed + stats.statusCount.cancelled,
          ]}
          colors={["#1976d2", "#e0e0e0"]}
        />
        <PieChart
          title="Lịch bị hủy"
          value={stats.statusCount.cancelled}
          series={[
            stats.statusCount.cancelled,
            stats.statusCount.completed + stats.statusCount.scheduled,
          ]}
          colors={["#f44336", "#e0e0e0"]}
        />
      </Box>

      <Stack mt="25px" width="100%" direction={{ xs: "column", lg: "row" }} gap={4}>
        <TotalRevenue />
        <PropertyReferrals />
      </Stack>

      <Box
        flex={1}
        borderRadius="15px"
        padding="20px"
        bgcolor="#fcfcfc"
        display="flex"
        flexDirection="column"
        minWidth="100%"
        mt="25px"
      >
      </Box>
    </Box>
  );
};

export default Home;
