// Escapa caracteres especiales para poder mostrarlos dentro de HTML o SVG
function escapar(t) { // Recibe un valor cualquiera
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sustituye &, < y >
} // Fin de escapar

// Clase Dibujante: dibuja un ArbolBinario en un lienzo SVG y permite navegarlo
// Disposición: x = posición inorden del nodo, y = nivel. Así ningún nodo se encima y se calcula en una sola pasada.
class Dibujante { // Declara la clase
  constructor(svg, alSeleccionar = null) { // Recibe el SVG y, opcionalmente, una función que avisa qué nodo está seleccionado
    this.svg = svg; // Guarda el lienzo
    this.contenedor = svg.parentElement; // Caja con scroll que contiene al lienzo
    this.alSeleccionar = alSeleccionar; // Función a llamar cuando cambia la selección (puede ser null)
    this.sepX = 60; // Separación horizontal entre nodos consecutivos
    this.sepY = 84; // Separación vertical entre niveles
    this.margen = 40; // Margen alrededor del dibujo
    this.radio = 24; // Radio de cada nodo
    this.zoom = 1; // Factor de acercamiento actual
    this.anchoBase = 320; // Ancho del dibujo sin zoom (se recalcula al dibujar)
    this.seleccionado = null; // Nodo tocado por el usuario
    this.huboArrastre = false; // Indica si el último gesto fue un arrastre (para no confundirlo con un clic)
    this.ultimoArbol = null; // Último árbol dibujado (sirve para redibujar)
    this.ultimosEstados = new Map(); // Últimos resaltados usados
    this.posFinal = new Map(); // Posición final de cada nodo en el SVG
    if (alSeleccionar) this.habilitarArrastre(); // Solo los lienzos interactivos permiten arrastrar
  } // Fin del constructor

  notificar() { // Avisa a quien escucha cuál es el nodo seleccionado
    if (this.alSeleccionar) this.alSeleccionar(this.seleccionado); // Llama a la función si existe
  } // Fin de notificar

