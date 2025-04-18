// Imports de dependencias
import express from 'express'
import http from 'node:http'
import { Server } from 'socket.io'
import { SerialPort } from 'serialport'
import { DelimiterParser } from '@serialport/parser-delimiter'
import { Timestamp } from './utils.js'

const app = express() // Creamos una instancia de express
const server = http.createServer(app) // Creamos un servidor http con 'app' como handler
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173' // Permite el cross origin del puerto del frontend
  }
}) // Creamos el servidor que maneja websockets a partir del server http

// Creamos variables para el puerto y el parser de nuestra comunicacion serial
let port
let parser

let lineasDelSerial = [] // Almacenamos las líneas recibidas por la comunicacion serial
let jsonDeDatos = {} // Se actualiza cada vez que recibimos todos los datos
let estadoArduino = false // Se actualiza dependiendo del estado de conexion del arduino

// Creamos una funcion que se encarga de crear un puerto y parser, ademas de escuchar los diferentes eventos dentro del puerto
const ConectarPuerto = () => {
  port = new SerialPort({ path: 'COM3', baudRate: 9600 }) // Creamos el puerto
  parser = port.pipe(new DelimiterParser({ delimiter: '\n' })) // Creamos un parser para que nos divida el serial por cada salto de linea

  // Cuando el puerto escucha el evento 'open' indicamos que se ha abierto el puerto
  port.on('open', () => {
    console.log('Puerto abierto')
    estadoArduino = true
    io.emit('arduino-conectado', estadoArduino) // Emitimos el estado de conexion del arduino a las conexiones suscritas
  })

  // Ejecuta el codigo cuando el parser recibe una linea del serial
  parser.on('data', (data) => {
    // Decodifiamos la linea recibida como buffer de Uint8Array (de 0 a 255 cada caracter) y removemos cualquier espacio antes y despues del contenido
    const line = new TextDecoder().decode(new Uint8Array(data)).trim()
    if (line.startsWith('Datos')) return // Ignora la linea que contiene el encabezado

    lineasDelSerial.push(line) // Añadimos la linea a nuestra lista

    // Parseamos las lineas como Json cuando tenemos 5 lineas
    if (lineasDelSerial.length === 5) {
      lineasDelSerial = lineasDelSerial.map(linea => linea.split(':')[1])
      jsonDeDatos = {
        co2: parseFloat(lineasDelSerial[0]),
        temperatura: parseFloat(lineasDelSerial[1]),
        presion: parseFloat(lineasDelSerial[2]),
        velocidad_vertical: parseFloat(lineasDelSerial[3]),
        aceleracion_neta: parseFloat(lineasDelSerial[4])
      }

      io.emit('nuevos-datos', jsonDeDatos) // Emitimos el json a todas las conexiones suscritas (para renderizar en el frontend)
      console.log()
      console.log(Timestamp()) // Mostramos en consola el tiempo en formato hh:mm:ss:ms
      console.log('Enviado al frontend:', jsonDeDatos) // Mostramos en consola, el json que se emitio al frontend

      lineasDelSerial = [] // Vaciamos nuestra lista para la siguiente tanda de datos
    }
  })

  // Cuando el puerto escucha el evento 'close', indicamos que se ha cerrdao el puerto e intentamos reconectar (en caso de que se desconecte el arduino)
  port.on('close', () => {
    console.log('Puerto cerrado')
    console.log('Reintentando conexion...')
    estadoArduino = false
    io.emit('arduino-conectado', estadoArduino) // Emitimos el estado de conexion del arduino a las conexiones suscritas
    setTimeout(ConectarPuerto, 2000)
  })

  // Cuando existe un problema al abrir el puerto, mostramos el error e intentamos reconectar
  port.on('error', (error) => {
    console.log(`Error: ${error}`)
    console.log('Reintentando conexion...')
    estadoArduino = false
    io.emit('arduino-conectado', estadoArduino) // Emitimos el estado de conexion del arduino a las conexiones suscritas
    setTimeout(ConectarPuerto, 2000)
  })
}

// Ejecutamos la funcion para conectar el Puerto Serial
ConectarPuerto()

// Cuando nuestro servidor detecta una conexion emitimos al socket que establecio la conexion el estado del arduino
io.on('connection', (socket) => {
  console.log('Cliente conectado')
  socket.emit('arduino-conectado', estadoArduino)
})

// El server escucha en el puerto 3000
server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000')
})
