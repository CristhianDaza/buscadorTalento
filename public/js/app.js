document.addEventListener('DOMContentLoaded', () => {
  const skills = document.querySelector('.lista-conocimientos')
  if (skills) {
    skills.addEventListener('click', agregarSkills)

    // una vez que estamos en editar, llamar la funcion
    skillSeleccionados()
  }
})

const skills = new Set()

const agregarSkills = e => {
  if (e.target.tagName === 'LI') {
    if(e.target.classList.contains('activo')){
      // quitarlo del set y quitar la clase
      skills.delete(e.target.textContent)
      e.target.classList.remove('activo')
    } else {
      // Agregarlo al set y agregar la clase
      skills.add(e.target.textContent)
      e.target.classList.add('activo')
    }
  }
  const skillsArray = [...skills]
  document.querySelector('#skills').value = skillsArray

}

const skillSeleccionados = () => {
  const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))

  seleccionados.forEach(seleccionada => {
    skills.add(seleccionada.textContent)
  })

  // inyectarlo en el hidden
  const skillsArray = [...skills]
  document.querySelector('#skills').value = skillsArray
}
