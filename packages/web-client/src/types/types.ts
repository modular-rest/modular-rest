interface RequestError { hasError: boolean, error: any }

export {
    FindQuery, FindByIdsQuery, UpdateQuery, InsertQuery, AggregateQuery
} from './data-provider';

export {
    Identity, LoginOptions, LoginResponse, ValidateCodeResponse,
} from './auth';

export {
    RequestError
}