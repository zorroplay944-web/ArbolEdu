// ===== Módulo 2: Bloque teórico y glosario dinámico =====
const arbolTeo = new ArbolBinario(); // Árbol de ejemplo para la teoría
[50, 30, 70, 20, 40, 60, 80, 10].forEach(v => arbolTeo.insertar(v)); // Lo llena con valores fijos
const dibTeo = new Dibujante(document.getElementById('lienzo-teoria')); // Dibujante del módulo
const estadosTeo = new Map(); // Resaltados de la teoría
const listaTeo = arbolTeo.listar(); // Nodos con nivel y padre

function descendientes(nodo) { // Devuelve un nodo y todos sus descendientes (un subárbol)
  if (nodo === null) return []; // Subárbol vacío
  return [nodo, ...descendientes(nodo.izq), ...descendientes(nodo.der)]; // Nodo + subárbol izquierdo + derecho
} // Fin de descendientes

function caminoLargo(nodo) { // Camino desde un nodo hasta su hoja más profunda
  if (nodo === null) return []; // Subárbol vacío
  const a = caminoLargo(nodo.izq); // Camino más largo por la izquierda
  const b = caminoLargo(nodo.der); // Camino más largo por la derecha
  return [nodo, ...(a.length >= b.length ? a : b)]; // Nodo + el camino más largo de los dos
} // Fin de caminoLargo

const conceptos = [ // Lista de conceptos del glosario
  { titulo: 'Nodo raíz', texto: 'Es el nodo superior del árbol y el único que no tiene padre. Aquí es el 50. Todo recorrido y toda búsqueda empiezan en él.', marcar: () => listaTeo.filter(e => e.padre === null).map(e => e.nodo) }, // Raíz
  { titulo: 'Padre', texto: 'Un nodo es padre si tiene al menos un hijo. El 50 es padre del 30 y del 70.', marcar: () => listaTeo.filter(e => e.nodo.izq || e.nodo.der).map(e => e.nodo) }, // Padres
  { titulo: 'Hijos', texto: 'Los hijos son los nodos que cuelgan de otro. Cada nodo tiene como máximo dos: izquierdo y derecho. Todos los nodos, excepto la raíz, son hijos de alguien.', marcar: () => listaTeo.filter(e => e.padre !== null).map(e => e.nodo) }, // Hijos
  { titulo: 'Hermanos', texto: 'Son los nodos que comparten el mismo padre. El 30 y el 70 son hermanos porque ambos son hijos del 50.', marcar: () => listaTeo.filter(e => e.padre && e.padre.valor === 50).map(e => e.nodo) }, // Hermanos
  { titulo: 'Hojas', texto: 'Son los nodos sin hijos. Aquí son 10, 40, 60 y 80. Eliminar una hoja es el caso más sencillo.', marcar: () => listaTeo.filter(e => !e.nodo.izq && !e.nodo.der).map(e => e.nodo) }, // Hojas
  { titulo: 'Subárbol', texto: 'Cada nodo es la raíz de su propio árbol más pequeño. El subárbol izquierdo de la raíz está formado por el 30 y todo lo que cuelga de él.', marcar: () => descendientes(arbolTeo.raiz.izq) }, // Subárbol
  { titulo: 'Nivel', texto: 'El nivel indica cuántas aristas hay entre un nodo y la raíz. La raíz está en el nivel 0, sus hijos en el 1 y así sucesivamente. Se resaltan los del nivel 2.', marcar: () => listaTeo.filter(e => e.nivel === 2).map(e => e.nodo) }, // Nivel
  { titulo: 'Altura', texto: `La altura del árbol es el número de aristas del camino más largo desde la raíz hasta una hoja. Aquí es ${arbolTeo.altura(arbolTeo.raiz)}. Se resalta ese camino.`, marcar: () => caminoLargo(arbolTeo.raiz) } // Altura
]; // Fin de la lista de conceptos

function mostrarConcepto(c, boton) { // Muestra un concepto y resalta sus nodos
  const marcados = new Set(c.marcar()); // Nodos que cumplen el concepto
  estadosTeo.clear(); // Limpia estados anteriores
  listaTeo.forEach(e => estadosTeo.set(e.nodo, marcados.has(e.nodo) ? 'marca' : 'tenue')); // Resalta unos y atenúa el resto
  dibTeo.dibujar(arbolTeo, estadosTeo); // Redibuja
  document.getElementById('teoria-titulo').textContent = c.titulo; // Escribe el título
  document.getElementById('teoria-texto').textContent = c.texto; // Escribe la explicación
  document.querySelectorAll('#lista-conceptos button').forEach(b => b.classList.remove('activo')); // Quita la selección previa
  boton.classList.add('activo'); // Marca el botón elegido
} // Fin de mostrarConcepto

const contenedorConceptos = document.getElementById('lista-conceptos'); // Contenedor de los botones
conceptos.forEach(c => { // Crea un botón por concepto
  const b = document.createElement('button'); // Crea el botón
  b.textContent = c.titulo; // Pone el nombre del concepto
  b.addEventListener('click', () => mostrarConcepto(c, b)); // Al pulsar, muestra el concepto
  contenedorConceptos.appendChild(b); // Lo agrega a la página
}); // Fin de la creación de botones
mostrarConcepto(conceptos[0], contenedorConceptos.firstChild); // Muestra el primer concepto al cargar
