/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("exam_attendance", function (table) {
    table.increments("attendance_id").primary();
    table.integer("schedule_id").notNullable();
    table.integer("student_id").notNullable();
    table.boolean("is_present").notNullable().defaultTo(false);
    table.integer("violation_id");
    table.integer("reported_by").notNullable();
    table.timestamps(true, true); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("exam_attendance");
};
