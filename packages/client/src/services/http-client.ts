import HttpClient from "../class/http";

import { bus, tokenReceivedEvent } from "../class/event-bus";

const httpClient = new HttpClient();

bus.subscribe(tokenReceivedEvent, (event) => {
  httpClient.setCommonHeader({
    authorization: event.payload.token,
  });
});

export default httpClient;
