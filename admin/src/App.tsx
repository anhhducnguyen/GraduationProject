import { Authenticated, type I18nProvider, Refine } from "@refinedev/core";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import {
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
import { HiUserGroup } from "react-icons/hi2";
import { IoCalendar } from "react-icons/io5";
import { MdDashboardCustomize } from "react-icons/md";
import { BsBox2Fill } from "react-icons/bs";
import { GiArtificialIntelligence } from "react-icons/gi";

import {
  UserList,
  UserShow,
  UserEdit,
  UserCreate,
  AddStudentToExamSchedule,
} from "@/pages/users";

import {
  ExamRoomList,
  RoomShow,
  RoomCreate,
  RoomEdit,
} from "@/pages/rooms";

import {
  ExamScheduleList,
  ExamScheduleCreate,
  ExamScheduleEdit,
  ExamScheduleShow,
} from "@/pages/exam-schedules";

import { FaList } from "react-icons/fa";
import { FakeFacesList } from "@/pages/fake-faces";
import SchedulePage from "@/pages/schedules/list";
import Home from "@/pages/home/home";
import { CustomTitle } from "@/components/CustomTitle";
import { AuthPage } from "@/pages/auth/index";

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
            // dataProvider={dataProvider("http://localhost:5000/api/v1")}
            dataProvider={dataProvider("https://graduationproject-nx7m.onrender.com/api/v1")}
            notificationProvider={useNotificationProvider}
            routerProvider={routerProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            resources={[
              // {
              //   name: "home",
              //   list: "/home",
              //   meta: { 
              //     icon: <MdDashboardCustomize />,
              //   },
              // },
              {
                name: "users",
                list: "/users",
                show: "/users/:id",
                edit: "/users/:id/edit",
                create: "/users/new",
                meta: { 
                  icon: <HiUserGroup />, 
                },
              },
              {
                name: "schedules",
                list: "/schedules",
                meta: { 
                  icon: <IoCalendar />, 
                },
              },
              {
                name: "fake-faces",
                list: "/fake-faces",
                meta: { 
                  icon: <GiArtificialIntelligence />, 
                },
              },
              {
                name: "exam-rooms",
                list: "/exam-rooms",
                create: "/exam-rooms/new",
                edit: "/exam-rooms/:id/edit",
                show: "/exam-rooms/:id",
                meta: { 
                  icon: <BsBox2Fill />, 
                },
              },
              {
                name: "exam-schedules",
                list: "/exam-schedules",
                create: "/exam-schedules/new",
                edit: "/exam-schedules/:id/edit",
                show: "/exam-schedules/:id",
                meta: { 
                  icon: <FaList />, 
                },
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
                    <ThemedLayoutV2 
                    Header={() => <Header sticky />}
                    Title={CustomTitle}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="schedules" />} />
                <Route path="/schedules" element={<SchedulePage />} />
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path=":id" element={<UserShow />} />
                  <Route path="new" element={<UserCreate />} />
                  <Route path=":id/edit" element={<UserEdit/>} />
                  {/* <Route path="add" element={<AddStudentToExamSchedule />} /> */}
                </Route>

                <Route path="add" element={<AddStudentToExamSchedule />} />
                <Route path="/schedules" element={<SchedulePage />} />

                <Route path="/exam-rooms">
                  <Route index element={<ExamRoomList />} />
                  <Route path=":id" element={<RoomShow />} />
                  <Route path="new" element={<RoomCreate />} />
                  <Route path=":id/edit" element={<RoomEdit />} />
                </Route>

                <Route path="/fake-faces" element={<FakeFacesList />} />

                <Route path="/exam-schedules">
                  <Route index element={<ExamScheduleList />} />
                  <Route path="new" element={<ExamScheduleCreate />} />
                  <Route path=":id" element={<ExamScheduleShow />} />
                  <Route path=":id/edit" element={<ExamScheduleEdit />} />
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


