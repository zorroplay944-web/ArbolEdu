// ===== Módulo 1: Simulador visual e interactivo =====
const arbolSim = new ArbolBinario(); // Árbol propio del simulador
const panelInfoSim = document.getElementById('info-nodo'); // Panel donde se muestra la información del nodo tocado
const dibSim = new Dibujante(document.getElementById('lienzo-sim'), nodo => mostrarInfoSim(nodo)); // Dibujante con nodos que se pueden tocar
const mostrarInfoSim = crearPanelInfo(panelInfoSim, dibSim); // Función que llena el panel de información
const estadosSim = new Map(); // Mapa nodo -> clase visual (resaltados)
const consolaSim = document.getElementById('consola-sim'); // Consola integrada
const salidaSim = document.getElementById('salida-sim'); // Línea con la secuencia del recorrido
const entradaSim = document.getElementById('entrada-valor'); // Campo donde se escribe el valor
const velocidadSim = document.getElementById('velocidad'); // Control deslizante de velocidad
const botonesSim = document.querySelectorAll('#sim-controles button'); // Todos los botones de control
let ocupadoSim = false; // Evita lanzar dos animaciones a la vez

function pintarSim() { dibSim.dibujar(arbolSim, estadosSim); } // Redibuja el árbol con los resaltados actuales

function pausaSim() { // Espera según la velocidad elegida
  const ms = 1150 - Number(velocidadSim.value) * 100; // Más velocidad = menos espera
  return new Promise(resolver => setTimeout(resolver, ms)); // Devuelve una promesa que se cumple tras la espera
} // Fin de pausaSim

function logSim(texto, tipo = 'info') { // Escribe una línea en la consola integrada
  const linea = document.createElement('div'); // Crea el contenedor de la línea
  linea.className = 'linea ' + tipo; // Asigna el color según el tipo
  linea.textContent = '> ' + texto; // Escribe el mensaje
  consolaSim.appendChild(linea); // Lo agrega a la consola
  consolaSim.scrollTop = consolaSim.scrollHeight; // Baja el scroll al último mensaje
} // Fin de logSim

function leerValor() { // Lee el valor escrito: número o un solo carácter
  const t = entradaSim.value.trim(); // Texto sin espacios sobrantes
  if (t === '') return undefined; // Vacío: no es válido
  if (!isNaN(Number(t))) return Number(t); // Si es numérico, lo convierte a número
  if (t.length === 1) return t; // Si es un solo carácter, lo usa tal cual
  return undefined; // Cualquier otra cosa no es válida
} // Fin de leerValor

async function ejecutarSim(accion) { // Envuelve cada acción: bloquea botones mientras anima
  if (ocupadoSim) return; // Si ya hay una animación, ignora
  ocupadoSim = true; // Marca como ocupado
  botonesSim.forEach(b => { b.disabled = true; }); // Desactiva los botones
  try { await accion(); } // Ejecuta la acción pedida
  finally { // Siempre al terminar
    estadosSim.clear(); // Quita los resaltados
    pintarSim(); // Redibuja el árbol limpio
    botonesSim.forEach(b => { b.disabled = false; }); // Reactiva los botones
    ocupadoSim = false; // Libera el bloqueo
  } // Fin del finally
} // Fin de ejecutarSim

async function animarRuta(valor) { // Anima el camino que sigue un valor desde la raíz
  const r = arbolSim.ruta(valor); // Calcula el camino sin modificar el árbol
  for (const p of r.pasos) { // Recorre cada paso
    estadosSim.set(p.nodo, 'visita'); // Marca el nodo como visitado en el camino
    pintarSim(); // Muestra el resaltado
    if (p.dir === 'igual') logSim(`${valor} = ${p.nodo.valor}: coincide.`, 'ok'); // Encontró el valor
    else logSim(`${valor} ${p.dir === 'izquierda' ? '<' : '>'} ${p.nodo.valor} → ir a la ${p.dir}`); // Explica la decisión
    await pausaSim(); // Espera para que se aprecie el paso
  } // Fin del ciclo
  return r; // Devuelve el resultado de la ruta
} // Fin de animarRuta

