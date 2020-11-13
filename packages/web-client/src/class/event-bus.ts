import { EventBus, createEventDefinition } from 'ts-bus';

const bus = new EventBus();
const tokenReceivedEvent = createEventDefinition<{ token: string }>()('token.received')

export {
    bus,
    tokenReceivedEvent,
}