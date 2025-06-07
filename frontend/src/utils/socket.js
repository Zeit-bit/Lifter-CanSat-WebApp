import { io } from 'socket.io-client'

// Establezco la conexion por websocket al puerto 3000 (backend)
const socket = io('http://localhost:3000/')

export default socket
