import ConexionPuerto from './ConexionPuerto/ConexionPuerto.jsx'

const Encabezado = ({ puertosDisponibles, puertoEstablecido }) => {
  return (
    <header id="encabezado">
      <h1 id="encabezado-titulo" className="blue-background">
        [ LIFTER ]
      </h1>
      <div id="encabezado-conexion">
        <div id="conexion-seleccion" className="darkgray-background">
          <p>Puerto establecido:</p>
          <span id="nombre-puerto">{puertoEstablecido}</span>
        </div>
        <ConexionPuerto puertosDisponibles={puertosDisponibles} />
      </div>
    </header>
  )
}

export default Encabezado
