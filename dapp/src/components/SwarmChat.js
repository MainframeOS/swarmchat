// @flow

import React, { Component } from 'react'
import { AsyncStorage, Button, StyleSheet, Text, View } from 'react-native-web'

import SwarmChat from '../lib/SwarmChat'

import App from './App'
import FormError from './FormError'
import FormInput from './FormInput'
import Loader from './Loader'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    alignSelf: 'center',
    width: 400,
    borderColor: '#000000',
    borderWidth: 1,
    padding: 10,
  },
  title: {
    fontSize: 32,
  },
})

type Step = 'input_url' | 'ready' | 'setup' | 'setup_failed'

type State = {
  errorMessage?: ?string,
  lib?: SwarmChat,
  step: Step,
  url: string,
}

export default class SwarmChatApp extends Component<{}, State> {
  state = {
    step: 'setup',
    url: 'ws://localhost:8546',
  }

  async createLib(url): boolean {
    try {
      const lib = new SwarmChat(url)
      await lib.getOwnInfo()
      this.setState({ step: 'ready', lib })
      return true
    } catch (err) {
      this.setState({ step: 'setup_failed', errorMessage: err.message, url })
      return false
    }
  }

  async setup() {
    const swarmURL = await AsyncStorage.getItem('swarm_url')
    if (swarmURL == null) {
      this.setState({ step: 'input_url' })
    } else {
      await this.createLib(swarmURL)
    }
  }

  onChangeURL = (url: string) => {
    this.setState({ url })
  }

  onSubmit = async () => {
    const { url } = this.state
    if (url.length > 0) {
      const created = await this.createLib(url)
      if (created) {
        await AsyncStorage.setItem('swarm_url', url)
      }
    }
  }

  componentDidMount() {
    this.setup()
  }

  render() {
    const { errorMessage, lib, step, url } = this.state

    if (step === 'setup') {
      return <Loader />
    }
    if (step === 'ready') {
      return <App lib={lib} />
    }

    return (
      <View style={styles.root}>
        <Text style={styles.title}>SwarmChat</Text>
        <View style={styles.form}>
          {step == 'setup_failed' ? <FormError message={errorMessage} /> : null}
          <Text>Swarm WebSocket URL:</Text>
          <FormInput
            onChangeText={this.onChangeURL}
            onSubmitEditing={this.onSubmit}
            value={url}
          />
          <Button
            disabled={url.length === 0}
            onPress={this.onSubmit}
            title="Connect"
          />
        </View>
      </View>
    )
  }
}
