// @flow

import type { hex } from '@mainframe/utils-hex'
import React, { createRef, PureComponent } from 'react'
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native-web'

import type { Chat, Contact } from '../types'

import FormInput from './FormInput'
import sharedStyles, { COLORS } from './styles'

const styles = StyleSheet.create({
  chatView: {
    flex: 1,
    flexDirection: 'column',
  },
  chatMessagesView: {
    flex: 1,
  },
  chatSendView: {
    backgroundColor: COLORS.BACKGROUND_CONTRAST,
    flexDirection: 'row',
    paddingTop: 5,
  },
  chatInput: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 7,
  },
  chatSendInputView: {
    flex: 1,
  },
  chatSendButtonView: {
    paddingHorizontal: 5,
  },
  messageView: {
    padding: 3,
  },
  messageSenderText: {
    fontWeight: 'bold',
  },
  textView: {
    paddingVertical: 5,
  },
  actionText: {
    color: COLORS.TEXT_ALT,
  },
})

type Props = {
  chat: ?Chat,
  contact: Contact,
  onAcceptContact: () => Promise<void>,
  onDeclineContact: () => Promise<void>,
  onResendContactRequest: () => Promise<void>,
  onSendChatMessage: (contactKey: hex, messageText: string) => Promise<void>,
}

type State = {
  messageText: string,
}

export default class ContactScreen extends PureComponent<Props, State> {
  messagesViewRef = createRef()

  state = {
    messageText: '',
  }

  onChangeMessage = (value: string) => {
    this.setState({ messageText: value })
  }

  onSubmitMessage = () => {
    const { messageText } = this.state
    if (messageText.length === 0) {
      return
    }
    this.props.onSendChatMessage(this.props.contact.key, messageText)
    this.setState({ messageText: '' })
  }

  render() {
    const {
      chat,
      contact,
      onAcceptContact,
      onDeclineContact,
      onResendContactRequest,
    } = this.props
    const { messageText } = this.state

    let messages = null
    if (chat != null && chat.messages.length) {
      messages = chat.messages.map(msg => {
        const senderText =
          msg.sender === contact.key
            ? contact.username || contact.key.slice(0, 8)
            : 'You'
        return (
          <View key={msg.id} style={styles.messageView}>
            <Text>
              <Text style={styles.messageSenderText}>{senderText}: </Text>
              <Text>{msg.text}</Text>
            </Text>
          </View>
        )
      })
    } // TODO: default screen

    switch (contact.type) {
      case 'added':
        // TODO: render chat view
        return (
          <View style={styles.chatView}>
            <ScrollView
              ref={this.messagesViewRef}
              style={styles.chatMessagesView}>
              {messages}
            </ScrollView>
            <View style={styles.chatSendView}>
              <View style={styles.chatSendInputView}>
                <FormInput
                  onChangeText={this.onChangeMessage}
                  onSubmitEditing={this.onSubmitMessage}
                  style={styles.chatInput}
                  value={messageText}
                />
              </View>
              <View style={styles.chatSendButtonView}>
                <Button
                  disabled={messageText.length === 0}
                  color={COLORS.ORANGE_SWARM}
                  onPress={this.onSubmitMessage}
                  title="Send"
                />
              </View>
            </View>
          </View>
        )

      case 'received_declined':
        return (
          <View style={sharedStyles.viewCenter}>
            <View style={styles.textView}>
              <Text>You have declined this invitation.</Text>
            </View>
            <Button
              color={COLORS.BUTTON_PRIMARY}
              onPress={onAcceptContact}
              title="Accept invitation"
            />
          </View>
        )

      case 'received_pending':
        return (
          <View style={sharedStyles.viewCenter}>
            <Button
              color={COLORS.BUTTON_PRIMARY}
              onPress={onAcceptContact}
              title="Accept invitation"
            />
            <View style={styles.textView}>
              <Text onPress={onDeclineContact} style={styles.actionText}>
                or decline it
              </Text>
            </View>
          </View>
        )

      case 'sent_declined':
        return (
          <View style={sharedStyles.viewCenter}>
            <View style={styles.textView}>
              <Text>Invitation declined by contact.</Text>
            </View>
            <View style={styles.textView}>
              <Text>
                You think it is by mistake?&nbsp;
                <Text
                  onPress={onResendContactRequest}
                  style={styles.actionText}>
                  Send the invitation again.
                </Text>
              </Text>
            </View>
          </View>
        )

      case 'sent_pending':
        return (
          <View style={sharedStyles.viewCenter}>
            <View style={styles.textView}>
              <Text>Invite sent</Text>
            </View>
            <Button
              color={COLORS.BUTTON_PRIMARY}
              onPress={onResendContactRequest}
              title="Send again"
            />
          </View>
        )

      default:
        // TODO: error message invalid type
        return null
    }
  }
}
