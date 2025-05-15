/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('exams_chedules', function(table) {
        table.increments('schedule_id').primary(); 
        table.string('name_schedule').notNullable();       
        table.dateTime('start_time').notNullable();    
        table.dateTime('end_time').notNullable();        
        table.integer('room_id').unsigned().notNullable(); 
        table.integer('invigilator_id').unsigned();
        table.integer('student_id').unsigned();       
        table.integer('created_by').unsigned().notNullable(); 
        table.enu('status', ['scheduled', 'completed', 'cancelled']) 
             .notNullable()
             .defaultTo('scheduled');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('exams_chedules');
};
