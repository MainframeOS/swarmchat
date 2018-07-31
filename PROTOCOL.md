# SwarmChat protocol

## Event Metadata 

All events are wrapped in a JSON object envelope with the following fields:

```json
{
  "protocol": "<protocol name>/<version>",
  "type": "<string handled by protocol>",
  "extensions": "<Optional array of strings>",
  "utc_timestamp": <number>,
  "payload": <JSON Object>
}
```

## Message Event

Default message events contain a simple string. Clients are expected to render the raw string, without any markup or styling.

```json
{
  "protocol": "swarmchat/v1",
  "type": "chat_message",
  "utc_timestamp": 1529686580,
  "payload": {
    "message": "<message string>"
  }
}
```

Clients may support `event type extensions`, such as `html` in the following example. 

### Event Type Extension 

```json
{
  "protocol": "swarmchat/v1",
  "type": "chat_message",
  "extensions": ["html"]
  "utc_timestamp": 1529686580,
  "payload": {
    "message": "<fallback message string>",
    "html": "<HTML message>"
  }
}
```

A client that does not recognise an extension should fallback to the base extension behaviour, in this case only displaying the `message` contents.



