// @flow

import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native-web'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const Loader = () => (
  <View style={styles.root}>
    <ActivityIndicator size="large" />
  </View>
)

export default Loader
