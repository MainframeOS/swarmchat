// @flow

import React from 'react'
import { StyleSheet, TextInput } from 'react-native-web'

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
    marginBottom: 5,
  },
})

const FormInput = ({ style, ...props }: Object) => (
  <TextInput style={[styles.input, style]} {...props} />
)

export default FormInput
