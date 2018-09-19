const koa = require('koa');
var router = require('koa-router');
var path = require('path');
var combination = require('./combination');

module.exports = (option={}) => 
{
    var app = new koa();

    var root = (option.root) ? option.root : null;
    var onInit = (option.onInit) ? option.onInit : null;

    // var options = {
    //     'root': path.join( __dirname, 'routes'),
    // }

    if(root) combination.combinRoutes(options.root, app);
    if(onInit) onInit(app);

    app.listen(3000);
}