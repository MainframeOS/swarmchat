// @flow

import type { hex } from '@mainframe/utils-hex'
import React, { Component } from 'react'
import Modal from 'react-modal'
import { AsyncStorage, Button, StyleSheet, Text, View } from 'react-native-web'
import type { Subscription } from 'rxjs'

import type {
  default as SwarmChat,
  IncomingContactEvent,
} from '../lib/SwarmChat'

import FormError from './FormError'
import FormInput from './FormInput'
import Loader from './Loader'

const PUBLIC_KEY_RE = /^0x[0-9a-f]{130}$/

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    flexDirection: 'column',
    backgroundColor: '#333333',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
})

type ContactState = 'contact' | 'received' | 'sent'

type Contact = {
  key: hex,
  type: ContactState,
  topic: hex,
  username?: ?string,
}

type State = {
  contactKey: string,
  contacts: { [key: hex]: Contact },
  inviteErrorMessage?: ?string,
  inviteModalOpen: boolean,
  publickKey?: hex,
  username: string,
}

export default class App extends Component<{ lib: SwarmChat }, State> {
  _sub: ?Subscription

  state = {
    contactKey: '',
    contacts: {},
    inviteModalOpen: false,
    username: '',
  }

  async setup() {
    const { lib } = this.props
    const { publicKey } = await lib.getOwnInfo()
    const [appData, contactsSub] = await Promise.all([
      AsyncStorage.getItem(`swarmchat:${publicKey}:appData`),
      lib.createContactSubscription(),
    ])

    let state = {}
    if (appData != null) {
      try {
        state = JSON.parse(appData)
      } catch (err) {
        console.warn(err)
      }
    }

    this.setState({ ...state, publicKey }, () => {
      this._sub = contactsSub.subscribe(this.onReceiveContactEvent)
    })
  }

  componentDidMount() {
    this.setup()
  }

  componentWillUnmount() {
    if (this._sub != null) {
      this._sub.unsubscribe()
    }
  }

  onReceiveContactEvent = (ev: IncomingContactEvent) => {
    console.log('received contact event', ev)
    // TODO: update contacts object in state according to event
  }

  onChangeContactKey = (value: string) => {
    this.setState({ contactKey: value })
  }

  onChangeUsername = (value: string) => {
    this.setState({ username: value })
  }

  onSubmitContact = async () => {
    const { contactKey, publicKey, username } = this.state
    if (contactKey.length === 0) {
      return
    }

    if (contactKey === publicKey) {
      this.setState({
        inviteErrorMessage: 'Invalid contact key: this is your own key',
      })
    } else if (!PUBLIC_KEY_RE.test(contactKey)) {
      this.setState({
        inviteErrorMessage:
          'Invalid contact key: must be an hexadecimal string prefixed with "0x"',
      })
    } else {
      const data = username.length > 0 ? { username } : undefined
      const topic = await this.props.lib.sendContactRequest(contactKey, data)
      // TODO: add contact to local state
    }
  }

  onOpenInviteModal = () => {
    this.setState({ inviteModalOpen: true })
  }

  onCloseInviteModal = () => {
    this.setState({ inviteModalOpen: false })
  }

  render() {
    const {
      contactKey,
      inviteErrorMessage,
      inviteModalOpen,
      publicKey,
      username,
    } = this.state

    return publicKey == null ? (
      <Loader />
    ) : (
      <View style={styles.root}>
        <View style={styles.sidebar}>
          <Text>side</Text>
        </View>
        <View style={styles.content}>
          <Text>Hello {publicKey}</Text>
          <Button onPress={this.onOpenInviteModal} title="Invite contact" />
        </View>
        <Modal
          isOpen={inviteModalOpen}
          onRequestClose={this.onCloseInviteModal}>
          <FormError message={inviteErrorMessage} />
          <View>
            <Text>Contact key:</Text>
            <FormInput
              onChangeText={this.onChangeContactKey}
              onSubmitEditing={this.onSubmitContact}
              value={contactKey}
            />
          </View>
          <View>
            <Text>Your username (optional):</Text>
            <FormInput
              onChangeText={this.onChangeUsername}
              onSubmitEditing={this.onSubmitContact}
              value={username}
            />
          </View>
          <Button
            disabled={contactKey.length === 0}
            onPress={this.onSubmitContact}
            title="Invite"
          />
        </Modal>
      </View>
    )
  }
}
