// @flow

import React, { Component } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native-web'

import { getSwarmURL, setSwarmURL } from '../store'
import SwarmChat from '../lib/SwarmChat'

import App from './App'
import FormError from './FormError'
import FormInput from './FormInput'
import Loader from './Loader'
import sharedStyles, { COLORS } from './styles'

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.BACKGROUND_CONTRAST,
  },
  form: {
    alignSelf: 'center',
    backgroundColor: COLORS.BACKGROUND,
    width: 400,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    color: COLORS.TEXT_CONTRAST,
    fontSize: 32,
  },
})

type Step = 'input_url' | 'ready' | 'setup' | 'setup_failed'

type State = {
  client: ?SwarmChat,
  errorMessage: ?string,
  step: Step,
  url: string,
}

export default class SwarmChatApp extends Component<{}, State> {
  state = {
    client: undefined,
    errorMessage: undefined,
    step: 'setup',
    url: 'ws://localhost:8546',
  }

  async createClient(url: string): Promise<boolean> {
    try {
      const client = new SwarmChat(url)
      await client.getOwnInfo()
      this.setState({ step: 'ready', client })
      return true
    } catch (err) {
      this.setState({ step: 'setup_failed', errorMessage: err.message, url })
      return false
    }
  }

  async setup() {
    const swarmURL = await getSwarmURL()
    if (swarmURL == null) {
      this.setState({ step: 'input_url' })
    } else {
      await this.createClient(swarmURL)
    }
  }

  onChangeURL = (url: string) => {
    this.setState({ url })
  }

  onSubmit = async () => {
    const { url } = this.state
    if (url.length > 0) {
      const created = await this.createClient(url)
      if (created) {
        await setSwarmURL(url)
      }
    }
  }

  componentDidMount() {
    this.setup()
  }

  render() {
    const { client, errorMessage, step, url } = this.state

    if (step === 'setup') {
      return <Loader />
    }
    if (step === 'ready' && client != null) {
      return <App client={client} />
    }

    return (
      <View style={[sharedStyles.viewCenter, styles.root]}>
        <Text style={styles.title}>SwarmChat</Text>
        <View style={styles.form}>
          {step === 'setup_failed' ? (
            <FormError message={errorMessage} />
          ) : null}
          <Text>Swarm WebSocket URL:</Text>
          <FormInput
            onChangeText={this.onChangeURL}
            onSubmitEditing={this.onSubmit}
            value={url}
          />
          <Button
            color={COLORS.BUTTON_PRIMARY}
            disabled={url.length === 0}
            onPress={this.onSubmit}
            title="Connect"
          />
        </View>
      </View>
    )
  }
}
