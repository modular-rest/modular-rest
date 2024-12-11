/**
 * Validator module
 * @module class/validator
 */
let validateObject = require("./class/validator");

/**
 * User manager service
 * @module services/user_manager/service
 */
const userManager = require("./services/user_manager/service");

/**
 * Authentication middleware
 * It checks if incoming request has a valid token in header.authorization
 * Then attaches the user object to ctx.state.user
 *
 * @param {Object} ctx - Koa context
 * @param {Function} next - Koa next function
 * @returns {Promise<void>}
 */
async function auth(ctx, next) {
  let headers = ctx.header;
  let headersValidated = validateObject(headers, "authorization");

  if (!headersValidated.isValid) ctx.throw(401, "authentication is required");

  let token = headers.authorization;

  await userManager.main
    .getUserByToken(token)
    .then(async (user) => {
      ctx.state.user = user;
      await next();
    })
    .catch((err) => {
      console.log(err);
      ctx.throw(err.status || 412, err.message);
    });
}

module.exports = {
  auth,
};
