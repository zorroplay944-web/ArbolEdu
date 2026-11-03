// ===== Navegación entre módulos =====
const pestanas = document.querySelectorAll('.tab'); // Botones del menú superior
const secciones = document.querySelectorAll('.seccion'); // Las tres secciones de la página

pestanas.forEach(pestana => { // Recorre cada pestaña
  pestana.addEventListener('click', () => { // Al hacer clic en una pestaña
    pestanas.forEach(p => p.classList.remove('activo')); // Quita el resaltado de todas
    secciones.forEach(s => s.classList.remove('activa')); // Oculta todas las secciones
    pestana.classList.add('activo'); // Resalta la pestaña elegida
    document.getElementById(pestana.dataset.seccion).classList.add('activa'); // Muestra su sección
  }); // Fin del evento clic
}); // Fin del recorrido
