const Timestamp = () => {
  const date = new Date()
  const time = date.toLocaleString('es-MX', { hour12: false })
  const milisegundos = date.getMilliseconds().toString()
  return (`${time.split(' ')[1]}:${milisegundos}`)
}

export { Timestamp }
