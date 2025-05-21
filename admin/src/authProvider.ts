import type { AuthBindings } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";
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
      console.log(user);

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("user", JSON.stringify(user));

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
  // getPermissions: async () => null,
  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const { role } = JSON.parse(user);
      console.log(role);
      return role; // "admin" hoặc "giáo viên"
    }
    return null;
  },

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
  // forgotPassword: async (params) => {
  //   return {
  //     success: true,
  //     redirectTo: "/update-password",
  //     successNotification: {
  //       message: "Email has been sent.",
  //     },
  //   };
  // },
  forgotPassword: async ({ email }) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/reset-password", {
        email,
      });

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
          message: error?.response?.data?.message || "Không thể gửi email khôi phục mật khẩu",
        },
      };
    }
  },
  // updatePassword: async (params) => {
  //   return {
  //     success: true,
  //     redirectTo: "/login",
  //     successNotification: {
  //       message: "Successfully updated password.",
  //     },
  //   };
  // },
  updatePassword: async (params) => {
    try {
      const { token, password, confirmPassword } = params;

      const response = await axios.post("http://localhost:5000/auth/reset-password/confirm", {
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




