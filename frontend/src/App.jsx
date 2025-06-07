import { useState, useEffect } from 'react'
import socket from './utils/socket.js'
import Encabezado from './ui/Encabezado/Encabezado.jsx'
import Paneles from './ui/Paneles/Paneles.jsx'
import './App.css'

const App = () => {
  // Inicializacion de estados
  const [datos, setDatos] = useState(null)
  const [conexionEstablecida, setEstadoConexion] = useState(false)
  const [puertosDisponibles, setPuertosDisponibles] = useState([])
  const [puertoEstablecido, setPuertoEstablecido] = useState(null)

  // Suscripcion de los eventos del backend
  useEffect(() => {
    socket.on('arduino-conectado', (estado) => {
      console.log('arduino conectado: ', estado)
      setEstadoConexion(estado)
    })

    socket.on('nuevos-datos', (datos) => {
      setDatos(datos)
    })

    socket.on('puertos-disponibles', (puertosRecibidos) => {
      setPuertosDisponibles(puertosRecibidos)
    })

    socket.on('puerto-establecido', (puertoRecibido) => {
      setPuertoEstablecido(puertoRecibido)
    })

    // En caso de desmontar el componente me desuscribo
    return () => {
      socket.off('arduino-conectado')
      socket.off('nuevos-datos')
      socket.off('puertos-disponibles')
    }
  }, [])

  // Si se pierde la conexion se restablece a null el estado de los datos
  useEffect(() => {
    if (!conexionEstablecida) {
      setDatos(null)
    }
  }, [conexionEstablecida])

  return (
    <>
      <Encabezado
        puertosDisponibles={puertosDisponibles}
        puertoEstablecido={puertoEstablecido}
      />
      {/* Si no hay conexion mostramos un banner que lo indica, de lo contrario renderizamos el componente Paneles */}
      {!conexionEstablecida ? (
        <>
          <h2 className="notificacion rojo">Sin conexion</h2>
          <div className="fondo-imagen">
            <img src="/images/sin-conexion.png" height={400}></img>
          </div>
        </>
      ) : (
        <Paneles datos={datos}></Paneles>
      )}
    </>
  )
}

export default App
