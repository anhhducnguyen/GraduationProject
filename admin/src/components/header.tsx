import { FormControl, MenuItem, Select } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useGetIdentity, useGetLocale, useSetLocale } from "@refinedev/core";
import {
  HamburgerMenu,
  type RefineThemedLayoutV2HeaderProps,
} from "@refinedev/mui";
import i18n from "i18next";
import type React from "react";
import { useContext } from "react";
import { ColorModeContext } from "../context/color-mode";
import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { IoSunnyOutline } from "react-icons/io5";
import { GiNightSleep } from "react-icons/gi";

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);

  const { data: user } = useGetIdentity<IUser>();

  const changeLanguage = useSetLocale();
  const locale = useGetLocale();
  const currentLocale = locale();

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="flex-end"
          alignItems="center"
        >
          <HamburgerMenu />
          <Stack
            direction="row"
            width="100%"
            justifyContent="flex-end"
            alignItems="center"
          >
            <FormControl sx={{ minWidth: 64, mr: 1.5 }}>
              <Select
                disableUnderline
                defaultValue={currentLocale}
                slotProps={{
                  input: {
                    "aria-label": "Without label",
                  },
                }}
                variant="standard"
                sx={{
                  color: "inherit",
                  "& .MuiSvgIcon-root": {
                    color: "inherit",
                  },
                  "& .MuiStack-root > .MuiTypography-root": {
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  },
                }}
              >
                {[...(i18n.languages ?? [])].sort().map((lang: string) => (
                  <MenuItem
                    selected={currentLocale === lang}
                    key={lang}
                    defaultValue={lang}
                    onClick={() => {
                      changeLanguage(lang);
                    }}
                    value={lang}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {/* <Avatar
                        sx={{
                          width: "24px",
                          height: "24px",
                          marginRight: "5px",
                        }}
                        src={`/images/flags/${lang}.svg`}
                      /> */}
                      <Typography >
                        {lang === "en" ? "English" : "Vietnamese"}
                      </Typography>
                    </Stack>

                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton 
              sx={{ mr: 1.5 }}
              color="inherit"
              aria-label="Toggle dark mode"
              onClick={() => {
                setMode();
              }}
            >
              {/* {mode === "dark" ? <IoSunnyOutline /> : <GiNightSleep />} */}
              {mode === "dark" ? <GiNightSleep /> : <IoSunnyOutline />}
            </IconButton>

            {(user?.avatar || user?.name) && (
              <Stack
                direction="row"
                gap="16px"
                alignItems="center"
                justifyContent="center"
              >
                {user?.name && (
                  <Typography
                    sx={{
                      display: {
                        xs: "none",
                        sm: "inline-block",
                      },
                    }}
                    variant="subtitle2"
                  >
                    {user?.name}
                  </Typography>
                )}
                <Avatar src={user?.avatar} alt={user?.name} />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

// import { useState, useEffect, useContext, type ReactNode } from "react";
// import {
//   useList,
//   useTranslate,
//   useGetIdentity,
//   useGetLocale,
//   useSetLocale,
// } from "@refinedev/core";
// import {
//   type RefineThemedLayoutV2HeaderProps,
//   HamburgerMenu,
// } from "@refinedev/mui";
// import AppBar from "@mui/material/AppBar";
// import IconButton from "@mui/material/IconButton";
// import Link from "@mui/material/Link";
// import Avatar from "@mui/material/Avatar";
// import Typography from "@mui/material/Typography";
// import TextField from "@mui/material/TextField";
// import Toolbar from "@mui/material/Toolbar";
// import Box from "@mui/material/Box";
// import Autocomplete from "@mui/material/Autocomplete";
// import Stack from "@mui/material/Stack";
// import FormControl from "@mui/material/FormControl";
// import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
// import SearchOutlined from "@mui/icons-material/SearchOutlined";
// import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import type { IOrder, IStore, ICourier, IIdentity } from "../interfaces";
// import i18n from "i18next";
// import type React from "react";
// import { ColorModeContext } from "../context/color-mode";

// interface IOptions {
//   label: string;
//   avatar?: ReactNode;
//   link: string;
//   category: string;
// }

// export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = () => {
//   const [value, setValue] = useState("");
//   const [options, setOptions] = useState<IOptions[]>([]);

//   const { mode, setMode } = useContext(ColorModeContext);

//   const changeLanguage = useSetLocale();
//   const locale = useGetLocale();
//   const currentLocale = locale();
//   const { data: user } = useGetIdentity<IIdentity | null>();

//   const t = useTranslate();

//   const { refetch: refetchOrders } = useList<IOrder>({
//     resource: "orders",
//     config: {
//       filters: [{ field: "q", operator: "contains", value }],
//     },
//     queryOptions: {
//       enabled: false,
//       onSuccess: (data) => {
//         const orderOptionGroup: IOptions[] = data.data.map((item) => {
//           return {
//             label: `${item.store.title} / #${item.orderNumber}`,
//             link: `/orders/show/${item.id}`,
//             category: t("orders.orders"),
//             avatar: (
//               <Avatar
//                 variant="rounded"
//                 sx={{
//                   width: "32px",
//                   height: "32px",
//                 }}
//                 src={item.products?.[0]?.images?.[0]?.url}
//               />
//             ),
//           };
//         });
//         if (orderOptionGroup.length > 0) {
//           setOptions((prevOptions) => [...prevOptions, ...orderOptionGroup]);
//         }
//       },
//     },
//   });

//   const { refetch: refetchStores } = useList<IStore>({
//     resource: "stores",
//     config: {
//       filters: [{ field: "q", operator: "contains", value }],
//     },
//     queryOptions: {
//       enabled: false,
//       onSuccess: (data) => {
//         const storeOptionGroup = data.data.map((item) => {
//           return {
//             label: `${item.title} - ${item.address.text}`,
//             link: `/stores/edit/${item.id}`,
//             category: t("stores.stores"),
//           };
//         });
//         setOptions((prevOptions) => [...prevOptions, ...storeOptionGroup]);
//       },
//     },
//   });

//   const { refetch: refetchCouriers } = useList<ICourier>({
//     resource: "couriers",
//     config: {
//       filters: [{ field: "q", operator: "contains", value }],
//     },
//     queryOptions: {
//       enabled: false,
//       onSuccess: (data) => {
//         const courierOptionGroup = data.data.map((item) => {
//           return {
//             label: `${item.name}`,
//             avatar: (
//               <Avatar
//                 sx={{
//                   width: "32px",
//                   height: "32px",
//                 }}
//                 src={item.avatar?.[0]?.url}
//               />
//             ),
//             link: `/couriers/edit/${item.id}`,
//             category: t("couriers.couriers"),
//           };
//         });
//         setOptions((prevOptions) => [...prevOptions, ...courierOptionGroup]);
//       },
//     },
//   });

//   useEffect(() => {
//     setOptions([]);
//     refetchOrders();
//     refetchCouriers();
//     refetchStores();
//   }, [value, refetchOrders, refetchCouriers, refetchStores]);

//   return (
//     <AppBar
//       // color="default"
//       // color="primary"
//       //     color="transparent"
//       // sx={{
//       //   backgroundColor: "red", // 🎯 nền màu đỏ
//       //   // giữ lại các cấu hình cũ nếu cần
//       //   height: "64px",
//       //   borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
//       //   "& .MuiToolbar-root": {
//       //     minHeight: "64px",
//       //   },
//       // }}
//       position="sticky"
//       elevation={0}
//       sx={{
//         "& .MuiToolbar-root": {
//           minHeight: "64px",
//         },
//         height: "64px",
//         borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
//         // backgroundColor: (theme) => theme.palette.background.paper,
//         backgroundColor: "primary",
//       }}
//     >
//       <Toolbar
//         sx={{
//           paddingLeft: {
//             xs: "0",
//             sm: "16px",
//             md: "24px",
//           },
//         }}
//       >
//         <Box
//           minWidth="40px"
//           minHeight="40px"
//           marginRight={{
//             xs: "0",
//             sm: "16px",
//           }}
//           sx={{
//             "& .MuiButtonBase-root": {
//               marginLeft: 0,
//               marginRight: 0,
//             },
//           }}
//         >
//           <HamburgerMenu />
//         </Box>

//         <Stack
//           direction="row"
//           width="100%"
//           justifyContent="space-between"
//           alignItems="center"
//           gap={{
//             xs: "8px",
//             sm: "24px",
//           }}
//         >
//           <Stack direction="row" flex={1}>
//             <Autocomplete
//               sx={{
//                 maxWidth: 550,
//               }}
//               id="search-autocomplete"
//               options={options}
//               filterOptions={(x) => x}
//               disableClearable
//               freeSolo
//               fullWidth
//               size="small"
//               onInputChange={(event, value) => {
//                 if (event?.type === "change") {
//                   setValue(value);
//                 }
//               }}
//               groupBy={(option) => option.category}
//               renderOption={(props, option: IOptions) => {
//                 return (
//                   <Link href={option.link} underline="none">
//                     <Box
//                       {...props}
//                       component="li"
//                       sx={{
//                         display: "flex",
//                         padding: "10px",
//                         alignItems: "center",
//                         gap: "10px",
//                       }}
//                     >
//                       {option?.avatar && option.avatar}
//                       <Typography
//                         sx={{
//                           fontSize: {
//                             md: "14px",
//                             lg: "16px",
//                           },
//                         }}
//                       >
//                         {option.label}
//                       </Typography>
//                     </Box>
//                   </Link>
//                 );
//               }}
//               renderInput={(params) => {
//                 return (
//                   <Box
//                     position="relative"
//                     sx={{
//                       "& .MuiFormLabel-root": {
//                         paddingRight: "24px",
//                       },
//                       display: {
//                         xs: "none",
//                         sm: "block",
//                       },
//                     }}
//                   >
//                     <TextField
//                       {...params}
//                       label={t("search.placeholder")}
//                       slotProps={{
//                         input: {
//                           ...params.InputProps,
//                         },
//                       }}
//                     />
//                     <IconButton
//                       sx={{
//                         position: "absolute",
//                         right: 0,
//                         top: 0,
//                         "&:hover": {
//                           backgroundColor: "transparent",
//                         },
//                       }}
//                     >
//                       <SearchOutlined />
//                     </IconButton>
//                   </Box>
//                 );
//               }}
//             />
//           </Stack>
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={{
//               xs: "8px",
//               sm: "24px",
//             }}
//           >
//             <Select
//               size="small"
//               disableUnderline
//               defaultValue={currentLocale}
//               slotProps={{
//                 input: {
//                   "aria-label": "Without label",
//                 },
//               }}
//               variant="outlined"
//               sx={{
//                 width: {
//                   xs: "120px",
//                   sm: "160px",
//                 },
//               }}
//             >
//               {[...(i18n.languages ?? [])].sort().map((lang: string) => (
//                 // <MenuItem
//                 //   selected={currentLocale === lang}
//                 //   key={lang}
//                 //   defaultValue={lang}
//                 //   onClick={() => {
//                 //     changeLanguage(lang);
//                 //   }}
//                 //   value={lang}
//                 // >
//                 //   <Typography color="text.secondary">
//                 //     {lang === "en" ? "English" : "German"}
//                 //   </Typography>
//                 // </MenuItem>
//                 <MenuItem
//                   selected={currentLocale === lang}
//                   key={lang}
//                   defaultValue={lang}
//                   onClick={() => {
//                     changeLanguage(lang);
//                   }}
//                   value={lang}
//                 >
//                   <Stack
//                     direction="row"
//                     alignItems="center"
//                     justifyContent="center"
//                   >
//                     <Avatar
//                       sx={{
//                         width: "24px",
//                         height: "24px",
//                         marginRight: "5px",
//                       }}
//                       src={`/images/flags/${lang}.svg`}
//                     />
//                     <Typography color="text.secondary">
//                       {lang === "en" ? "English" : "Vietnamese"}
//                     </Typography>
//                   </Stack>


//                 </MenuItem>
//               ))}
//             </Select>

//             <IconButton
//               onClick={() => {
//                 setMode();
//               }}
//               sx={{
//                 backgroundColor: (theme) =>
//                   theme.palette.mode === "dark" ? "transparent" : "#00000014",
//               }}
//             >
//               {mode === "dark" ? (
//                 <BrightnessHighIcon />
//               ) : (
//                 <Brightness4Icon
//                   sx={{
//                     fill: "#000000DE",
//                   }}
//                 />
//               )}
//             </IconButton>

//             <Stack
//               direction="row"
//               gap={{
//                 xs: "8px",
//                 sm: "16px",
//               }}
//               alignItems="center"
//               justifyContent="center"
//             >
//               <Typography
//                 fontSize={{
//                   xs: "12px",
//                   sm: "14px",
//                 }}
//                 variant="subtitle2"
//               >
//                 {user?.name}
//               </Typography>
//               <Avatar src={user?.avatar} alt={user?.name} />
//             </Stack>
//           </Stack>
//         </Stack>
//       </Toolbar>
//     </AppBar>
//   );
// };