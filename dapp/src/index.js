import Modal from 'react-modal'
import { AppRegistry } from 'react-native-web'

import './index.css'
import SwarmChat from './components/SwarmChat'

const rootTag = document.getElementById('root')

Modal.setAppElement(rootTag)

AppRegistry.registerComponent('App', () => SwarmChat)
AppRegistry.runApplication('App', { rootTag })
