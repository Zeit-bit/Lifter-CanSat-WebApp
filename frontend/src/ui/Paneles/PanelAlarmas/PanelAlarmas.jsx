import Alarma from '../../../components/Alarma.jsx'

const PanelAlarmas = ({ datos }) => {
  return (
    <section id="panel-alarmas" className="darkgray-background">
      <Alarma
        nombre="Temperatura"
        datoRecibido={datos.temperatura}
        min={-10}
        max={40}
      />
      <Alarma
        nombre="Presión"
        datoRecibido={datos.presion}
        min={1000}
        max={1300}
      />
      <Alarma
        nombre="Inclinación X"
        datoRecibido={datos.rotaciones[0]}
        min={(-45 * Math.PI) / 180}
        max={(45 * Math.PI) / 180}
      />
      <Alarma
        nombre="Inclinación Z"
        datoRecibido={datos.rotaciones[2] * -1}
        min={(-45 * Math.PI) / 180}
        max={(45 * Math.PI) / 180}
      />
    </section>
  )
}

export default PanelAlarmas
