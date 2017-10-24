exports.up = knex => {
  return Promise.all([
    knex.schema.createTable('module_feedback', table => {
      table.increments('id').primary()
      table.string('user_id').unsigned()
      table.string('user_handle')
      table.string('module_name')
      table.text('feedback_text')
      table.boolean('is_hidden').defaultTo(false)
      table.timestamp('occurred_at').defaultTo(knex.fn.now())
    })
  ])
}

exports.down = knex => {
  return knex.schema.dropTable('module_feedback')
}
