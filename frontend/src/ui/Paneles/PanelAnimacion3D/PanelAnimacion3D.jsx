import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const PanelAnimacion3D = (props) => {
  // En vez de deestructurar las props desde el inicio, modifico el valor de z
  // para coincidir con la orientacion correcta del cansat fisico
  // (se habia creado un espejo en este eje a la hora de utilizar el giroscopio fisico)
  const rotations = [
    props.rotations[0],
    props.rotations[1],
    props.rotations[2] * -1,
  ]

  const meshRef = useRef() // Creamos una referencia a la mesh del modelo para poder alterar su estado de rotacion con 'useFrame'

  // Creamos otras dos variables utilizando useRef, pero esta vez para poder cambiar el estado de las variables una unica vez en cada primer render
  const renderizado = useRef(false)
  const primeraRotacion = useRef([0, 0, 0])

  // Si todavia no se ha renderizado por primera vez, hacemos que el valor de 'primeraRotacion'
  // sea igual a los datos de rotacion mas recientes. Hacemos esto porque de lo contrario, en el caso de que
  // refresques la pagina y se vuelva a renderizar este componente, por defecto el modelo se situa con
  // una rotacion de [0,0,0] lo que conlleva a que al recibir el siguiente dato mas reciente real,
  // haya una disparidad muy grande entre los datos, lo que conlleva a que la interpolacion lineal
  // aparente moverse extremadamente rapido por unos instantes, antes de equilibrarse de nuevo.
  if (!renderizado.current) {
    primeraRotacion.current = rotations
    console.log('Primera rotacion recibida: ', primeraRotacion.current)
    renderizado.current = true
  }

  // hook que utilizamos para suavizar el movimiento cortado por el delay de los datos por las transmisiones,
  // utilizando interpolacion lineal, en la que por cada frame correspondiente a nuestra tasa de refresco, vamos
  // a aumentar su angulo en una fraccionada parte de lo que recibe del nuevo dato
  useFrame((_, delta) => {
    // Si el delta time es considerablemente grande, definimos la rotacion actual como la de los datos mas recientes,
    // hacemos esto porque de lo contrario, ocurriria el mismo fenomeno descrito anteriormente por el refresqueo de la pagina,
    // solo que en este caso ocurre, porque si cambias de pagina, la ejecucion se pausa, y al retornar la disparidad vuelve a ser
    // considerable, es por ello que el delta time tambien es considerablemente mas grande de lo normal y lo podemos usar para remediar el problema
    if (delta > 0.1) {
      meshRef.current.rotation.set(rotations[0], rotations[1], rotations[2])
    }

    // La diferencia entre el nuevo dato recibido y el actual, lo multiplicamos por delta,
    // para mantener una suavidad consistente entre distintas tasas de refresco, y luego por
    // un factor a gusto que representa la fraccion de la diferencia
    meshRef.current.rotation.x +=
      (rotations[0] - meshRef.current.rotation.x) * delta * 2.5
    meshRef.current.rotation.y +=
      (rotations[1] - meshRef.current.rotation.y) * delta * 2.5
    meshRef.current.rotation.z +=
      (rotations[2] - meshRef.current.rotation.z) * delta * 2.5
  })

  return (
    <>
      <mesh ref={meshRef} rotation={primeraRotacion.current}>
        <boxGeometry args={[2, 3.5, 2]} />
        <meshPhongMaterial color="deepskyblue" />
      </mesh>
      <directionalLight position={[0.2, 0, 1]} />
    </>
  )
}

export default PanelAnimacion3D
