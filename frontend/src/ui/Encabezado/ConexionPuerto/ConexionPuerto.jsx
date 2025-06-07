import { useState } from 'react'
import socket from '../../../utils/socket.js'

const ConexionPuerto = ({ puertosDisponibles }) => {
  // Inicializamos los estados
  const [puertoSeleccionado, setPuertoSeleccionado] = useState('')
  const [baudiosIngresados, setBaudiosIngresados] = useState(9600)

  // Handler que emite al backend el nuevo puerto seleccionado
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!puertoSeleccionado || !baudiosIngresados) return
    const pathSeleccionado = puertosDisponibles.find(
      (puerto) => puerto.friendlyName === puertoSeleccionado
    )?.path
    if (!pathSeleccionado) return
    socket.emit('puerto-seleccionado', {
      path: pathSeleccionado,
      baudRate: parseInt(baudiosIngresados),
    })
  }

  // Hacemos un retorno temprano, para renderizar 'null' en lo que llegan los puertos del back
  // Una vez llega procede a renderizar la seccion de selección
  if (!puertosDisponibles) return

  return (
    <div id="conexion-puerto">
      <form onSubmit={handleSubmit} id="conexion-form">
        <select
          value={puertoSeleccionado}
          onChange={(e) => setPuertoSeleccionado(e.target.value)}
          id="seleccion-puerto"
          className="darkgray-background"
        >
          <option>--Selecciona puerto--</option>
          {puertosDisponibles.map((puerto) => (
            <option key={puerto.path}>{puerto.friendlyName}</option>
          ))}
        </select>
        <div id="baudios-establecer">
          <input
            id="seleccion-baudios"
            className="darkgray-background"
            type="number"
            value={baudiosIngresados}
            onChange={(e) => setBaudiosIngresados(e.target.value)}
          ></input>
          <button className="blue-background" type="submit">
            Establecer
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConexionPuerto
