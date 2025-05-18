import type { AuthBindings } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

// export const authProvider: AuthBindings = {
//   login: async ({ username, email, password }) => {
//     if ((username || email) && password) {
//       localStorage.setItem(TOKEN_KEY, username);
//       return {
//         success: true,
//         redirectTo: "/",
//       };
//     }

//     return {
//       success: false,
//       error: {
//         name: "LoginError",
//         message: "Invalid username or password",
//       },
//     };
//   },
//   logout: async () => {
//     localStorage.removeItem(TOKEN_KEY);
//     return {
//       success: true,
//       redirectTo: "/login",
//     };
//   },
//   check: async () => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) {
//       return {
//         authenticated: true,
//       };
//     }

//     return {
//       authenticated: false,
//       redirectTo: "/login",
//     };
//   },
//   getPermissions: async () => null,
//   getIdentity: async () => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) {
//       return {
//         id: 1,
//         name: "John Doe",
//         avatar: "https://i.pravatar.cc/300",
//       };
//     }
//     return null;
//   },
//   onError: async (error) => {
//     console.error(error);
//     return { error };
//   },
//   forgotPassword: async (params) => {
//     return {
//       success: true,
//       redirectTo: "/update-password",
//       successNotification: {
//         message: "Email has been sent.",
//       },
//     };
//   },
//   updatePassword: async (params) => {
//     return {
//       success: true,
//       redirectTo: "/login",
//       successNotification: {
//         message: "Successfully updated password.",
//       },
//     };
//   },
// };

import axios from 'axios'; // Nếu bạn chưa cài axios, hãy cài qua npm: npm install axios

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      // Gửi yêu cầu đăng nhập đến API
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // Lưu token vào localStorage nếu đăng nhập thành công
      const { token, user } = response.data;
      console.log(token);
      
      localStorage.setItem(TOKEN_KEY, token);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      // Nếu có lỗi trong quá trình đăng nhập, trả về lỗi
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      };
    }
  },

  // Các phương thức khác không thay đổi
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  forgotPassword: async (params) => {
    return {
      success: true,
      redirectTo: "/update-password",
      successNotification: {
        message: "Email has been sent.",
      },
    };
  },
  updatePassword: async (params) => {
    return {
      success: true,
      redirectTo: "/login",
      successNotification: {
        message: "Successfully updated password.",
      },
    };
  },
};

// import axios from 'axios'; // Nếu bạn chưa cài axios, hãy cài qua npm: npm install axios

// // const TOKEN_KEY = 'refine-auth';

// export const authProvider: AuthBindings = {
//   login: async ({ email, password }) => {
//     try {
//       // Gửi yêu cầu đăng nhập đến API
//       const response = await axios.post("http://localhost:5000/auth/login", {
//         email,
//         password,
//       });

//       // Lưu token vào localStorage nếu đăng nhập thành công
//       const { token, user } = response.data;
//       localStorage.setItem(TOKEN_KEY, token);

//       return {
//         success: true,
//         redirectTo: "/",
//       };
//     } catch (error) {
//       // Nếu có lỗi trong quá trình đăng nhập, trả về lỗi
//       return {
//         success: false,
//         error: {
//           name: "LoginError",
//           message: "Invalid email or password",
//         },
//       };
//     }
//   },

//   logout: async () => {
//     localStorage.removeItem(TOKEN_KEY);
//     return {
//       success: true,
//       redirectTo: "/login",
//     };
//   },

//   check: async () => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) {
//       try {
//         // Kiểm tra token với API nếu cần
//         const response = await axios.get("http://localhost:5000/auth/check", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.data.authenticated) {
//           return { authenticated: true };
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     }

//     return {
//       authenticated: false,
//       redirectTo: "/login",
//     };
//   },

//   getPermissions: async () => {
//     // Ví dụ, nếu không cần phân quyền đặc biệt, trả về null hoặc quyền mặc định
//     return null;
//   },

//   getIdentity: async () => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) {
//       try {
//         // Lấy thông tin người dùng từ API
//         const response = await axios.get("http://localhost:5000/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const { user } = response.data;
//         return {
//           id: user.id,
//           name: user.username,
//           avatar: user.avatar || "https://i.pravatar.cc/300", // Thêm avatar mặc định nếu không có
//         };
//       } catch (error) {
//         console.error(error);
//         return null;
//       }
//     }
//     return null;
//   },

//   onError: async (error) => {
//     console.error(error);
//     return { error };
//   },

//   forgotPassword: async ({ email }) => {
//     try {
//       // Gửi yêu cầu quên mật khẩu đến API
//       const response = await axios.post("http://localhost:5000/auth/reset-password", { email });

//       return {
//         success: true,
//         redirectTo: "/update-password",
//         successNotification: {
//           message: "Email has been sent.",
//         },
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: {
//           name: "ForgotPasswordError",
//           message: "Error sending reset password email.",
//         },
//       };
//     }
//   },

//   updatePassword: async ({ token, password }) => {
//     try {
//       // Gửi yêu cầu cập nhật mật khẩu mới
//       const response = await axios.post("http://localhost:5000/auth/reset-password/confirm", {
//         token,
//         password,
//       });

//       return {
//         success: true,
//         redirectTo: "/login",
//         successNotification: {
//           message: "Successfully updated password.",
//         },
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: {
//           name: "UpdatePasswordError",
//           message: "Error updating password.",
//         },
//       };
//     }
//   },
// };

