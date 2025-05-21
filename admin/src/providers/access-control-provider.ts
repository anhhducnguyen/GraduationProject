import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // admin có toàn quyền
    if (user.role === "ADMIN") {
      return { can: true };
    }

    if (user.role === "TEACHER") {
      if (resource === "users" && action === "list") {
        return { can: true };
      }

      return {
        can: false,
        reason: "Chỉ admin mới được thực hiện hành động này.",
      };
    }

    return {
      can: false,
      reason: "Không có quyền truy cập.",
    };
  },
};
