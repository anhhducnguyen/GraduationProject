// https://github.com/DuowngM/shopee/blob/main/server/src/categories/dto/categories.dto.ts
// https://github.com/typicode/json-server?tab=readme-ov-file
// https://refine.dev/docs/ui-integrations/material-ui/hooks/use-data-grid/#dataprovidername
// https://refine.dev/tutorial/authentication/data-provider-integration/?utm_source=chatgpt.com

import { Authenticated, type I18nProvider, Refine } from "@refinedev/core";
// import dataProvider from "@refinedev/simple-rest";

import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import {
  AuthPage,
  ErrorComponent,
  RefineSnackbarProvider,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/mui";

import { useTranslation } from "react-i18next";

import { authProvider } from "./authProvider";
import { dataProvider } from "./providers/data-provider";


import { Header } from "./components/header";
import { ColorModeContextProvider } from "./context/color-mode";

import {
  UserList,
  UserShow,
  UserCreate,
} from "@/pages/users";

import {
  ExamRoomList,
  RoomShow,
  RoomCreate,
} from "@/pages/rooms";

import {
  ExamScheduleList,
  // ExamScheduleCreate,
} from "@/pages/exam-schedules";

import { ExamAttendanceList } from "./pages/exam-attendance";

// import {
//   ProductCreate,
//   ProductEdit,
//   ProductList,
//   ProductShow,
// } from "@/pages/products";


import SchedulePage from "@/pages/schedules/list";
import Home from "@/pages/home/home";



function App() {
  const { t, i18n } = useTranslation();
  const i18nProvider: I18nProvider = {
    translate: (key, params) => t(key, params).toString(),
    changeLocale: async (lang) => {
      await i18n.changeLanguage(lang);
    },
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
          <Refine
            // accessControlProvider={accessControlProvider}
            // dataProvider={dataProvider}
            // dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            dataProvider={dataProvider("http://localhost:5000/api/v1")}
            // dataProvider={dataProvider("/api/v1")}
            notificationProvider={useNotificationProvider}
            routerProvider={routerProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            resources={[
              // {
              //   name: "products",
              //   list: "/products",
              //   create: "/products/new",
              //   edit: "/products/:id/edit",
              //   show: "/products/:id",
              // },
              {
                name: "home",
                list: "/home", // thêm dòng này để Refine biết về resource "home"
              },
              {
                name: "users",
                list: "/users",
                show: "/users/:id",
                create: "/users/new",
                // create: "/users",
              },
              {
                name: "schedules",
                list: "/schedules",
                // ...
              },
              {
                name: "exam-rooms",
                list: "/exam-rooms",
                create: "/exam-rooms/new",
                // edit: "/exam-rooms/:id/edit",
                show: "/exam-rooms/:id",
              },
              {
                name: "exam-schedules",
                list: "/exam-schedules",
                create: "/exam-schedules/new",
              },
              {
                name: "exam-attendance",
                list: "/exam-attendance",
                // create: "/exam-attendance/new",
                // edit: "/exam-attendance/:id/edit",
                // show: "/exam-attendance/:id",
              },
            ]}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2 Header={() => <Header sticky />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="home" />} />
                {/* <Route
                  index
                  element={<NavigateToResource resource="products" />}
                /> */}
                {/* <Route path="/products">
                  <Route index element={<ProductList />} />
                  <Route path="new" element={<ProductCreate />} />
                  <Route path=":id" element={<ProductShow />} />
                  <Route path=":id/edit" element={<ProductEdit />} />
                </Route> */}
                <Route path="/home" element={<Home />} />
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path=":id" element={<UserShow />} />
                  <Route path="new" element={<UserCreate />} />
                </Route>

                <Route path="/schedules" element={<SchedulePage />} />
                <Route path="/exam-rooms">
                  <Route index element={<ExamRoomList />} />
                  <Route path=":id" element={<RoomShow />} />
                  <Route path="new" element={<RoomCreate />} />
                </Route>

                <Route path="/exam-schedules">
                  <Route index element={<ExamScheduleList />} />
                  {/* <Route path=":id" element={<ExamScheduleShow />} /> */}
                  {/* <Route path=":id/edit" element={<ExamScheduleEdit />} /> */}
                </Route>

                <Route path="/exam-attendance">
                  <Route index element={<ExamAttendanceList />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated
                    key="authenticated-outer"
                    fallback={<Outlet />}
                  >
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      formProps={{
                        defaultValues: {
                          email: "anhnguyen2k373@gmail.com",
                          password: "Anh12@#",
                        },
                      }}
                    />
                  }
                />
                <Route
                  path="/register"
                  element={<AuthPage type="register" />}
                />
                <Route
                  path="/forgot-password"
                  element={<AuthPage type="forgotPassword" />}
                />
                <Route
                  path="/update-password"
                  element={<AuthPage type="updatePassword" />}
                />
              </Route>
            </Routes>
          </Refine>
        </RefineSnackbarProvider>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;


