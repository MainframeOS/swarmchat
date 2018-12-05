// @flow

import type { hexValue } from '@erebos/swarm-browser'

export type SystemMessageType = 'chat_joined' | 'chat_left'

export type SystemMessage = {
  id: string,
  sender: hexValue,
  timestamp: number,
  type: SystemMessageType,
}

export type UserMessage = {
  id: string,
  sender: hexValue,
  text: string,
  timestamp: number,
}

export type Message = SystemMessage | UserMessage

export type Chat = {
  messages: Array<UserMessage>,
  pointer: number,
}

export type Chats = { [key: string]: Chat }

export type ContactState =
  | 'added'
  | 'received_declined'
  | 'received_pending'
  | 'sent_declined'
  | 'sent_pending'

export type Contact = {
  key: hexValue,
  type: ContactState,
  topic: hexValue,
  username?: ?string,
  address?: ?hexValue,
}

export type Contacts = { [key: string]: Contact }
