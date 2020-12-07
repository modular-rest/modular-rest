import BaseResponse from './base-response';

interface BaseRequest {
    database: string,
    collection: string
}

interface FindQuery extends BaseRequest {
    query: object,
    populates: [string | { path: string, select: string }],
    options: {
        skip: number,
        limit: number,
        sort: string | object,
        select: string | object | [string]
    }
}

interface FindByIdsQuery extends BaseRequest {
    ids: string[]
}

interface UpdateQuery extends BaseRequest {
    query: object,
    update: object
}

interface InsertQuery extends BaseRequest {
    doc: object
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