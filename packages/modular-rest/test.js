const { createRest } = require('.');

{ createRest } require('./application');

createRest().then(app => {
    // app.use((ctx, next) => {
    //     ctx.response.body = 'dsdfgsdfg'
    // })
});