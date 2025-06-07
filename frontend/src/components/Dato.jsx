const Dato = ({ nombre, unidad, datoRecibido }) => {
  return (
    <div className="panel-dato darkgray-background">
      <span>{nombre}:</span>
      <strong>
        {datoRecibido} {unidad}
      </strong>
    </div>
  )
}

export default Dato
