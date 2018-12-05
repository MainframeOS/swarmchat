// @flow

import type { PssEvent } from '@erebos/api-pss'
import { SwarmClient, type hexValue } from '@erebos/swarm-browser'
import type { Observable } from 'rxjs'
import { map, filter } from 'rxjs/operators'

import { createEvent, type SwarmEvent } from './SwarmEvent'

export const PROTOCOL = 'swarmchat/v1'

export type IncomingProtocolEvent = {
  key: hexValue,
  data: SwarmEvent,
}

export type ChatMessagePayload = {
  text: string,
}

export type IncomingChatMessage = {
  type: 'chat_message',
  key: hexValue,
  utc_timestamp: number,
  payload: ChatMessagePayload,
}

export type IncomingChatEvent = IncomingChatMessage

export type ContactRequestPayload = {
  topic: hexValue,
  overlay_address?: hexValue,
  username?: string,
}

export type IncomingContactRequest = {
  type: 'contact_request',
  key: hexValue,
  payload: ContactRequestPayload,
}

export type ContactResponsePayload = {
  contact: boolean,
  overlay_address?: hexValue,
  username?: string,
}

export type IncomingContactResponse = {
  type: 'contact_response',
  key: hexValue,
  payload: ContactResponsePayload,
}

export type IncomingContactEvent =
  | IncomingContactRequest
  | IncomingContactResponse

export type IncomingEvent = IncomingChatEvent | IncomingContactEvent

export type OwnInfo = {
  publicKey: hexValue,
  overlayAddress: hexValue,
}

const createRandomString = (): string => {
  return Math.random()
    .toString(36)
    .slice(2)
}

export const decodePssEvent = (data: PssEvent): IncomingProtocolEvent => ({
  key: data.key,
  data: data.msg.toObject(),
})

export default class SwarmChat {
  _client: SwarmClient
  _ownInfo: ?OwnInfo

  constructor(url: string) {
    this._client = new SwarmClient({ ws: url })
  }

  get hasOwnInfo(): boolean {
    return this._ownInfo != null
  }

  async getOwnInfo(): Promise<OwnInfo> {
    if (this._ownInfo == null) {
      const [publicKey, overlayAddress] = await Promise.all([
        this._client.pss.getPublicKey(),
        this._client.pss.baseAddr(),
      ])
      this._ownInfo = { publicKey, overlayAddress }
    }
    return this._ownInfo
  }

  async createChatSubscription(
    contactKey: hexValue,
    topic: hexValue,
  ): Promise<Observable<IncomingChatEvent>> {
    const [sub] = await Promise.all([
      this._client.pss.createTopicSubscription(topic),
      this._client.pss.setPeerPublicKey(contactKey, topic),
    ])
    return sub.pipe(
      map(decodePssEvent),
      filter((event: IncomingProtocolEvent) => {
        return event.data.type === 'chat_message' && event.data.payload != null
      }),
      map(
        // $FlowFixMe: polymorphic type
        (event: IncomingProtocolEvent): IncomingChatEvent => ({
          key: event.key,
          type: event.data.type,
          utc_timestamp: event.data.utc_timestamp,
          payload: event.data.payload,
        }),
      ),
    )
  }

  async createContactSubscription(): Promise<Observable<IncomingContactEvent>> {
    const { publicKey } = await this.getOwnInfo()
    const topic = await this._client.pss.stringToTopic(publicKey)
    const sub = await this._client.pss.createTopicSubscription(topic)
    return sub.pipe(
      map(decodePssEvent),
      filter((event: IncomingProtocolEvent) => {
        return (
          (event.data.type === 'contact_request' &&
            event.data.payload != null &&
            event.data.payload.topic != null) ||
          event.data.type === 'contact_response'
        )
      }),
      map(
        // $FlowFixMe: polymorphic type
        (event: IncomingProtocolEvent): IncomingContactEvent => ({
          key: event.key,
          type: event.data.type,
          payload: event.data.payload,
        }),
      ),
    )
  }

  async sendChatMessage(
    key: hexValue,
    topic: hexValue,
    payload: ChatMessagePayload,
  ): Promise<void> {
    const message = createEvent('chat_message', payload)
    await this._client.pss.sendAsym(key, topic, message)
  }

  async sendContactRequest(
    key: hexValue,
    data?: { username?: string, message?: string } = {},
  ): Promise<hexValue> {
    const [ownInfo, contactTopic, sharedTopic] = await Promise.all([
      this.getOwnInfo(),
      this._client.pss.stringToTopic(key),
      this._client.pss.stringToTopic(createRandomString()),
    ])
    await this._client.pss.setPeerPublicKey(key, contactTopic)
    const message = createEvent('contact_request', {
      ...data,
      topic: sharedTopic,
      overlay_address: ownInfo.overlayAddress,
    })
    await this._client.pss.sendAsym(key, contactTopic, message)
    return sharedTopic
  }

  async sendContactResponse(
    key: hexValue,
    accept: boolean,
    data?: { username?: string } = {},
  ): Promise<void> {
    let payload
    if (accept) {
      const ownInfo = await this.getOwnInfo()
      payload = {
        contact: true,
        overlay_address: ownInfo.overlayAddress,
        username: data.username,
      }
    } else {
      payload = { contact: false }
    }
    const topic = await this._client.pss.stringToTopic(key)
    await this._client.pss.setPeerPublicKey(key, topic)
    const message = createEvent('contact_response', payload)
    await this._client.pss.sendAsym(key, topic, message)
  }
}
