import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame} from '@react-three/fiber'
import {io} from 'socket.io-client'
import './App.css'

// Establezco la conexion por websocket al puerto 3000 (backend)
const socket = io('http://localhost:3000/')

const App = () => {

  // inicializacion de estados
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
      <Encabezado puertosDisponibles={puertosDisponibles} puertoEstablecido={puertoEstablecido}/>
      {!conexionEstablecida ?
      <>
      <h2 className='notificacion rojo'>Sin conexion</h2> 
      <div className='fondo-imagen'>
        <img src='../public/sin-conexion.png' height={400}></img>
      </div>
      </>
      : 
      <Paneles datos={datos}></Paneles>
      }
    </>
  )
}

const Encabezado = ({puertosDisponibles, puertoEstablecido}) => {
  return (
    <header id="encabezado">
        <h1 id="encabezado-titulo" className="blue-background">[ LIFTER ]</h1>
        <div id="encabezado-conexion">
            <div id="conexion-seleccion" className="darkgray-background">
                <p>Puerto establecido:</p>
                <span id="nombre-puerto">{puertoEstablecido}</span>
            </div>
            <ConexionPuerto puertosDisponibles={puertosDisponibles}/>
        </div>
    </header>
  )
}

const ConexionPuerto = ({puertosDisponibles}) => {
  const [puertoSeleccionado, setPuertoSeleccionado] = useState("")
  const [baudiosIngresados, setBaudiosIngresados] = useState(9600)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!puertoSeleccionado || !baudiosIngresados) return
    const pathSeleccionado = puertosDisponibles.find(puerto => puerto.friendlyName === puertoSeleccionado)?.path
    if (!pathSeleccionado) return
    socket.emit('puerto-seleccionado', { path: pathSeleccionado, baudRate: parseInt(baudiosIngresados)})
  }

  if (!puertosDisponibles) return
  
  return (
    <div id='conexion-puerto'>
      <form onSubmit={handleSubmit} id="conexion-form">
        <select value={puertoSeleccionado} onChange={e => setPuertoSeleccionado(e.target.value)} id="seleccion-puerto" className="darkgray-background">
        <option>--Selecciona puerto--</option>
          {
            puertosDisponibles.map(puerto => <option key={puerto.path}>{puerto.friendlyName}</option>)
          }
        </select>
        <div id="baudios-establecer">
          <input id="seleccion-baudios" className="darkgray-background" type='number' value={baudiosIngresados} onChange={(e) => setBaudiosIngresados(e.target.value)}></input>
          <button className="blue-background" type='submit'>Establecer</button>
        </div>
      </form>
    </div>
  )
}

const Paneles = ({datos}) => {
  return (
    <>
    {datos ? 
      <main>
        <div id="datos-alarmas">
            {/* {Datos} */}
            <PanelDatos datos={datos}/>

            {/* {Alarmas } */}
            <PanelAlarmas datos={datos}/>
        </div>

        {/* {Vista 3D} */}
        <section id="panel-3d" className="darkgray-background">
            <div id="contenedor-3d">
              <Canvas>
                <AnimacionCansat rotations={datos.rotaciones}/>
              </Canvas>
            </div>
        </section>
      </main>
    :
    <>
      <h2 className='notificacion verde'>Esperando datos...</h2>
      <div className='fondo-imagen'>
        <img src='../public/esperando-datos.png' height={400}></img>
      </div>
    </>
    }
    </>
  )
}

const PanelDato = ({nombre, unidad, datoRecibido}) => {
  return (
    <div className="panel-dato darkgray-background">
      <span>{nombre}:</span>
      <strong>{datoRecibido} {unidad}</strong>
    </div>
  )
}

const PanelDatos = ({datos}) => {
  return (
    <section id="panel-datos">
      <PanelDato nombre="Co2" unidad="ppm" datoRecibido={datos.co2}/>
      <PanelDato nombre="Velocidad Vertical" unidad="m/s" datoRecibido={datos.velocidad_vertical}/>
      <PanelDato nombre="Aceleración Neta" unidad="m/s²" datoRecibido={datos.aceleracion_neta}/>
      <PanelDato nombre="Temperatura" unidad="°C" datoRecibido={datos.temperatura}/>
      <PanelDato nombre="Presión" unidad="kPa" datoRecibido={datos.presion}/>
    </section>
  )
}

const PanelAlarmas = ({datos}) => {
  return (
    <section id="panel-alarmas" className="darkgray-background">
      <Alarma nombre='Temperatura' datoRecibido={datos.temperatura} min={-10} max={30}/>
      <Alarma nombre='Presión' datoRecibido={datos.presion} min={-10} max={30}/>
      <Alarma nombre='Inclinación X' datoRecibido={datos.rotaciones[0]} min={-10} max={Math.PI}/>
      <Alarma nombre='Inclinación Z' datoRecibido={datos.rotaciones[2]} min={-10} max={Math.PI}/>
    </section>
  )
}

const Alarma = ({nombre, datoRecibido, max, min}) => {
  let estadoLed = ['led-verde', 'led-apagado']
  if (datoRecibido > max || datoRecibido < min) {
    estadoLed = ['led-apagado','led-rojo']
  }

  return (
    <div className="panel-alarma">
      <span>{nombre}:</span>
      <div className="contenedor-led">
        <div className={estadoLed[0]}></div>
        <div className={estadoLed[1]}></div>
      </div>
    </div>
  )
}

const PosicionActualCansat = ({rotations}) => {
  return (
    <>
      <mesh rotation={rotations}>
      <boxGeometry args={[2,3.5,2]}/>
      <meshBasicMaterial color='gray' wireframe/>
      </mesh>
    </>
  )
}

const AnimacionCansat = ({rotations}) => {
  const meshRef = useRef()
  const renderizado = useRef(false)
  const primeraRotacion = useRef([0,0,0])

  if (!renderizado.current) {
    primeraRotacion.current = rotations
    console.log('Primera rotacion recibida: ', primeraRotacion.current)
    renderizado.current = true
  }

  useFrame((state, delta) => {
    if (delta > .1) {
      meshRef.current.rotation.set(rotations[0],rotations[1],rotations[2])
    }

    meshRef.current.rotation.x += (rotations[0] - meshRef.current.rotation.x) * delta * 2.5
    meshRef.current.rotation.y += (rotations[1] - meshRef.current.rotation.y) * delta * 2.5
    meshRef.current.rotation.z += (rotations[2] - meshRef.current.rotation.z) * delta * 2.5
  })

  return (
    <>
      <mesh ref={meshRef} rotation={primeraRotacion.current}>
        <boxGeometry args={[2,3.5,2]}/>
        <meshPhongMaterial color='deepskyblue'/>
      </mesh>
      <directionalLight position={[0.2,0,1]}/>
    </>
  )
}

export default App