async function insertarSim() { // Inserta con animación paso a paso
  const v = leerValor(); // Lee el valor
  if (v === undefined) { logSim('Escribe un número o un solo carácter.', 'error'); return; } // Valida la entrada
  logSim(`Insertar ${v}: buscando su posición.`, 'tenue'); // Aviso inicial
  const r = await animarRuta(v); // Anima el camino
  if (r.encontrado) { logSim(`${v} ya existe; no se permiten duplicados.`, 'error'); return; } // Rechaza duplicados
  const nuevo = arbolSim.insertar(v); // Inserta realmente en el árbol
  estadosSim.clear(); // Limpia los resaltados del camino
  estadosSim.set(nuevo, 'nuevo'); // Resalta el nodo nuevo
  pintarSim(); // Redibuja con el nodo nuevo
  logSim(`${v} insertado.`, 'ok'); // Confirma
  entradaSim.value = ''; // Vacía el campo
  await pausaSim(); // Pausa final
} // Fin de insertarSim

async function eliminarSim() { // Elimina con animación paso a paso
  const v = leerValor(); // Lee el valor
  if (v === undefined) { logSim('Escribe un número o un solo carácter.', 'error'); return; } // Valida la entrada
  logSim(`Eliminar ${v}: buscando el nodo.`, 'tenue'); // Aviso inicial
  const r = await animarRuta(v); // Anima el camino
  if (!r.encontrado) { logSim(`${v} no existe en el árbol.`, 'error'); return; } // No hay nada que borrar
  const nodo = r.pasos[r.pasos.length - 1].nodo; // Nodo encontrado
  estadosSim.set(nodo, 'eliminar'); // Lo marca en rojo
  pintarSim(); // Muestra el marcado
  const sinIzq = nodo.izq === null; // ¿No tiene hijo izquierdo?
  const sinDer = nodo.der === null; // ¿No tiene hijo derecho?
  if (sinIzq && sinDer) logSim('Caso 1: es hoja, se quita directamente.'); // Caso hoja
  else if (sinIzq || sinDer) logSim('Caso 2: tiene un hijo, el hijo ocupa su lugar.'); // Caso un hijo
  else logSim('Caso 3: tiene dos hijos, lo reemplaza su sucesor inorden.'); // Caso dos hijos
  await pausaSim(); // Pausa para leer
  arbolSim.eliminar(v); // Elimina realmente
  estadosSim.clear(); // Limpia resaltados
  pintarSim(); // Redibuja sin el nodo
  logSim(`${v} eliminado.`, 'ok'); // Confirma
  entradaSim.value = ''; // Vacía el campo
  await pausaSim(); // Pausa final
} // Fin de eliminarSim

async function buscarSim() { // Busca resaltando el camino
  const v = leerValor(); // Lee el valor
  if (v === undefined) { logSim('Escribe un número o un solo carácter.', 'error'); return; } // Valida la entrada
  logSim(`Buscar ${v}.`, 'tenue'); // Aviso inicial
  const r = await animarRuta(v); // Anima el camino
  if (r.encontrado) { // Si lo encontró
    estadosSim.set(r.pasos[r.pasos.length - 1].nodo, 'encontrado'); // Marca el nodo en verde
    pintarSim(); // Muestra el marcado
    logSim(`${v} encontrado en ${r.pasos.length} paso(s).`, 'ok'); // Informa pasos
  } else { // Si no lo encontró
    logSim(`${v} no está en el árbol (se llegó a un hueco).`, 'error'); // Informa que no existe
  } // Fin del if/else
  await pausaSim(); // Pausa final
} // Fin de buscarSim

