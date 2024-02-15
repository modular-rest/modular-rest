import HttpClient from "../class/http";

import { bus, tokenReceivedEvent } from "../class/event-bus";

import {
  FindQueryType,
  FindByIdsQueryType,
  UpdateQueryType,
  InsertQueryType,
  AggregateQueryType,
  ResponseType,
  PaginatedResponseType,
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

  find<T>(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/find", options)
      .then((body) => body.data as Array<T>);
  }

  /**
   * Returns an object containing pagination information and controller methods.
   *
   * @param findOption - The query options to find data.
   * @param paginationOption - The pagination options to limit and paginate data.
   * @returns Pagination information, `getPage` for fetching data for a specific page, and `updatePagination` for updating the pagination object.
   */
  list<T>(
    findOption: FindQueryType,
    paginationOption: {
      limit: number;
      page: number;
      onFetched?: (docs: T[]) => void;
    }
  ): PaginatedResponseType<T> {
    let count = 0;
    const pagination = createPagination(
      0,
      paginationOption.limit,
      paginationOption.page || 0
    );

    const _this = this;

    async function calculatePages() {
      count = await _this.count(findOption);
      const { from, to, page, pages, total } = createPagination(
        count,
        paginationOption.limit,
        paginationOption.page || 0
      );

      pagination.from = from;
      pagination.to = to;
      pagination.page = page;
      pagination.pages = pages;
      pagination.total = total;
    }

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
        return calculatePages();
      },

      /**
       * Returns the data for the specified page.
       * @param page - The page number to retrieve.
       * @returns The data for the specified page.
       */
      fetchPage(page: number) {
        // return if page is out of range
        if (page < 1 || page > pagination.pages) {
          return Promise.resolve([]);
        }

        // Calculate the "from" value for the next page.
        this.pagination.from = (page - 1) * paginationOption.limit;

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

            if (paginationOption.onFetched) {
              paginationOption.onFetched(data);
            }

            return data;
          });
      },
    };
  }

  findOne<T>(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/find-one", options)
      .then((body) => body.data as T);
  }

  count(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/count", options)
      .then((body) => body.data as number);
  }

  updateOne(options: UpdateQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/update-one", options)
      .then((body) => body.data);
  }

  insertOne(options: InsertQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/insert-one", options)
      .then((body) => body.data);
  }

  removeOne(options: FindQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/remove-one", options)
      .then((body) => body.data);
  }

  aggregate<T>(options: AggregateQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/aggregate", options)
      .then((body) => body.data as Array<T>);
  }

  findByIds<T>(options: FindByIdsQueryType) {
    return this.http
      .post<ResponseType>("/data-provider/findByIds", options)
      .then((body) => body.data as Array<T>);
  }
}

export default DataProvider;
