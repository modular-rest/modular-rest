interface RequestError { hasError: boolean, error: any }

interface FileDocument {
    _id: string,
    originalName: String,
    fileName: String,
    owner: String,
}

export {
    FileDocument
}

export {
    FindQuery, FindByIdsQuery, UpdateQuery, InsertQuery, AggregateQuery
} from './data-provider';

export {
    Identity, LoginOptions, LoginResponse, ValidateCodeResponse,
} from './auth';

export {
    RequestError
}