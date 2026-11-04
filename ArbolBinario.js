// Clase ArbolBinario: árbol binario de búsqueda implementado desde cero (sin estructuras nativas de árbol)
class ArbolBinario { // Declara la clase
  constructor() { // Constructor del árbol
    this.raiz = null; // El árbol inicia vacío
    this.contador = 0; // Cuenta los nodos creados para asignar colores distintos
  } // Fin del constructor

  generarColor() { // Crea un color distinto para cada nodo nuevo
    const tono = (this.contador * 137.508) % 360; // Ángulo áureo: tonos muy separados entre sí
    this.contador++; // Aumenta el contador para el siguiente nodo
    return `hsl(${tono.toFixed(0)}, 72%, 62%)`; // Devuelve el color en formato HSL
  } // Fin de generarColor 

comparar(a, b) { //este compara el tipo de dato 
    if (typeof a === typeof b) {//lo divide en tre letra (a)o num(b)
      return a < b ? -1 : (a > b ? 1 : 0); //regresa  si no es de la misma categoria
    } 
    return typeof a === 'number' ? -1 : 1; 
  } //termina el recorrido

  ruta(valor) { // Calcula el camino que sigue la búsqueda de un valor SIN modificar el árbol
    const pasos = []; // Lista de pasos {nodo, dir}
    let actual = this.raiz; // Empieza en la raíz
    while (actual !== null) { // Mientras haya un nodo que visitar
      const c = this.comparar(valor, actual.valor); // Compara el valor buscado con el nodo actual
      if (c === 0) { // Si son iguales
        pasos.push({ nodo: actual, dir: 'igual' }); // Registra el nodo como encontrado
        return { pasos, encontrado: true }; // Termina indicando que existe
      } // Fin del caso igual
      const dir = c < 0 ? 'izquierda' : 'derecha'; // Si es menor va a la izquierda, si no a la derecha
      pasos.push({ nodo: actual, dir }); // Registra el nodo y la dirección tomada
      actual = c < 0 ? actual.izq : actual.der; // Baja al hijo correspondiente
    } // Fin del ciclo
    return { pasos, encontrado: false }; // Llegó a un hueco: el valor no existe
  } // Fin de ruta

  insertar(valor) { // Inserta un valor; devuelve el nodo nuevo o null si ya existía
    if (this.ruta(valor).encontrado) return null; // No se permiten duplicados
    const nuevo = new Nodo(valor, this.generarColor()); // Crea el nodo con su color
    if (this.raiz === null) { this.raiz = nuevo; return nuevo; } // Si el árbol está vacío, el nodo es la raíz
    let actual = this.raiz; // Empieza a buscar la posición desde la raíz
    while (true) { // Ciclo hasta encontrar el hueco
      if (this.comparar(valor, actual.valor) < 0) { // Si el valor es menor, va a la izquierda
        if (actual.izq === null) { actual.izq = nuevo; return nuevo; } // Hueco libre: lo coloca aquí
        actual = actual.izq; // Si no, sigue bajando por la izquierda
      } else { // Si el valor es mayor, va a la derecha
        if (actual.der === null) { actual.der = nuevo; return nuevo; } // Hueco libre: lo coloca aquí
        actual = actual.der; // Si no, sigue bajando por la derecha
      } // Fin del if/else
    } // Fin del ciclo
  } // Fin de insertar

  eliminar(valor) { // Elimina un valor; devuelve true si existía
    const existe = this.ruta(valor).encontrado; // Verifica que el valor esté en el árbol
    if (existe) this.raiz = this._eliminarRec(this.raiz, valor); // Si existe, lo elimina recursivamente
    return existe; // Informa si se eliminó
  } // Fin de eliminar

  _eliminarRec(nodo, valor) { // Eliminación recursiva: devuelve la nueva raíz del subárbol
    if (nodo === null) return null; // Caso base: subárbol vacío
    const c = this.comparar(valor, nodo.valor); // Compara con el nodo actual
    if (c < 0) nodo.izq = this._eliminarRec(nodo.izq, valor); // Buscar a la izquierda
    else if (c > 0) nodo.der = this._eliminarRec(nodo.der, valor); // Buscar a la derecha
    else { // Nodo encontrado
      if (nodo.izq === null) return nodo.der; // Sin hijo izquierdo (hoja o un hijo): lo reemplaza el derecho
      if (nodo.der === null) return nodo.izq; // Sin hijo derecho: lo reemplaza el izquierdo
      let sucesor = nodo.der; // Dos hijos: busca el sucesor inorden en el subárbol derecho
      while (sucesor.izq !== null) sucesor = sucesor.izq; // El sucesor es el más a la izquierda
      nodo.valor = sucesor.valor; // Copia el valor del sucesor al nodo
      nodo.color = sucesor.color; // Copia también el color para que el valor conserve su color
      nodo.der = this._eliminarRec(nodo.der, sucesor.valor); // Elimina el sucesor original
    } // Fin del nodo encontrado
    return nodo; // Devuelve el nodo (posiblemente modificado)
  } // Fin de _eliminarRec

  recorrer(tipo) { // Genera la lista de eventos del recorrido ('preorden', 'inorden' o 'postorden')
    const eventos = []; // Lista de eventos {nodo, accion}
    this._rec(this.raiz, tipo, eventos); // Llena la lista recursivamente
    return eventos; // Devuelve los eventos para animarlos
  } // Fin de recorrer

