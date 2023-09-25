import HttpClient from "../class/http";

import { bus, tokenReceivedEvent } from "../class/event-bus";

import {
  FindQuery,
  FindByIdsQuery,
  UpdateQuery,
  InsertQuery,
  AggregateQuery,
  Response,
} from "../types/data-provider";
import { createPagination } from "../helper/list";

class DataProvider {
  private static instance: DataProvider;
  private http: HttpClient;

  private constructor() {
    this.http = new HttpClient();

    bus.subscribe(tokenReceivedEvent, (event) => {
      this.http.setCommonHeader({
        authorization: event.payload.token,
      });
    });
  }

  static getInstance() {
    if (DataProvider.instance) return DataProvider.instance;

    DataProvider.instance = new DataProvider();
    return DataProvider.instance;
  }

  find<T>(options: FindQuery) {
    return this.http
      .post<Response>("/data-provider/find", options)
      .then((body) => body.data as Array<T>);
  }

  /**
   * Returns an object containing pagination information and controller methods.
   *
   * @param findOption - The query options to find data.
   * @param paginationOption - The pagination options to limit and paginate data.
   * @returns Pagination information, `getPage` for fetching data for a specific page, and `updatePagination` for updating the pagination object.
   */
  async list<T>(
    findOption: FindQuery,
    paginationOption: { limit: number; page: number }
  ) {
    const count = await this.count(findOption);
    const pagination = createPagination(
      count,
      paginationOption.limit,
      paginationOption.page || 0
    );

    const _this = this;

    return {
      /**
       * The pagination information object.
       */
      pagination,

      /**
       * Updates the pagination object with fresh "pages" value.
       * @returns A new pagination object.
       */
      updatePagination() {
        return _this.list<T>(findOption, paginationOption);
      },

      /**
       * Returns the data for the specified page.
       * @param page - The page number to retrieve.
       * @returns The data for the specified page.
       */
      getPage(page: number) {
        return _this
          .find<T>({
            ...findOption,
            options: {
              ...findOption.options,
              limit: paginationOption.limit,
              skip: this.pagination.from,
            },
          })
          .then((data) => {
            const np = createPagination(count, paginationOption.limit, page);

            this.pagination.from = np.from;
            this.pagination.to = np.to;
            this.pagination.page = np.page;
            this.pagination.pages = np.pages;

            return data;
          });
      },
    };
  }

  findOne<T>(options: FindQuery) {
    return this.http
      .post<Response>("/data-provider/find-one", options)
      .then((body) => body.data as T);
  }

  count(options: FindQuery) {
    return this.http
      .post<Response>("/data-provider/count", options)
      .then((body) => body.data as number);
  }

  updateOne(options: UpdateQuery) {
    return this.http
      .post<Response>("/data-provider/update-one", options)
      .then((body) => body.data);
  }

  insertOne(options: InsertQuery) {
    return this.http
      .post<Response>("/data-provider/insert-one", options)
      .then((body) => body.data);
  }

  removeOne(options: FindQuery) {
    return this.http
      .post<Response>("/data-provider/remove-one", options)
      .then((body) => body.data);
  }

  aggregate<T>(options: AggregateQuery) {
    return this.http
      .post<Response>("/data-provider/aggregate", options)
      .then((body) => body.data as Array<T>);
  }

  findByIds<T>(options: FindByIdsQuery) {
    return this.http
      .post<Response>("/data-provider/findByIds", options)
      .then((body) => body.data as Array<T>);
  }
}

export default DataProvider;
