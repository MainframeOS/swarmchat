// @flow

import React, { PureComponent } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native-web'

import type { Contact } from '../types'

import sharedStyles, { COLORS } from './styles'

const styles = StyleSheet.create({
  textView: {
    paddingVertical: 5,
  },
  actionText: {
    color: COLORS.TEXT_ALT,
  },
})

type Props = {
  contact: Contact,
  onAcceptContact: () => Promise<void>,
  onDeclineContact: () => Promise<void>,
  onResendContactRequest: () => Promise<void>,
}

export default class ContactScreen extends PureComponent<Props> {
  render() {
    const {
      contact,
      onAcceptContact,
      onDeclineContact,
      onResendContactRequest,
    } = this.props

    switch (contact.type) {
      case 'added':
        // TODO: render chat view
        return (
          <View style={sharedStyles.viewCenter}>
            <Text>Contact added</Text>
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
