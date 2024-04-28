import HttpClient from "../class/http";

import { bus, tokenReceivedEvent } from "../class/event-bus";

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

  run(options: { name: string; args: any }) {
    return this.http.post<ResponseType>("/function/run", options);
  }
}

export default FunctionProvider;
