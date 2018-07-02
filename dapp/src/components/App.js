// @flow

import { hexType, type hex } from '@mainframe/utils-hex'
import React, { Component } from 'react'
import Modal from 'react-modal'
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native-web'
import type { Subscription } from 'rxjs'

import { getAppData, setAppData } from '../store'
import type { Contacts } from '../types'

import type {
  default as SwarmChat,
  IncomingContactEvent,
} from '../lib/SwarmChat'

import Avatar from './Avatar'
import ContactScreen from './ContactScreen'
import ContactsList from './ContactsList'
import FormError from './FormError'
import FormInput from './FormInput'
import Loader from './Loader'
import { COLORS } from './styles'

const PUBLIC_KEY_RE = /^0x[0-9a-f]{130}$/

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    flexDirection: 'column',
    backgroundColor: COLORS.BACKGROUND_CONTRAST,
  },
  sidebarHeader: {
    padding: 5,
    flexDirection: 'row',
  },
  sidebarHeaderText: {
    fontSize: 18,
    lineHeight: 48,
    color: COLORS.TEXT_CONTRAST,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  modalSection: {
    paddingVertical: 5,
  },
})

type State = {
  contactKey: string,
  contacts: Contacts,
  inviteErrorMessage: ?string,
  inviteModalOpen: boolean,
  publicKey: ?hex,
  selectedKey: ?hex,
  settingsModalOpen: boolean,
  username: string,
}

export default class App extends Component<{ client: SwarmChat }, State> {
  _sub: ?Subscription

  state = {
    contactKey: '',
    contacts: {},
    inviteErrorMessage: undefined,
    inviteModalOpen: false,
    publicKey: undefined,
    selectedKey: undefined,
    settingsModalOpen: false,
    username: '',
  }

  async setup() {
    const { client } = this.props
    const { publicKey } = await client.getOwnInfo()
    const [appData, contactsSub] = await Promise.all([
      getAppData(publicKey),
      client.createContactSubscription(),
    ])
    this.setState({ ...appData, publicKey }, () => {
      this._sub = contactsSub.subscribe(this.onReceiveContactEvent)
    })
  }

  saveAppData = async () => {
    const { contacts, publicKey, selectedKey, username } = this.state
    if (publicKey == null) {
      console.warn('Cannot save app data before public key is known')
    } else {
      try {
        await setAppData(publicKey, { contacts, selectedKey, username })
      } catch (err) {
        console.warn(err)
      }
    }
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
    this.setState(({ contacts }) => {
      const existing = contacts[ev.key]
      if (
        ev.type === 'contact_request' &&
        (existing == null || existing.type === 'received_pending')
      ) {
        // New contact or update existing with new payload
        return {
          contacts: {
            ...contacts,
            [ev.key]: {
              key: ev.key,
              type: 'received_pending',
              topic: ev.payload.topic,
              username: ev.payload.username,
              address: ev.payload.overlay_address,
            },
          },
        }
      } else if (
        ev.type === 'contact_response' &&
        existing != null &&
        (existing.type === 'sent_declined' || existing.type === 'sent_pending')
      ) {
        // Response from contact, set type to "added" or "sent_declined" accordingly
        return {
          contacts: {
            ...contacts,
            [ev.key]: {
              ...existing,
              type: ev.payload.contact === true ? 'added' : 'sent_declined',
              username: ev.payload.username,
              address: ev.payload.overlay_address,
            },
          },
        }
      }
      return null
    }, this.saveAppData)
  }

  onChangeContactKey = (value: string) => {
    this.setState({ contactKey: value })
  }

  onChangeUsername = (value: string) => {
    this.setState({ username: value })
  }