  _rec(nodo, tipo, ev) { // Recursión del recorrido
    if (nodo === null) return; // Caso base: nodo vacío
    ev.push({ nodo, accion: 'entrar' }); // Se hace la llamada recursiva sobre este nodo
    if (tipo === 'preorden') ev.push({ nodo, accion: 'visitar' }); // Preorden: visita antes de los hijos
    this._rec(nodo.izq, tipo, ev); // Recorre el subárbol izquierdo
    if (tipo === 'inorden') ev.push({ nodo, accion: 'visitar' }); // Inorden: visita entre los hijos
    this._rec(nodo.der, tipo, ev); // Recorre el subárbol derecho
    if (tipo === 'postorden') ev.push({ nodo, accion: 'visitar' }); // Postorden: visita después de los hijos
    ev.push({ nodo, accion: 'salir' }); // Termina la llamada y regresa al padre
  } // Fin de _rec

  secuencia(tipo) { // Devuelve solo los valores en el orden en que se visitan
    return this.recorrer(tipo).filter(e => e.accion === 'visitar').map(e => e.nodo.valor); // Filtra visitas y toma el valor
  } // Fin de secuencia

  altura(nodo) { // Altura de un nodo: aristas hasta su hoja más profunda (hoja = 0)
    if (nodo === null) return -1; // Un subárbol vacío tiene altura -1
    return 1 + Math.max(this.altura(nodo.izq), this.altura(nodo.der)); // 1 + la mayor altura de los hijos
  } // Fin de altura

  listar() { // Lista los nodos en inorden con su nivel y su padre (sirve para dibujar)
    const lista = []; // Resultado
    this._listar(this.raiz, 0, null, lista); // Llena la lista recursivamente
    return lista; // Devuelve [{nodo, nivel, padre}]
  } // Fin de listar

  _listar(n, nivel, padre, lista) { // Recursión de listar
    if (n === null) return; // Caso base
    this._listar(n.izq, nivel + 1, n, lista); // Primero el subárbol izquierdo
    lista.push({ nodo: n, nivel, padre }); // Luego el nodo actual
    this._listar(n.der, nivel + 1, n, lista); // Al final el subárbol derecho
  } // Fin de _listar

  tamano(n) { // Cuenta los nodos de un subárbol
    if (n === null) return 0; // Subárbol vacío: cero nodos
    return 1 + this.tamano(n.izq) + this.tamano(n.der); // El nodo más sus dos subárboles
  } // Fin de tamano

  info(nodo) { // Reúne los datos de un nodo para el panel de información
    const lista = this.listar(); // Nodos con nivel y padre
    const e = lista.find(x => x.nodo === nodo); // Busca el nodo pedido
    if (!e) return null; // Si no está en el árbol, no hay datos
    const padre = e.padre; // Padre del nodo (null si es la raíz)
    const camino = []; // Camino de valores desde la raíz hasta el nodo
    let actual = nodo; // Empieza en el nodo y va subiendo
    while (actual !== null) { // Sube hasta pasar la raíz
      camino.unshift(actual.valor); // Inserta al inicio para que quede ordenado de raíz a nodo
      actual = lista.find(x => x.nodo === actual).padre; // Sube al padre del nodo actual
    } // Fin del ciclo
    const hoja = nodo.izq === null && nodo.der === null; // ¿No tiene hijos?
    let tipo = 'Nodo interno'; // Tipo por defecto: tiene padre e hijos
    if (padre === null && hoja) tipo = 'Raíz y hoja a la vez'; // Árbol de un solo nodo
    else if (padre === null) tipo = 'Nodo raíz'; // Sin padre
    else if (hoja) tipo = 'Hoja'; // Sin hijos
    let hermano = null; // Por defecto no tiene hermano
    if (padre !== null) hermano = padre.izq === nodo ? padre.der : padre.izq; // El otro hijo del mismo padre
    return { // Devuelve todos los datos juntos
      valor: nodo.valor, // Valor del nodo
      tipo, // Tipo de nodo
      padre, // Nodo padre (o null)
      izq: nodo.izq, // Hijo izquierdo (o null)
      der: nodo.der, // Hijo derecho (o null)
      hermano, // Nodo hermano (o null)
      nivel: e.nivel, // Aristas desde la raíz
      altura: this.altura(nodo), // Aristas hasta su hoja más profunda
      alturaArbol: this.altura(this.raiz), // Altura de todo el árbol
      grado: (nodo.izq ? 1 : 0) + (nodo.der ? 1 : 0), // Cantidad de hijos
      tamano: this.tamano(nodo), // Nodos en su subárbol (él incluido)
      camino // Valores desde la raíz hasta él
    }; // Fin del objeto
  } // Fin de info

  vaciar() { // Deja el árbol vacío
    this.raiz = null; // Elimina la raíz
    this.contador = 0; // Reinicia los colores
  } // Fin de vaciar

  aleatorio(cantidad, min, max) { // Llena el árbol con valores aleatorios distintos
    this.vaciar(); // Parte de un árbol vacío
    while (this.listar().length < cantidad) { // Hasta tener la cantidad pedida
      this.insertar(min + Math.floor(Math.random() * (max - min + 1))); // Inserta un número al azar (duplicados se ignoran)
    } // Fin del ciclo
  } // Fin de aleatorio
} // Fin de la clase ArbolBinario
