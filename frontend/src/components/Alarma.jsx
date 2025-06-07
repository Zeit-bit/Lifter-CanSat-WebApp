const Alarma = ({ nombre, datoRecibido, max, min }) => {
  // Si el dato recibido esta fuera del rango establecido
  // intercambiamos la clase del led verde por apagado
  // y el apagado por rojo
  let estadoLed = ['led-verde', 'led-apagado']
  if (datoRecibido > max || datoRecibido < min) {
    estadoLed = ['led-apagado', 'led-rojo']
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

export default Alarma
