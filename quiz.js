// ===== Módulo 3: Evaluador de competencias (Quiz) =====
const TOTAL_PREGUNTAS = 5; // Cantidad de preguntas por evaluación
const dibQuiz = new Dibujante(document.getElementById('lienzo-quiz')); // Dibujante del quiz
let numPregunta = 0; // Número de la pregunta actual
let aciertos = 0; // Respuestas correctas acumuladas
let esperado = []; // Secuencia correcta de la pregunta actual
let respondida = false; // Evita responder dos veces la misma pregunta

function mostrar(id, visible) { // Muestra u oculta un elemento por su id
  document.getElementById(id).classList.toggle('oculto', !visible); // Activa o quita la clase "oculto"
} // Fin de mostrar

function nuevaPregunta() { // Genera y muestra una pregunta nueva
  numPregunta++; // Avanza el contador
  const arbol = new ArbolBinario(); // Árbol nuevo para esta pregunta
  arbol.aleatorio(5 + Math.floor(Math.random() * 3), 1, 99); // Entre 5 y 7 valores aleatorios
  const tipos = ['preorden', 'inorden', 'postorden']; // Recorridos posibles
  const tipo = tipos[Math.floor(Math.random() * tipos.length)]; // Elige uno al azar
  esperado = arbol.secuencia(tipo).map(String); // Calcula la respuesta correcta como texto
  dibQuiz.dibujar(arbol); // Dibuja el árbol
  document.getElementById('quiz-progreso').textContent = `Pregunta ${numPregunta} de ${TOTAL_PREGUNTAS}`; // Muestra el progreso
  document.getElementById('quiz-pregunta').textContent = `Escribe el recorrido ${tipo.toUpperCase()} de este árbol.`; // Muestra la consigna
  document.getElementById('quiz-respuesta').value = ''; // Limpia el campo
  document.getElementById('quiz-feedback').textContent = ''; // Limpia el resultado anterior
  respondida = false; // Habilita responder
  mostrar('quiz-siguiente', false); // Oculta el botón Siguiente
  mostrar('quiz-comprobar', true); // Muestra el botón Comprobar
  document.getElementById('quiz-respuesta').focus(); // Pone el cursor en el campo
} // Fin de nuevaPregunta

function comprobar() { // Evalúa la respuesta escrita
  if (respondida) return; // Ya se respondió esta pregunta
  const texto = document.getElementById('quiz-respuesta').value.trim(); // Respuesta del estudiante
  const dada = texto.split(/[\s,;]+/).filter(x => x !== ''); // Separa por espacios, comas o punto y coma
  const correcta = dada.length === esperado.length && dada.every((v, i) => v === esperado[i]); // Compara posición por posición
  const fb = document.getElementById('quiz-feedback'); // Elemento del resultado
  if (correcta) { aciertos++; fb.textContent = '¡Correcto!'; fb.style.color = 'var(--verde)'; } // Suma un acierto
  else { fb.textContent = 'Incorrecto. Respuesta correcta: ' + esperado.join(' '); fb.style.color = 'var(--rojo)'; } // Muestra la solución
  respondida = true; // Bloquea nuevas respuestas
  mostrar('quiz-comprobar', false); // Oculta Comprobar
  document.getElementById('quiz-siguiente').textContent = numPregunta >= TOTAL_PREGUNTAS ? 'Ver calificación' : 'Siguiente'; // Texto según la etapa
  mostrar('quiz-siguiente', true); // Muestra Siguiente
} // Fin de comprobar

function finalizar() { // Muestra la calificación final
  const nota = Math.round((aciertos / TOTAL_PREGUNTAS) * 100); // Calificación sobre 100
  mostrar('quiz-juego', false); // Oculta las preguntas
  mostrar('quiz-final', true); // Muestra el resultado
  document.getElementById('quiz-nota').textContent = `Calificación: ${nota} / 100`; // Escribe la nota
  document.getElementById('quiz-detalle').textContent = `Acertaste ${aciertos} de ${TOTAL_PREGUNTAS} recorridos. ` + (nota >= 70 ? 'Aprobado.' : 'Repasa el módulo de teoría y practica en el simulador.'); // Detalle y consejo
} // Fin de finalizar

function iniciarQuiz() { // Reinicia y comienza la evaluación
  numPregunta = 0; // Reinicia el contador
  aciertos = 0; // Reinicia los aciertos
  mostrar('quiz-inicio', false); // Oculta la pantalla de inicio
  mostrar('quiz-final', false); // Oculta la pantalla final
  mostrar('quiz-juego', true); // Muestra las preguntas
  nuevaPregunta(); // Genera la primera pregunta
} // Fin de iniciarQuiz

document.getElementById('quiz-empezar').addEventListener('click', iniciarQuiz); // Botón Empezar
document.getElementById('quiz-reiniciar').addEventListener('click', iniciarQuiz); // Botón Intentar de nuevo
document.getElementById('quiz-comprobar').addEventListener('click', comprobar); // Botón Comprobar
document.getElementById('quiz-siguiente').addEventListener('click', () => { // Botón Siguiente
  if (numPregunta >= TOTAL_PREGUNTAS) finalizar(); else nuevaPregunta(); // Fin o siguiente pregunta
}); // Fin del botón siguiente
document.getElementById('quiz-respuesta').addEventListener('keydown', e => { if (e.key === 'Enter') comprobar(); }); // Enter comprueba
