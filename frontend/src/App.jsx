import { useState, useEffect } from 'react'
import {io} from 'socket.io-client'
import './App.css'

const socket = io('http://localhost:3000/')

const App = () => {
  const [datos, setDatos] = useState(null)
  const [arduinoConectado, setEstadoArduino] = useState(false)

  useEffect(() => {
    socket.on('arduino-conectado', (estado) => {
      console.log('estado', estado)
      setEstadoArduino(estado)
    })

    socket.on('nuevos-datos', (datos) => {
      console.log('datos', datos)
      setDatos(datos)
    })

    return () => {
      socket.off('arduino-conectado')
      socket.off('nuevos-datos')
    }
  }, [])

  return (
    <div id='container'>
    <h1 id='title'> - [ Lifter ] - </h1>
    {!arduinoConectado ? 
    <h2 class="notification">Arduino Desconectado</h2> 
    : 
    <Informacion datos={datos}></Informacion>}
    </div>
  )
}

const Informacion = ({datos}) => {
  return (
    <>
    {datos ? 
    <>
    <p class="datos">Co2: {datos.co2} ppm</p>
    <p class="datos">Temperatura: {datos.temperatura} °C</p>
    <p class="datos">Presion: {datos.presion} kPa</p>
    <p class="datos">Velocidad Vertical: {datos.velocidad_vertical} m/s</p>
    <p class="datos">Aceleracion Neta: {datos.aceleracion_neta} m/s²</p>
    </>
    :
    <h2 class="notification">Esperando datos...</h2>}
    </>
  )
}

export default App