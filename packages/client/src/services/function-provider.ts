import HttpClient from "../class/http";
import { BaseResponseType } from "../types/base-response.type";
import { bus, tokenReceivedEvent } from "../class/event-bus";
import { FunctionResponseType } from "../types/function-provider.type";

class FunctionProvider {
  private static instance: FunctionProvider;
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
    if (FunctionProvider.instance) return FunctionProvider.instance;

    FunctionProvider.instance = new FunctionProvider();
    return FunctionProvider.instance;
  }

  run<T>(options: { name: string; args: any }) {
    return this.http
      .post<FunctionResponseType<T>>("/function/run", options)
      .then((response) => response.data)
      .catch((error) => {
        // When there's an HTTP error, the error object contains the server response
        if (error.hasError && error.error) {
          // Re-throw the actual server response
          throw error.error;
        }
        // For any other errors, re-throw as is
        throw error;
      });
  }
}

export default FunctionProvider;
