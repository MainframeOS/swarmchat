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


## Peering flow

### Peering topic

In order to start a conversation stream, two peers must know each other's public key, overlay address and shared topic.
The way peers discover each other's public key is out of the scope of this protocol, but this protocol defines a specific topic all clients should listen to in order to receive contact requests, by calling `pss_stringToTopic` with the node's public key.

### Contact request

Before being able to send chat messages, a peer must accept the user as a contact. To send a request, the user must know the peer's public key, and send the following message in the topic retrieved by calling `pss_stringToTopic` with the peer's public key.
The `overlay_address` provides the peers with the node's overlay address, allowing to set a specific "darkness" to the communications. If not provided, it should default to `0x`.
The `username` can be provided for display purposes, and the `message` can be provided by the user as an introduction.

```json
{
  "protocol": "swarmchat/v1",
  "type": "contact_request",
  "utc_timestamp": 1529686580,
  "payload": {
    "topic": "<topic hex>",
    "overlay_address": "<optional address hex>",
    "username": "<optional display name>",
    "message": "<optional contact message>"
  }
}
```

### Contact response

When receiving a contact response, a node may simply ignore the message, or send a `"contact": false` payload to decline the invitation.
If the user accepts the contact request, the client should start subscribing to the provided `topic` from the contact request, before sending the contact response payload with `"contact": true` and optionally the `username` and node's `address`.

```json
{
  "protocol": "swarmchat/v1",
  "type": "contact_response",
  "utc_timestamp": 1529686580,
  "payload": {
    "contact": Boolean,
    "overlay_address": "<optional address hex>",
    "username": "<optional display name>"
  }
}
```

### Contact information

After nodes have been added as contacts, they can send or receive contact information events in the shared topic they communicate, in order to update their information, such as their `username` or overlay `address`.

```json
{
  "protocol": "swarmchat/v1",
  "type": "contact_info",
  "utc_timestamp": 1529686580,
  "payload": {
    "overlay_address": "<optional address hex>",
    "username": "<optional display name>"
  }
}
```