async function recorridoSim(tipo) { // Anima un recorrido simulando la recursividad
  if (arbolSim.raiz === null) { logSim('El árbol está vacío.', 'error'); return; } // Necesita nodos
  logSim(`Recorrido ${tipo}.`, 'tenue'); // Aviso inicial
  const pila = []; // Pila de llamadas recursivas activas
  const visitados = new Set(); // Nodos ya visitados
  const salida = []; // Valores en orden de visita
  salidaSim.textContent = `Salida (${tipo}): `; // Reinicia la línea de salida
  for (const e of arbolSim.recorrer(tipo)) { // Recorre cada evento generado por la lógica
    if (e.accion === 'entrar') { pila.push(e.nodo); logSim(`llamada(${e.nodo.valor})`, 'tenue'); } // Entra a una llamada
    else if (e.accion === 'visitar') { // Visita el nodo
      visitados.add(e.nodo); // Lo marca como visitado
      salida.push(e.nodo.valor); // Lo agrega a la salida
      salidaSim.textContent = `Salida (${tipo}): ` + salida.join(' → '); // Actualiza la salida
      logSim(`visita ${e.nodo.valor}`, 'ok'); // Lo imprime en la consola
    } else { pila.pop(); } // Sale de la llamada: regresa al padre
    estadosSim.clear(); // Reconstruye los resaltados
    visitados.forEach(n => estadosSim.set(n, 'visitado')); // Visitados en verde
    pila.forEach(n => estadosSim.set(n, 'pila')); // Llamadas pendientes con borde punteado
    if (pila.length > 0) estadosSim.set(pila[pila.length - 1], 'actual'); // El puntero está en el último
    pintarSim(); // Redibuja
    await pausaSim(); // Espera entre eventos
  } // Fin del ciclo
  logSim('Recorrido terminado: ' + salida.join(', '), 'ok'); // Resultado final
} // Fin de recorridoSim

document.getElementById('btn-insertar').addEventListener('click', () => ejecutarSim(insertarSim)); // Botón Insertar
document.getElementById('btn-eliminar').addEventListener('click', () => ejecutarSim(eliminarSim)); // Botón Eliminar
document.getElementById('btn-buscar').addEventListener('click', () => ejecutarSim(buscarSim)); // Botón Buscar
document.getElementById('btn-preorden').addEventListener('click', () => ejecutarSim(() => recorridoSim('preorden'))); // Botón Preorden
document.getElementById('btn-inorden').addEventListener('click', () => ejecutarSim(() => recorridoSim('inorden'))); // Botón Inorden
document.getElementById('btn-postorden').addEventListener('click', () => ejecutarSim(() => recorridoSim('postorden'))); // Botón Postorden
document.getElementById('btn-aleatorio').addEventListener('click', () => { // Botón Árbol aleatorio
  if (ocupadoSim) return; // No interrumpe una animación
  arbolSim.aleatorio(7, 1, 99); // Genera 7 valores aleatorios
  estadosSim.clear(); // Limpia resaltados
  pintarSim(); // Dibuja el nuevo árbol
  logSim('Árbol aleatorio generado.', 'ok'); // Informa
}); // Fin del botón aleatorio
document.getElementById('btn-limpiar').addEventListener('click', () => { // Botón Limpiar
  if (ocupadoSim) return; // No interrumpe una animación
  arbolSim.vaciar(); // Vacía el árbol
  salidaSim.textContent = 'Salida: (ejecuta un recorrido)'; // Reinicia la salida
  pintarSim(); // Dibuja el árbol vacío
  logSim('Árbol vaciado.', 'tenue'); // Informa
}); // Fin del botón limpiar
entradaSim.addEventListener('keydown', e => { if (e.key === 'Enter') ejecutarSim(insertarSim); }); // Enter inserta

[50, 30, 70, 20, 40, 60, 80].forEach(v => arbolSim.insertar(v)); // Árbol inicial de ejemplo
pintarSim(); // Primer dibujo
logSim('Bienvenido a ArbolEdu. Escribe un valor e inserta, busca o elimina.', 'tenue'); // Mensaje de bienvenida

document.getElementById('zoom-mas').addEventListener('click', () => dibSim.cambiarZoom(1.2)); // Botón + : acerca el árbol
document.getElementById('zoom-menos').addEventListener('click', () => dibSim.cambiarZoom(1 / 1.2)); // Botón − : aleja el árbol
document.getElementById('zoom-ajustar').addEventListener('click', () => dibSim.ajustar()); // Botón Ajustar: el árbol cabe a lo ancho
