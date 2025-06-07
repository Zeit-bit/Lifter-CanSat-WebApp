// Funcion que formatea la hora y fecha actual, con base a lo solicitado (hh/mm/ss/ms, dd/mm/yyyy)
const Timestamp = () => {
  const date = new Date()
  const time = date.toLocaleString('es-MX', { hour12: false })
  const milisegundos = date.getMilliseconds().toString()

  const yyyy = date.getFullYear()
  let mm = date.getMonth() + 1
  let dd = date.getDate()

  if (dd < 10) dd = '0' + dd
  if (mm < 10) mm = '0' + mm

  const diaFormateado = `${dd}/${mm}/${yyyy}`

  return (`${time.split(' ')[1]}:${milisegundos}, ${diaFormateado}`)
}
export { Timestamp }
