import HttpClient from '../class/http';
import BaseResponse from '../types/base-response';
import GlobalOptions from '../class/global_options';
import { bus, tokenReceivedEvent } from '../class/event-bus'

interface BaseRequest {
    database: string,
    collection: string
}

interface FindQuery extends BaseRequest {
    query: object
}

interface FindByIdaQuery extends BaseRequest {
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

class DataProvider {

    private static instance: DataProvider;
    private http: HttpClient;

    private constructor() {

        this.http = new HttpClient({
            baseUrl: GlobalOptions.host
        });

        bus.subscribe(tokenReceivedEvent, (event) => {
            this.http.setCommonHeader({
                'authorization': event.payload.token
            })
        })
    };

    static getInstance() {

        if (DataProvider.instance)
            return DataProvider.instance;

        DataProvider.instance = new DataProvider();
        return DataProvider.instance;
    }

    find(options: FindQuery) {
        return this.http.post<Response>('/data-provider/find', options)
            .then(body => body.data as Array<object>)
    }

    findOne(options: FindQuery) {
        return this.http.post<Response>('/data-provider/find-one', options)
            .then(body => body.data as object)
    }

    count(options: FindQuery) {
        return this.http.post<Response>('/data-provider/find-one', options)
            .then(body => body.data as number)
    }

    updateOne(options: UpdateQuery) {
        return this.http.post<Response>('/data-provider/update-one', options)
            .then(body => body.data as object)
    }

    insertOne(options: InsertQuery) {
        return this.http.post<Response>('/data-provider/insert-one', options)
            .then(body => body.data as object)
    }

    removeOne(options: FindQuery) {
        return this.http.post<Response>('/data-provider/remove-one', options)
            .then(body => body.data as object)
    }

    aggregate(options: AggregateQuery) {
        return this.http.post<Response>('/data-provider/aggregate', options)
            .then(body => body.data as Array<object>)
    }

    findByIds(options: FindByIdaQuery) {
        return this.http.post<Response>('/data-provider/findByIds', options)
            .then(body => body.data as Array<object>)
    }
}

export default DataProvider;