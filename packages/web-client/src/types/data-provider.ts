import BaseResponse from './base-response';

interface BaseRequest {
    database: string,
    collection: string
}

interface FindQuery extends BaseRequest {
    query: object
}

interface FindByIdsQuery extends BaseRequest {
    ids: string[]
}

interface UpdateQuery extends BaseRequest {
    query: object,
    update: object
}

interface InsertQuery extends BaseRequest {
    document: object
}

interface AggregateQuery extends BaseRequest {
    pipelines: object[]
}

interface Response extends BaseResponse {
    data: any
}

export {
    FindQuery, 
    FindByIdsQuery, 
    UpdateQuery, 
    InsertQuery, 
    AggregateQuery, 
    Response
}