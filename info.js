// Crea el panel que muestra la información del nodo tocado y los botones para navegar el árbol
function crearPanelInfo(panel, dib) { // Recibe el elemento del panel y el Dibujante asociado
  let enlaces = {}; // Nodos a los que se puede saltar: padre, izq, der, hermano
  let anterior = null; // Último HTML mostrado (evita redibujar sin necesidad)

  panel.addEventListener('click', ev => { // Un solo escuchador para todos los botones del panel
    const b = ev.target.closest('button[data-ir]'); // Busca el botón pulsado
    if (b && enlaces[b.dataset.ir]) dib.seleccionar(enlaces[b.dataset.ir]); // Salta al nodo correspondiente
  }); // Fin del escuchador

  const ficha = n => n === null ? '<span class="nada">ninguno</span>' : `<b class="mini" style="background:${n.color}">${escapar(n.valor)}</b>`; // Muestra un nodo como círculo de color, o "ninguno"

  return function (nodo) { // Función que se llama cada vez que cambia la selección
    const arbol = dib.ultimoArbol; // Árbol que se está mostrando
    let html; // Contenido nuevo del panel
    const i = (nodo !== null && arbol) ? arbol.info(nodo) : null; // Datos del nodo (o null si no hay selección)
    if (i === null) { // Si no hay nodo seleccionado
      enlaces = {}; // No hay a dónde saltar
      html = '<p class="vacio">Toca cualquier nodo del árbol para ver su tipo, padre, hijos, nivel y altura.</p>'; // Mensaje guía
    } else { // Si hay nodo seleccionado
      enlaces = { padre: i.padre, izq: i.izq, der: i.der, hermano: i.hermano }; // Guarda los destinos de navegación
      html = `
        <div class="info-cab"><span class="ficha" style="background:${nodo.color}">${escapar(i.valor)}</span><div><strong>${i.tipo}</strong><span class="sub">Nodo ${escapar(i.valor)}</span></div></div>
        <dl class="datos">
          <div><dt>Padre</dt><dd>${ficha(i.padre)}</dd></div>
          <div><dt>Hermano</dt><dd>${ficha(i.hermano)}</dd></div>
          <div><dt>Hijo izquierdo</dt><dd>${ficha(i.izq)}</dd></div>
          <div><dt>Hijo derecho</dt><dd>${ficha(i.der)}</dd></div>
          <div><dt>Nivel</dt><dd>${i.nivel}<small>aristas desde la raíz</small></dd></div>
          <div><dt>Altura</dt><dd>${i.altura}<small>árbol completo: ${i.alturaArbol}</small></dd></div>
          <div><dt>Hijos</dt><dd>${i.grado}<small>máximo 2</small></dd></div>
          <div><dt>Subárbol</dt><dd>${i.tamano}<small>nodos con él</small></dd></div>
          <div class="ancho"><dt>Camino desde la raíz</dt><dd class="camino">${i.camino.map(escapar).join(' → ')}</dd></div>
        </dl>
        <div class="nav-nodo">
          <button data-ir="padre" ${i.padre ? '' : 'disabled'}>Ir al padre</button>
          <button data-ir="hermano" ${i.hermano ? '' : 'disabled'}>Ir al hermano</button>
          <button data-ir="izq" ${i.izq ? '' : 'disabled'}>Ir al hijo izq.</button>
          <button data-ir="der" ${i.der ? '' : 'disabled'}>Ir al hijo der.</button>
        </div>`; // Plantilla con todos los datos del nodo y los botones de navegación
    } // Fin del if/else
    if (html !== anterior) { panel.innerHTML = html; anterior = html; } // Solo toca el DOM si cambió algo
  }; // Fin de la función devuelta
} // Fin de crearPanelInfo