  onSubmitContactRequest = async () => {
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
      this.setState({ inviteModalOpen: false })
      const data = username.length > 0 ? { username } : undefined
      const topic = await this.props.client.sendContactRequest(
        hexType(contactKey),
        data,
      )
      this.setState(
        ({ contacts }) => ({
          contactKey: '',
          contacts: {
            ...contacts,
            [contactKey]: {
              key: contactKey,
              type: 'sent_pending',
              topic,
            },
          },
        }),
        this.saveAppData,
      )
    }
  }

  sendContactResponse = async (key: hex, accepted: boolean) => {
    await this.props.client.sendContactResponse(key, accepted, {
      username: this.state.username,
    })
    // TODO: if accepted, also join shared topic

    this.setState(({ contacts }) => {
      const existing = contacts[key]
      return {
        contacts: {
          ...contacts,
          [key]: {
            ...existing,
            type: accepted ? 'added' : 'received_declined',
          },
        },
      }
    }, this.saveAppData)
  }

  onOpenInviteModal = () => {
    this.setState({ inviteModalOpen: true })
  }

  onCloseInviteModal = () => {
    this.setState({ inviteModalOpen: false })
  }

  onOpenSettingsModal = () => {
    this.setState({ settingsModalOpen: true })
  }

  onCloseSettingsModal = () => {
    this.setState({ settingsModalOpen: false })
  }

  onSelectKey = (selectedKey: hex) => {
    this.setState({ selectedKey }, this.saveAppData)
  }

  onAcceptContact = async () => {
    const { selectedKey } = this.state
    if (selectedKey != null) {
      await this.sendContactResponse(selectedKey, true)
    }
  }

  onDeclineContact = async () => {
    const { selectedKey } = this.state
    if (selectedKey != null) {
      await this.sendContactResponse(selectedKey, false)
    }
  }

  onResendContactRequest = async () => {
    const { selectedKey, username } = this.state
    if (selectedKey != null) {
      const data = username ? { username } : undefined
      await this.props.client.sendContactRequest(selectedKey, data)
    }
  }

  render() {
    const {
      contactKey,
      contacts,
      inviteErrorMessage,
      inviteModalOpen,
      publicKey,
      selectedKey,
      settingsModalOpen,
      username,
    } = this.state

    if (publicKey == null) {
      return <Loader />
    }

    const content = selectedKey ? (
      <ContactScreen
        contact={contacts[(selectedKey: string)]}
        onAcceptContact={this.onAcceptContact}
        onDeclineContact={this.onDeclineContact}
        onResendContactRequest={this.onResendContactRequest}
      />
    ) : null // TODO: default screen

    return (
      <View style={styles.root}>
        <View style={styles.sidebar}>
          <TouchableOpacity
            onPress={this.onOpenSettingsModal}
            style={styles.sidebarHeader}>
            <Avatar publicKey={publicKey} size="large" />
            <Text numberOfLines={1} style={styles.sidebarHeaderText}>
              &nbsp;{username || publicKey}
            </Text>
          </TouchableOpacity>
          <ContactsList
            contacts={contacts}
            onOpenInviteModal={this.onOpenInviteModal}
            onSelectKey={this.onSelectKey}
            selectedKey={selectedKey}
          />
        </View>
        <View style={styles.content}>{content}</View>
        <Modal
          isOpen={inviteModalOpen}
          onRequestClose={this.onCloseInviteModal}>
          <FormError message={inviteErrorMessage} />
          <View>
            <Text>Contact public key:</Text>
            <FormInput
              onChangeText={this.onChangeContactKey}
              onSubmitEditing={this.onSubmitContactRequest}
              value={contactKey}
            />
          </View>
          <View>
            <Text>Your username (optional):</Text>
            <FormInput
              onChangeText={this.onChangeUsername}
              onSubmitEditing={this.onSubmitContactRequest}
              value={username}
            />
          </View>
          <Button
            color={COLORS.BUTTON_PRIMARY}
            disabled={contactKey.length === 0}
            onPress={this.onSubmitContactRequest}
            title="Invite contact"
          />
        </Modal>
        <Modal
          isOpen={settingsModalOpen}
          onRequestClose={this.onCloseSettingsModal}>
          <View style={styles.modalSection}>
            <Text>Your public key: {publicKey}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text>Your username (optional):</Text>
            <FormInput onChangeText={this.onChangeUsername} value={username} />
          </View>
          <Button
            color={COLORS.BLUE_SWARM}
            onPress={this.onCloseSettingsModal}
            title="Close"
          />
        </Modal>
      </View>
    )
  }
}
