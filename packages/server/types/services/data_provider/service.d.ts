export let name: string;
/**
 * Get a collection from a database.
 * @param {string} db - The database name.
 * @param {string} collection - The collection name.
 * @returns {import('mongoose').Model} The found collection.
 */
export function getCollection(db: string, collection: string): Mongoose.Model<any, any, any>;
/**
 *
 * @param {object} option
 * @param {array} option.list an array of CollectionDefinition instance
 * @param {object} option.mongoOption
 * @param {string} option.mongoOption.dbPrefix
 * @param {string} option.mongoOption.mongoBaseAddress
 */
export function addCollectionDefinitionByList({ list, mongoOption }: {
    list: any[];
    mongoOption: {
        dbPrefix: string;
        mongoBaseAddress: string;
    };
}): Promise<void>;
/**
 * Check access to a collection.
 * @param {string} db - The database name.
 * @param {string} collection - The collection name.
 * @param {string} operationType - The operation type.
 * @param {object} queryOrDoc - The query or document.
 * @param {import('../../class/user')} user - The user.
 * @returns {boolean} The access result.
 */
export function checkAccess(db: string, collection: string, operationType: string, queryOrDoc: object, user: import('../../class/user')): boolean;
export function getAsID(strId: any): Mongoose.Types.ObjectId;
export function performPopulateToQueryObject(queryObj: any, popArr?: any[]): any;
export function performAdditionalOptionsToQueryObject(queryObj: any, options: any): any;
import triggers = require("../../class/trigger_operator");
import TypeCasters = require("./typeCasters");
import Mongoose = require("mongoose");
export { triggers, TypeCasters };
