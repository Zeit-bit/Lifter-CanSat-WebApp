import Dato from '../../../components/Dato.jsx'

const PanelDatos = ({ datos }) => {
  return (
    <section id="panel-datos">
      <Dato nombre="Co2" unidad="ppm" datoRecibido={datos.co2} />
      <Dato
        nombre="Velocidad Vertical"
        unidad="m/s"
        datoRecibido={datos.velocidad_vertical}
      />
      <Dato
        nombre="Aceleración Neta"
        unidad="m/s²"
        datoRecibido={datos.aceleracion_neta}
      />
      <Dato nombre="Temperatura" unidad="°C" datoRecibido={datos.temperatura} />
      <Dato nombre="Presión" unidad="kPa" datoRecibido={datos.presion} />
    </section>
  )
}

export default PanelDatos
