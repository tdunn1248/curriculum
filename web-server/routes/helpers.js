const commands = require('../../database/commands')

module.exports = {
  createUserReviews : (moduleFeedback, request) => {
    moduleFeedback.allReviews.forEach(review => {

      for (let i = 0; i < moduleFeedback.allUsers.length; i++) {
        if (moduleFeedback.allUsers[i].handle == review.user_handle) {
          let isAuthorizedToDelete = false
          if(review.user_id === request.user.id ||  request.user.isAdmin) {
            isAuthorizedToDelete = true
          }
          const datePosted = {
            time: review.occurred_at.toLocaleTimeString(),
            month: review.occurred_at.toLocaleDateString()
          }
          const user = {
            reviewId: review.id,
            handle: review.user_handle,
            avatar: moduleFeedback.allUsers[i].avatarUrl,
            content: review.feedback_text,
            datePosted,
            isAuthorizedToDelete
          }
          if (review.is_hidden !== true) {
            moduleFeedback.userReviews.push(user)
          }
        }
      }
    })
    return moduleFeedback.userReviews
  },
  authorizeDelete: (request, response, next) => {
    if (request.user.isAdmin) {
      throw new Error('User not authorized')
    } else {
      return commands.getReviewById(request.path.slice(41))
        .then(review => {
          if (review[0].user_id === request.user.id) {
            next()
          } else {
            throw new Error('User not authorized')
          }
        })
    }
  },
  getModuleFeedBack: (moduleName) => {
    return queries.getAllModuleFeedback(moduleName)
  }
}
