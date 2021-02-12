const { createRest } = require('.');
const { PermissionTypes } = require('./src/class/security');

{ createRest } require('./src/application');
{PermissionTypes} require('./src/class/security');

createRest({
    uploadDirectory: 'uploads'
});