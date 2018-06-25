# SwarmChat protocol

## Envelope

All messages are wrapped in a JSON object envelope with the following fields:

```js
{
  "protocol": "swarmchat/v1",
  "type": "<string handled by protocol>",
  "nonce": "<random string>",
  "payload": <JSON>
}
```

## Peering flow

### Peering topic

In order to start a conversation stream, two peers must know each other's public key, overlay address and shared topic.
The way peers discover each other's public key is out of the scope of this protocol, but this protocol defines a specific topic all clients should listen to in order to receive contact requests, by calling `pss_stringToTopic` with the node's public key.

### Contact request

Before being able to send chat messages, a peer must accept the user as a contact. To send a request, the user must know the peer's public key, and send the following message in the topic retrieved by calling `pss_stringToTopic` with the peer's public key.
The `address` provides the peers with the node's overlay address, allowing to set a specific "darkness" to the communications. If not provided, it should default to `0x`.
The `username` can be provided for display purposes, and the `message` can be provided by the user as an introduction.

```js
{
  "protocol": "swarmchat/v1",
  "type": "contact_request",
  "nonce": "<random string>",
  "payload": {
    "topic": "<topic hex>",
    "address": "<optional address hex>",
    "username": "<optional display name>",
    "message": "<optional contact message>"
  }
}
```

### Contact response

When receiving a contact response, a node may simply ignore the message, or send a `"contact": false` payload to decline the invitation.
If the user accepts the contact request, the client should start subscribing to the provided `topic` from the contact request, before sending the contact response payload with `"contact": true` and optionally the `username` and node's `address`.

```js
{
  "protocol": "swarmchat/v1",
  "type": "contact_response",
  "nonce": "<random string>",
  "payload": {
    "contact": Boolean,
    "address": "<optional address hex>",
    "username": "<optional display name>"
  }
}
```

### Contact information

After nodes have been added as contacts, they can send or receive contact information messages in the shared topic they communicate, in order to update their information, such as their `username` or overlay `address`.

```js
{
  "protocol": "swarmchat/v1",
  "type": "contact_info",
  "nonce": "<random string>",
  "payload": {
    "address": "<optional address hex>",
    "username": "<optional display name>"
  }
}
```

## Chat messages

Once nodes are connected to a shared topic, they can send text messages to each other. By default a message should be a simple string, but clients might support additional protocols, such as `html` in the following example.
A client that does not recognise a protocol might alert the user about its limited capabilities, and fallback to the basic protocol behaviour, in this case only displaying the `message` contents.

### Text message

```js
{
  "protocol": "swarmchat/v1",
  "type": "chat_message",
  "nonce": "<random string>",
  "payload": {
    "message": "<message string>"
  }
}
```

### Custom protocol message

```js
{
  "protocol": "swarmchat/v1+html",
  "type": "chat_message",
  "nonce": "<random string>",
  "payload": {
    "message": "<message string>",
    "html": "<HTML-formatted message>"
  }
}
```
