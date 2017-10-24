const util = require('util')
const knex = require('./knex')

const logSkillCheck = ({userId, skillId, checked, referrer}) =>
  knex
    .insert({
      occurred_at: knex.fn.now(),
      type: 'skill_check',
      user_id: userId,
      metadata: {
        skill_d: skillId,
        checked,
        referrer,
      }
    })
    .into('event_logs')

const checkSkill = (userId, skillId, referrer) =>
  Promise.all([
    logSkillCheck({userId, skillId, referrer, checked: true}),
    knex('skill_checks')
      .insert({
        user_id: userId,
        skill_id: skillId,
        updated_at: knex.fn.now()
      })
  ])

const uncheckSkill = (userId, skillId, referrer) =>
  Promise.all([
    logSkillCheck({userId, skillId, referrer, checked: false}),
    knex('skill_checks')
      .where({
        user_id: userId,
        skill_id: skillId,
      })
      .del()
  ])



const addModuleFeedback = (user_id, user_handle, module_name, feedback_text) =>
  knex
    .insert({ user_id, user_handle, module_name, feedback_text })
    .into('module_feedback')

const deleteModuleFeedback = reviewId =>
  knex('module_feedback')
    .where('id', reviewId)
    .del()

const getReviewById = reviewId =>
  knex('module_feedback')
    .select('*')
    .where('id', reviewId)

module.exports = {
  checkSkill,
  uncheckSkill,
  setSkillCheck,
  addModuleFeedback,
  deleteModuleFeedback,
  getReviewById
}
