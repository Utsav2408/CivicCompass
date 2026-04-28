import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import app from './firebase'

const functions = getFunctions(app, 'us-east1')

// Connect to emulator in development
if (import.meta.env['VITE_USE_EMULATORS'] === 'true') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}

export { functions }