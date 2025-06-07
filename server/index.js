/* ------------------------- *
    Imports de dependencias
 * ------------------------- */
import express from 'express'
import http from 'node:http'
import { Server } from 'socket.io'
import { SerialPort } from 'serialport'
import { DelimiterParser } from '@serialport/parser-delimiter'
import fs from 'fs'
import { Timestamp } from './utils.js'

/* ------------------------ *
    Instanciando el server
 * ------------------------ */
const app = express() // Creamos una instancia de express
const server = http.createServer(app) // Creamos un servidor http con 'app' como handler
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173' // Permite el cross origin del puerto del frontend
  }
}) // Creamos el servidor que maneja websockets a partir del server http

/* -------------------------- *
    Declaración de variables
 * -------------------------- */
let port // Almacenara la instancia del puerto seleccionado
let parser // Se encargara de delimitar la comunicacion serial
let lineasDelSerial = [] // Almacenamos las líneas recibidas por la comunicacion serial
let jsonDeDatos = {} // Se actualiza cada vez que recibimos todos los datos
let estadoArduino = false // Se actualiza dependiendo del estado de conexion del arduino
let puertos // Se actualiza cada 2 segundos para verificar si existen nuevos puertos y mandarlos al frontend
let puertoSeleccionado // Se actualiza dependiendo de la emision del frontend

/* -------------------------- *
    Declaración de funciones
 * -------------------------- */
// Lectura del ultimo puerto seleccionado
// Si no encuentra el archivo de configuracion del puerto, utiliza valores por defecto
const EstablecerPuerto = () => {
  try {
    puertoSeleccionado = JSON.parse(
      fs.readFileSync('./server/config-port.json')
    )
  } catch (error) {
    console.log(
      'Error al cargar puerto de config-port.json, utilizando valores por defecto'
    )
    puertoSeleccionado = { path: 'COM3', baudRate: 9600 }
  }
}

// Funcion para encontrar los puertos y emitir cada que haya un cambio al frontend
const EncontrarPuertos = async () => {
  let puertosActuales = 0
  setInterval(async () => {
    puertos = (await SerialPort.list()).map((p) => ({
      path: p.path,
      friendlyName: p.friendlyName
        ? p.friendlyName
        : `${p.path} - ${p.manufacturer}`
    })) // Condicional terniaria para cambiar el valor de friendlyName en caso de utilizar GNU/Linux
    if (puertosActuales !== puertos.length) {
      puertosActuales = puertos.length
      io.emit('puertos-disponibles', puertos)
    }
  }, 2000)
}

// Creamos una funcion que se encarga de crear un puerto y parser, ademas de escuchar los diferentes eventos dentro del puerto
// Al manejar todos los eventos del puerto + parser dentro de la función, podemos llamarla recursivamente, en caso de que se cierre la conexión (sin reiniciar el server manualmente)
const ConectarPuerto = () => {
  if (estadoArduino) return // Si el estado del arduino es verdadero, es porque esta conectado, e impide la ejecución del codigo haciendo un retorno temprano

  port = new SerialPort({
    path: puertoSeleccionado.path,
    baudRate: puertoSeleccionado.baudRate
  }) // Creamos el puerto
  parser = port.pipe(new DelimiterParser({ delimiter: '\n' })) // Creamos un parser para que nos divida el serial por cada salto de linea

  // Cuando el puerto escucha el evento 'open' indicamos que se ha abierto el puerto
  port.on('open', () => {
    console.log('Puerto abierto')
    estadoArduino = true
    lineasDelSerial = [] // resetea las lineas en caso de reconexion
    io.emit('arduino-conectado', estadoArduino) // Emitimos el estado de conexion del arduino a las conexiones suscritas
    io.emit('puerto-establecido', puertoSeleccionado.path) // Emitimos el path del puerto seleccionado para display en el frontend
  })

  // Ejecuta el codigo cuando el parser recibe una linea del serial
  parser.on('data', (data) => {
    // Decodifiamos la linea recibida como buffer de Uint8Array (de 0 a 255 cada caracter) y removemos cualquier espacio antes y despues del contenido
    const line = new TextDecoder().decode(new Uint8Array(data)).trim()
    if (line.startsWith('===')) return // Ignora la linea que contiene el encabezado
    lineasDelSerial.push(line) // Añadimos la linea a nuestra lista

    /* [ Ejemplo de la llegada de cada tanda de datos del serial ]
    === RECEPTOR ===:
    Temp: a
    Presion: b
    CO2: c
    Accz: d
    VelV: e
    Rotaciones: x y z
    */

    // Parseamos las lineas como Json cuando tenemos 6 lineas
    if (lineasDelSerial.length === 6) {
      lineasDelSerial = lineasDelSerial.map((linea) => linea.split(': ')[1])
      // El parseFloat delimita la entrada numerica (en caso de que el lora mande como string los datos junto con unidades)
      jsonDeDatos = {
        temperatura: parseFloat(lineasDelSerial[0]),
        presion: parseFloat(lineasDelSerial[1]),
        co2: parseFloat(lineasDelSerial[2]),
        aceleracion_neta: parseFloat(lineasDelSerial[3]),
        velocidad_vertical: parseFloat(lineasDelSerial[4]),
        rotaciones: lineasDelSerial[5]
          .split(' ')
          .map((item) => (parseFloat(item) * Math.PI) / 180)
      }

      // Formateamos los valores para impresion en txt
      // Formato: hora:minutos:segundos:milisegundos, día, temperatura, co2, presión, anguloX, anguloZ
      const registroParaImpresion = `${Timestamp()}, ${
        jsonDeDatos.temperatura
      }, ${jsonDeDatos.co2}, ${jsonDeDatos.presion}, ${
        jsonDeDatos.rotaciones[0]
      }, ${jsonDeDatos.rotaciones[2]}\n`
      fs.appendFileSync('./datos-registrados/datos.txt', registroParaImpresion) // Agrega cada nueva linea formateada al archivo './datos-registrados/datos.txt' (de no existir, lo crea)

      io.emit('nuevos-datos', jsonDeDatos) // Emitimos el json a todas las conexiones suscritas (para renderizar en el frontend)
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

// Cuando nuestro servidor detecta una conexion emitimos al socket que establecio la conexión, el estado del arduino y recibimos el puerto seleccionado en el frontend
const EstablecerConexionSocket = () => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado')
    socket.emit('arduino-conectado', estadoArduino)
    socket.emit('puertos-disponibles', puertos)
    socket.emit('puerto-establecido', puertoSeleccionado.path)

    socket.on('puerto-seleccionado', (puertoRecibido) => {
      puertoSeleccionado = puertoRecibido
      fs.writeFileSync(
        './server/config-port.json',
        JSON.stringify(puertoSeleccionado)
      )
      port.close()
    })
  })
}

/* --------------------- *
    Iniciando el server
 * --------------------- */
EstablecerPuerto()
EncontrarPuertos()
ConectarPuerto()
EstablecerConexionSocket()

// El server escucha en el puerto 3000
server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000')
})
