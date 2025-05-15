/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("auth", function (table) {
        table.increments("id").primary();
        // table.integer("user_id").notNullable();
        table.string("email").unique();
        table.string("password").defaultTo("GOOGLE_SSO");
        table.string("username");
        table.string("reset_token");
        table.bigInteger("reset_token_expiry");
        table.enu("role", ["student", "teacher", "admin"]).notNullable().defaultTo("student");
        table.string("google_id").unique();
        table.timestamps(true, true); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("auth");
};
