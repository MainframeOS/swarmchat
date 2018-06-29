// @flow

import React from 'react'
import { StyleSheet, TextInput } from 'react-native-web'

import { COLORS } from './styles'

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.BLUE_SWARM,
    padding: 5,
    marginBottom: 5,
    borderRadius: 2,
  },
})

const FormInput = ({ style, ...props }: Object) => (
  <TextInput style={[styles.input, style]} {...props} />
)

export default FormInput
