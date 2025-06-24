const ROLES = require("../../src/constants/role");
const {
    authorize
} = require("../../src/utils/auth/index");

const permission = authorize([
    ROLES.ADMIN, 
    ROLES.TEACHER, 
]);

module.exports = permission;