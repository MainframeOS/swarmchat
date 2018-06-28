// @flow

import React from 'react'
import { StyleSheet, Text, View } from 'react-native-web'

const COLOR = '#d72323'

const styles = StyleSheet.create({
  view: {
    borderColor: COLOR,
    borderWidth: 2,
    padding: 5,
    marginBottom: 10,
  },
  text: {
    color: COLOR,
    fontWeight: 'bold',
  },
})

type Props = {
  message?: ?string,
}

const FormError = ({ message }: Props) => {
  return message ? (
    <View style={styles.view}>
      <Text style={styles.text}>{message}</Text>
    </View>
  ) : null
}

export default FormError
