import type { AuthBindings } from "@refinedev/core";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const TOKEN_KEY = "refine-auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Sai email hoặc mật khẩu. Vui lòng thử lại.",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    try {
      const decoded: { exp: number } = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");

        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
          error: {
            message: "Phiên đăng nhập đã hết hạn",
            name: "TokenExpiredError",
          },
        };
      }

      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
        error: {
          message: "Token không hợp lệ",
          name: "InvalidTokenError",
        },
      };
    }
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const { role } = JSON.parse(user);
      return role; // Ví dụ: "admin", "teacher"
    }
    return null;
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const { id, username } = JSON.parse(user);
      return {
        id,
        name: username,
        // avatar: "https://i.pravatar.cc/300", // tuỳ ý
      };
    }
    return null;
  },

  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },

  forgotPassword: async ({ email }) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });

      return {
        success: true,
        successNotification: {
          message: "Email đã được gửi. Vui lòng kiểm tra hộp thư.",
        },
      };
    } catch (error: any) {
      console.error("Lỗi gửi yêu cầu đặt lại mật khẩu:", error);

      return {
        success: false,
        error: {
          name: "ForgotPasswordError",
          message:
            error?.response?.data?.message ||
            "Không thể gửi email khôi phục mật khẩu",
        },
      };
    }
  },

  updatePassword: async ({ token, password, confirmPassword }) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password/confirm`, {
        token,
        password,
        confirmPassword,
      });

      return {
        success: true,
        redirectTo: "/login",
        successNotification: {
          message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
        },
      };
    } catch (error: any) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);

      return {
        success: false,
        error: {
          name: "ResetPasswordError",
          message:
            error?.response?.data?.message ||
            "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
        },
      };
    }
  },
};

// import type { AuthBindings } from "@refinedev/core";
// import { jwtDecode } from "jwt-decode";

// export const TOKEN_KEY = "refine-auth";
// import axios from 'axios';


// export const authProvider: AuthBindings = {
//   login: async ({ email, password }) => {
//     try {
//       const response = await axios.post("http://localhost:5000/auth/login", {
//         email,
//         password,
//       });

//       // Lưu token vào localStorage nếu đăng nhập thành công
//       const { token, user } = response.data;

//       localStorage.setItem(TOKEN_KEY, token);
//       localStorage.setItem("user", JSON.stringify(user));

//       return {
//         success: true,
//         redirectTo: "/",
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: {
//           name: "LoginError",
//           message: "Sai email hoặc mật khẩu. Vui lòng thử lại.",
//         },
//       };
//     }
//   },

//   // Các phương thức khác không thay đổi
//   logout: async () => {
//     localStorage.removeItem(TOKEN_KEY);
//     return {
//       success: true,
//       redirectTo: "/login",
//     };
//   },
//   check: async () => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (!token) {
//     return {
//       authenticated: false,
//       logout: true,
//       redirectTo: "/login",
//     };
//   }

//   try {
//     const decoded: { exp: number } = jwtDecode(token);

//     // Kiểm tra thời gian hết hạn (exp là Unix timestamp tính bằng giây)
//     const isExpired = decoded.exp * 1000 < Date.now();

//     if (isExpired) {
//       localStorage.removeItem(TOKEN_KEY);
//       localStorage.removeItem("user");

//       return {
//         authenticated: false,
//         logout: true,
//         redirectTo: "/login",
//         error: {
//           message: "Phiên đăng nhập đã hết hạn",
//           name: "TokenExpiredError",
//         },
//       };
//     }

//     return {
//       authenticated: true,
//     };
//   } catch (error) {
//     return {
//       authenticated: false,
//       logout: true,
//       redirectTo: "/login",
//       error: {
//         message: "Token không hợp lệ",
//         name: "InvalidTokenError",
//       },
//     };
//   }
// },
//   // getPermissions: async () => null,
//   getPermissions: async () => {
//     const user = localStorage.getItem("user");
//     if (user) {
//       const { role } = JSON.parse(user);
//       console.log(role);
//       return role; // "admin" hoặc "giáo viên"
//     }
//     return null;
//   },

//   getIdentity: async () => {
//     const user = localStorage.getItem("user");
//     if (user) {
//       const { id, username } = JSON.parse(user);
//       return {
//         id: id,
//         name: username, // hoặc dùng email nếu bạn thích
//         // avatar: "https://i.pravatar.cc/300", // hoặc để trống nếu chưa có avatar
//       };
//     }
//     return null;
//   },
//   onError: async (error) => {
//     if (error.response?.status === 401) {
//       return {
//         logout: true,
//       };
//     }

//     return { error };
//   },
//   forgotPassword: async ({ email }) => {
//     try {
//       const response = await axios.post("http://localhost:5000/auth/reset-password", {
//         email,
//       });

//       return {
//         success: true,
//         successNotification: {
//           message: "Email đã được gửi. Vui lòng kiểm tra hộp thư.",
//         },
//       };
//     } catch (error: any) {
//       console.error("Lỗi gửi yêu cầu đặt lại mật khẩu:", error);

//       return {
//         success: false,
//         error: {
//           name: "ForgotPasswordError",
//           message: error?.response?.data?.message || "Không thể gửi email khôi phục mật khẩu",
//         },
//       };
//     }
//   },
//   updatePassword: async (params) => {
//     try {
//       const { token, password, confirmPassword } = params;

//       const response = await axios.post("http://localhost:5000/auth/reset-password/confirm", {
//         token,
//         password,
//         confirmPassword,
//       });

//       return {
//         success: true,
//         redirectTo: "/login",
//         successNotification: {
//           message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
//         },
//       };
//     } catch (error: any) {
//       console.error("Lỗi khi đặt lại mật khẩu:", error);

//       return {
//         success: false,
//         error: {
//           name: "ResetPasswordError",
//           message:
//             error?.response?.data?.message ||
//             "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
//         },
//       };
//     }
//   },

// };