  dibujar(arbol, estados = new Map()) { // Dibuja el árbol; estados: Map nodo -> clase CSS
    this.ultimoArbol = arbol; // Recuerda el árbol
    this.ultimosEstados = estados; // Recuerda los resaltados
    const lista = arbol.listar(); // Nodos en inorden con nivel y padre
    if (this.seleccionado !== null && !lista.some(e => e.nodo === this.seleccionado)) this.seleccionado = null; // Si el nodo seleccionado ya no existe, se deselecciona
    if (lista.length === 0) { // Si el árbol está vacío
      this.svg.setAttribute('width', 320); // Ancho del mensaje
      this.svg.setAttribute('height', 140); // Alto del mensaje
      this.svg.setAttribute('viewBox', '0 0 320 140'); // Coordenadas del mensaje
      this.svg.innerHTML = '<text x="160" y="70" fill="#a9a4d6" text-anchor="middle">Árbol vacío: inserta un valor</text>'; // Mensaje
      this.notificar(); // Avisa que no hay selección
      return; // No hay más que dibujar
    } // Fin del caso vacío
    const pos = new Map(); // Posición calculada de cada nodo
    const padreDe = new Map(); // Padre de cada nodo
    let maxNivel = 0; // Nivel más profundo encontrado
    lista.forEach((e, i) => { // Recorre los nodos en orden inorden
      pos.set(e.nodo, { x: this.margen + i * this.sepX, y: this.margen + e.nivel * this.sepY }); // x por índice, y por nivel
      padreDe.set(e.nodo, e.padre); // Guarda su padre
      maxNivel = Math.max(maxNivel, e.nivel); // Actualiza el nivel máximo
    }); // Fin del recorrido
    const anchoUtil = this.margen * 2 + (lista.length - 1) * this.sepX; // Ancho que ocupan los nodos
    const ancho = Math.max(320, anchoUtil); // Ancho total del lienzo (mínimo 320)
    const alto = this.margen * 2 + maxNivel * this.sepY; // Alto total del lienzo
    const desp = (ancho - anchoUtil) / 2; // Desplazamiento para centrar árboles pequeños
    this.anchoBase = ancho; // Guarda el ancho sin zoom
    this.svg.setAttribute('width', ancho * this.zoom); // Aplica el ancho con zoom
    this.svg.setAttribute('height', alto * this.zoom); // Aplica el alto con zoom
    this.svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`); // Sistema de coordenadas interno
    const enCamino = new Set(); // Nodos del camino desde la raíz hasta el seleccionado
    let subida = this.seleccionado; // Empieza en el nodo seleccionado
    while (subida) { enCamino.add(subida); subida = padreDe.get(subida); } // Sube hasta la raíz marcando el camino
    this.posFinal = new Map(); // Reinicia las posiciones finales
    let aristas = ''; // Texto SVG de las líneas
    let nodos = ''; // Texto SVG de los círculos
    lista.forEach(e => { // Recorre cada nodo
      const p = pos.get(e.nodo); // Posición del nodo
      const x = p.x + desp; // Coordenada x final
      const y = p.y; // Coordenada y final
      this.posFinal.set(e.nodo, { x, y }); // Guarda la posición para poder centrar la vista
      if (e.padre !== null) { // Si tiene padre, dibuja la arista hacia él
        const q = pos.get(e.padre); // Posición del padre
        const ruta = enCamino.has(e.nodo) ? ' ruta' : ''; // La arista brilla si está en el camino del nodo seleccionado
        aristas += `<line class="arista${ruta}" x1="${q.x + desp}" y1="${q.y}" x2="${x}" y2="${y}"/>`; // Línea padre-hijo
      } // Fin del if
      const sel = e.nodo === this.seleccionado; // ¿Es el nodo seleccionado?
      const clase = (estados.get(e.nodo) || '') + (sel ? ' sel' : ''); // Clases de estado y selección
      const interactivo = this.alSeleccionar ? ` tabindex="0" role="button" aria-label="Nodo ${escapar(e.nodo.valor)}"` : ''; // Atributos para clic y teclado
      const anillo = sel ? `<circle class="anillo" cx="${x}" cy="${y}" r="${this.radio + 8}"/>` : ''; // Anillo giratorio del seleccionado
      nodos += `<g class="nodo ${clase}"${interactivo}>${anillo}<circle class="cuerpo" cx="${x}" cy="${y}" r="${this.radio}" fill="${e.nodo.color}" style="filter:drop-shadow(0 0 7px ${e.nodo.color})"/><text x="${x}" y="${y}">${escapar(e.nodo.valor)}</text></g>`; // Nodo con brillo de su propio color
    }); // Fin del recorrido
    this.svg.innerHTML = aristas + nodos; // Aristas primero para que queden detrás de los nodos
    if (this.alSeleccionar) { // Si el lienzo es interactivo, conecta los eventos
      this.svg.querySelectorAll('g.nodo').forEach((g, i) => { // Recorre los grupos dibujados (mismo orden que la lista)
        g.addEventListener('click', () => { if (!this.huboArrastre) this.seleccionar(lista[i].nodo); }); // Clic: selecciona (si no fue arrastre)
        g.addEventListener('keydown', ev => { // Teclado: Enter o espacio también seleccionan
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.seleccionar(lista[i].nodo); } // Selecciona el nodo
        }); // Fin del evento de teclado
      }); // Fin del recorrido de grupos
    } // Fin del if interactivo
    this.notificar(); // Avisa cuál es la selección actual
  } // Fin de dibujar

  seleccionar(nodo) { // Selecciona un nodo, lo centra y actualiza el dibujo
    this.seleccionado = nodo; // Guarda la selección
    if (this.ultimoArbol) this.dibujar(this.ultimoArbol, this.ultimosEstados); // Redibuja con la selección
    this.centrar(nodo); // Lleva la vista hasta el nodo
  } // Fin de seleccionar

  centrar(nodo) { // Desplaza la caja para que el nodo quede en el centro
    const p = this.posFinal.get(nodo); // Posición del nodo
    if (!p) return; // Si no se dibujó, no hace nada
    const c = this.contenedor; // Caja con scroll
    c.scrollTo({ left: this.svg.offsetLeft + p.x * this.zoom - c.clientWidth / 2, top: this.svg.offsetTop + p.y * this.zoom - c.clientHeight / 2, behavior: 'smooth' }); // Desplazamiento suave hasta el nodo
  } // Fin de centrar

  cambiarZoom(factor) { // Acerca o aleja multiplicando el zoom
    this.zoom = Math.min(2.5, Math.max(0.3, this.zoom * factor)); // Limita el zoom entre 0.3 y 2.5
    if (this.ultimoArbol) this.dibujar(this.ultimoArbol, this.ultimosEstados); // Redibuja con el nuevo tamaño
  } // Fin de cambiarZoom

  ajustar() { // Ajusta el zoom para que todo el árbol quepa a lo ancho
    const disponible = this.contenedor.clientWidth - 24; // Ancho disponible en la caja
    this.zoom = Math.min(1.4, Math.max(0.3, disponible / this.anchoBase)); // Zoom que hace caber el árbol
    if (this.ultimoArbol) this.dibujar(this.ultimoArbol, this.ultimosEstados); // Redibuja
  } // Fin de ajustar

  habilitarArrastre() { // Permite mover el dibujo arrastrando con el mouse
    const c = this.contenedor; // Caja con scroll
    let activo = false, x0 = 0, y0 = 0, sl = 0, st = 0; // Estado del arrastre
    c.addEventListener('pointerdown', e => { // Al presionar el mouse
      if (e.pointerType !== 'mouse') return; // En pantallas táctiles el scroll nativo ya funciona
      activo = true; // Comienza el posible arrastre
      this.huboArrastre = false; // Aún no se ha movido
      x0 = e.clientX; y0 = e.clientY; // Punto de inicio
      sl = c.scrollLeft; st = c.scrollTop; // Scroll de inicio
    }); // Fin de pointerdown
    c.addEventListener('pointermove', e => { // Al mover el mouse
      if (!activo) return; // Solo si se está presionando
      const dx = e.clientX - x0, dy = e.clientY - y0; // Distancia recorrida
      if (Math.abs(dx) + Math.abs(dy) > 6) { this.huboArrastre = true; c.classList.add('arrastrando'); } // Pasado un umbral, es un arrastre
      if (this.huboArrastre) { c.scrollLeft = sl - dx; c.scrollTop = st - dy; } // Mueve el contenido
    }); // Fin de pointermove
    const fin = () => { activo = false; c.classList.remove('arrastrando'); }; // Termina el arrastre
    c.addEventListener('pointerup', fin); // Al soltar el mouse
    c.addEventListener('pointerleave', fin); // Al salir de la caja
  } // Fin de habilitarArrastre
} // Fin de la clase Dibujante
