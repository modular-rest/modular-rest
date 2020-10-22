// Application
const createRest = require('./application');

// Utilities
const paginator = require('./src/class/paginator');
const reply = require('./src/class/reply');
const validator = require('./src/class/validator');

// Base class
const CollectionDefinition = require('./src/class/collection_definition');
const Schemas = require('./src/class/db_schemas');
const DatabaseTrigger = require('./src/class/database_trigger');

module.exports = {
    createRest,

    // Utilities
    paginator, reply, validator,

    // Base class
    CollectionDefinition,
    Schemas,
    DatabaseTrigger,
}

