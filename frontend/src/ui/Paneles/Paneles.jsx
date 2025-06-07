import { Canvas } from '@react-three/fiber'
import PanelDatos from './PanelDatos/PanelDatos.jsx'
import PanelAlarmas from './PanelAlarmas/PanelAlarmas.jsx'
import PanelAnimacion3D from './PanelAnimacion3D/PanelAnimacion3D.jsx'

const Paneles = ({ datos }) => {
  return (
    <>
      {/* Cuando los datos llegan del back al front, renderizamos los paneles de
      datos, alarmas, y de animacion, cuando hay conexion antes de que lleguen
      los datos, se indica que se estan esperando */}
      {datos ? (
        <main>
          <div id="datos-alarmas">
            {/* {Datos} */}
            <PanelDatos datos={datos} />

            {/* {Alarmas } */}
            <PanelAlarmas datos={datos} />
          </div>

          {/* {Vista 3D} */}
          <section id="panel-3d" className="darkgray-background">
            <div id="contenedor-3d">
              <Canvas>
                <PanelAnimacion3D rotations={datos.rotaciones} />
              </Canvas>
            </div>
          </section>
        </main>
      ) : (
        <>
          <h2 className="notificacion verde">Esperando datos...</h2>
          <div className="fondo-imagen">
            <img src="/images/esperando-datos.png" height={400}></img>
          </div>
        </>
      )}
    </>
  )
}

export default Paneles
