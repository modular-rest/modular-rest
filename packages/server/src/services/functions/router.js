const Router = require("koa-router");
const service = require("./service");
const middleware = require("../../middlewares");
const validateObject = require("../../class/validator");
const reply = require("../../class/reply").create;

const functionRouter = new Router();
const name = "function";

functionRouter.use("/", middleware.auth, async (ctx, next) => {
  const body = ctx.request.body;
  const bodyValidated = validateObject(body, "name args");

  // fields validation
  if (!bodyValidated.isValid) {
    ctx.throw(
      412,
      JSON.stringify(reply("e", { error: bodyValidated.requires }))
    );
  }

  await next();
});

functionRouter.post(`/run`, middleware.auth, async (ctx) => {
  const { name, args } = ctx.request.body;

  try {
    const result = await service.runFunction(name, args, ctx.state.user);
    ctx.body = JSON.stringify(reply("s", { data: result }));
  } catch (e) {
    ctx.throw(400, JSON.stringify(reply("e", { error: e.message })));
  }
});

module.exports.name = name;
module.exports.main = functionRouter;
