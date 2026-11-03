// Clase Nodo: representa un nodo individual del árbol binario
class Nodo { // Declara la clase Nodo
  constructor(valor, color) { // Constructor: recibe el dato y el color del nodo
    this.valor = valor; // Guarda el dato (número o carácter)
    this.color = color; // Guarda el color propio de este nodo
    this.izq = null; // Hijo izquierdo, vacío al crear el nodo
    this.der = null; // Hijo derecho, vacío al crear el nodo
  } // Fin del constructor
} // Fin de la clase Nodo
