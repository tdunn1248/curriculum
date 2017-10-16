exports.up = knex => {
  return Promise.all([
    knex.schema.createTable('module_feedback', table => {
      table.string('user_id').unsigned()
      table.string('module_name')
      table.text('feedback_text').notNullable()
    })
  ])
}

exports.down = knex => {
  return knex.schema.dropTable('module_feedback')
}
