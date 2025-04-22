import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame} from '@react-three/fiber'
import {io} from 'socket.io-client'
import './App.css'

const socket = io('http://localhost:3000/')

const App = () => {
  const [datos, setDatos] = useState(null)
  const [arduinoConectado, setEstadoArduino] = useState(false)
  const [puertosDisponibles, SetPuertosDisponibles] = useState([])
  useEffect(() => {
    socket.on('arduino-conectado', (estado) => {
      console.log('arduino conectado: ', estado)
      setEstadoArduino(estado)
    })

    socket.on('nuevos-datos', (datos) => {
      setDatos(datos)
    })

    socket.on('puertos-disponibles', (puertosRecibidos) => {
      SetPuertosDisponibles(puertosRecibidos)
    })

    return () => {
      socket.off('arduino-conectado')
      socket.off('nuevos-datos')
      socket.off('puertos-disponibles')
    }
  }, [])

  useEffect(() => {
    if (!arduinoConectado) {
      setDatos(null)
    }
  }, [arduinoConectado])

  return (
    <>
      <ConexionPuerto puertosDisponibles={puertosDisponibles} />
      <div className='container'>
      <h1 id='title'> - [ Lifter ] - </h1>
      {!arduinoConectado ? 
      <h2 className="notification">Arduino Desconectado</h2> 
      : 
      <Informacion datos={datos}></Informacion>
      }
      </div>

      {datos ? 
      <CansatPerspective rotations={datos.rotaciones}/> : null}
    </>
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
      <form onSubmit={handleSubmit}>
        <label>Puerto Seleccionado: </label>
        <select value={puertoSeleccionado} onChange={e => setPuertoSeleccionado(e.target.value)}>
        <option>--Selecciona puerto--</option>
          {
            puertosDisponibles.map(puerto => <option key={puerto.path}>{puerto.friendlyName}</option>)
          }
        </select>
        <br/>
        <label>Baudios: </label>
        <input type='number' value={baudiosIngresados} onChange={(e) => setBaudiosIngresados(e.target.value)}>
        </input>
        <button type='submit'>Establecer</button>
      </form>
    </div>
  )
}

const Informacion = ({datos}) => {
  return (
    <>
    {datos ? 
    <>
    <p className="datos">Co2: {datos.co2} ppm</p>
    <p className="datos">Temperatura: {datos.temperatura} °C</p>
    <p className="datos">Presion: {datos.presion} kPa</p>
    <p className="datos">Velocidad Vertical: {datos.velocidad_vertical} m/s</p>
    <p className="datos">Aceleracion Neta: {datos.aceleracion_neta} m/s²</p>
    </>
    :
    <h2 className="notification">Esperando datos...</h2>}
    </>
  )
}

const CansatPerspective = ({rotations}) => {
  const [showWireframe, setShowWireframe] = useState(true)
  return (
    <div className='container'>
      <Canvas>
        <AnimacionCansat rotations={rotations} />
        {showWireframe ?
        <PosicionActualCansat rotations={rotations} />
      : null}
      </Canvas>
      <button className="button" onClick={() => setShowWireframe(!showWireframe)}>Toggle Wireframe</button>
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