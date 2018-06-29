// @flow

import type { hex } from '@mainframe/utils-hex'
import React, { Component } from 'react'
import Blockies from 'react-blockies'
import { StyleSheet, View } from 'react-native-web'

export const AVATAR_SIZE = {
  'xx-large': 160,
  'x-large': 80,
  large: 48,
  small: 32,
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: '50%',
    position: 'relative',
  },
})

export type AvatarSize = $Keys<typeof AVATAR_SIZE>

type Props = {
  publicKey: hex,
  size?: AvatarSize,
}

export default class Avatar extends Component<Props> {
  static defaultProps = {
    size: 'small',
  }

  render() {
    const { publicKey, size } = this.props
    const avatarSize = AVATAR_SIZE[size] || AVATAR_SIZE.small
    return (
      <View
        style={[styles.container, { width: avatarSize, height: avatarSize }]}>
        <Blockies seed={publicKey} size={8} scale={Math.ceil(avatarSize / 8)} />
      </View>
    )
  }
}
