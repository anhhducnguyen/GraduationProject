import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
    PieChart,
    PropertyReferrals,
    TotalRevenue,
} from "@/components";

const Home = () => {
    return (
        <Box>
            {/* <Typography fontSize={25} fontWeight={700} color="#11142D">
                Dashboard
            </Typography> */}

            <Box mt="20px" display="flex" flexWrap="wrap" gap={4}>
                <PieChart
                    title="Properties for Sale"
                    value={684}
                    series={[75, 25]}
                    colors={["#1976d2", "#c4e8ef"]}
                />
                <PieChart
                    title="Properties for Rent"
                    value={550}
                    series={[60, 40]}
                    colors={["#1976d2", "#c4e8ef"]}
                />
                <PieChart
                    title="Total customers"
                    value={5684}
                    series={[75, 25]}
                    colors={["#1976d2", "#c4e8ef"]}
                />
                <PieChart
                    title="Properties for Cities"
                    value={555}
                    series={[75, 25]}
                    colors={["#1976d2", "#c4e8ef"]}
                />
            </Box>

            <Stack
                mt="25px"
                width="100%"
                direction={{ xs: "column", lg: "row" }}
                gap={4}
            >
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