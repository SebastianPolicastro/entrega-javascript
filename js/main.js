document.addEventListener('DOMContentLoaded', iniciarApp);

const calculadora = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => (b !== 0 ? a / b : (mostrarMensaje("No se puede dividir por cero"), null)),
};

let registrosUsuarios = [];
let usuarioActual;

async function iniciarApp() {
  await obtenerRegistrosUsuarios();


  document.getElementById('registrarBtn').addEventListener('click', registrarUsuario);
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('calcularPromedioBtn').addEventListener('click', mostrarCalculoPromedio);
  document.getElementById('realizarOperacionBtn').addEventListener('click', realizarOperacionMatematica);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  const operacionButtons = document.querySelectorAll('.operacionBtn');
  operacionButtons.forEach(button => button.addEventListener('click', realizarOperacionMatematica));
  
  };



async function obtenerRegistrosUsuarios() {
  try {
    const response = await fetch('registro_usuarios.json');
    if (!response.ok) {
      throw new Error('Error al obtener los registros de usuarios.');
    }
    registrosUsuarios = await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

async function registrarUsuario() {
  const nombreUsuario = document.getElementById('nombreUsuario').value.trim().toLowerCase();
  const nuevaContrasena = document.getElementById('contrasena').value;
  
  if (nombreUsuario === '' || nuevaContrasena === '') {
    mostrarMensaje("Por favor, ingrese un nombre de usuario y contraseña.");
    return;
  }

  const usuarioExistente = registrosUsuarios.find((usuario) => usuario.nombre === nombreUsuario);

  if (usuarioExistente) {
    mostrarMensaje("El nombre de usuario ya está en uso. Por favor, elija otro.");
    return;
  }

  
  const nuevoUsuario = {
    nombre: nombreUsuario,
    pass: nuevaContrasena,
  };

  registrosUsuarios.push(nuevoUsuario);
  localStorage.setItem('registrosUsuarios', JSON.stringify(registrosUsuarios));
  mostrarMensaje("Usuario registrado correctamente", 'success');
  habilitarOpciones();
}

async function login() {
  const nombreUsuario = document.getElementById('nombreUsuario').value.toLowerCase();
  const passUsuario = document.getElementById('contrasena').value;

  const usuarioEncontrado = registrosUsuarios.find(
    (usuario) => usuario.nombre === nombreUsuario && usuario.pass === passUsuario
  );

  if (usuarioEncontrado) {
    usuarioActual = usuarioEncontrado;
    mostrarMensaje("Logueado correctamente", 'success');
    document.getElementById('formulario').style.display = 'none';
    document.getElementById('logged-in').style.display = 'block';
    habilitarOpciones();
  } else {
    mostrarMensaje("Nombre de usuario o contraseña incorrectos.");
  }
}

function logout() {
  usuarioActual = null;
  document.getElementById('formulario').style.display = 'block';
  document.getElementById('logged-in').style.display = 'none';
  resetearInterfaz();
  mostrarMensaje("Sesión cerrada", 'success');
}

function habilitarOpciones() {
  document.getElementById('menuButtons').style.display = 'block';
}

function manejarSeleccionMenu() {
  resetearInterfaz();

  const eleccion = this.id;

  switch (eleccion) {
    case "calculoPromedioBtn":
      mostrarCalculoPromedio();
      break;
    case "operacionesMatematicasBtn":
      mostrarOperacionesMatematicas();
      break;
    case "logoutBtn":
      logout();
      break;
    default:
      mostrarMensaje("Seleccione una opción válida");
      break;
  }
}

function mostrarCalculoPromedio() {
  resetearInterfaz();
  const cantidadNotasInput = document.getElementById('cantidadNotas');
  if (cantidadNotasInput) {
    cantidadNotasInput.value = '';
  }

  document.getElementById('calculoPromedio').style.display = 'block';

  const calcularPromedioBtn = document.getElementById('realizarCalculoPromedioBtn');
  calcularPromedioBtn.addEventListener('click', calcularPromedio);
}

function mostrarOperacionesMatematicas() {
  resetearInterfaz();
  const num1Input = document.getElementById('num1');
  const num2Input = document.getElementById('num2');

  if (num1Input) {
    num1Input.value = '';
  }

  if (num2Input) {
    num2Input.value = '';
  }

  document.getElementById('operacionesMatematicas').style.display = 'block';
}

document.getElementById('operacionesMatematicasBtn').addEventListener('click', mostrarOperacionesMatematicas);

async function realizarOperacionMatematica() {
  const num1 = Number(document.getElementById('num1').value);
  const num2 = Number(document.getElementById('num2').value);
  const operacion = this.dataset.operacion;

  if (!isNaN(num1) && !isNaN(num2)) {
    const resultado =
      operacion in calculadora
        ? calculadora[operacion](num1, num2)
        : (mostrarMensaje("Operación no válida. Utilice +, -, *, /"), null);

    mostrarResultado(resultado);
  } else {
    mostrarMensaje("Por favor, ingrese números válidos para realizar la operación.");
  }
}

function seleccionarOperacion() {
  const operacion = this.dataset.operacion;
  const operacionInput = document.getElementById('operacion');

  if (operacionInput) {
    operacionInput.value = operacion;
  } else {
    console.error("No se encontró el elemento con ID 'operacion'");
  }
}
function mostrarResultado(resultado) {
  if (resultado !== null) {
    mostrarMensaje(`Resultado: ${resultado}`, 'success');
  }
}

async function calcularPromedio() {
  const cantidadNotas = Number(document.getElementById('cantidadNotas').value);

  if (isNaN(cantidadNotas) || cantidadNotas <= 0 || cantidadNotas >= 11) {
    mostrarMensaje("Ingrese un número válido, mayor que cero y menor que diez para la cantidad de notas");
    return;
  }

  const notasContainer = document.getElementById('notasContainer');
  notasContainer.innerHTML = '';

  for (let i = 0; i < cantidadNotas; i++) {
    const notaInput = document.createElement('input');
    notaInput.type = 'number';
    notaInput.placeholder = `Ingresa tu nota Nro ${i + 1}`;
    notaInput.classList.add('nota-input');
    notasContainer.appendChild(notaInput);
  }

  const calcularPromedioBtn = document.createElement('button');
  calcularPromedioBtn.textContent = 'Calcular Promedio';
  calcularPromedioBtn.addEventListener('click', function() {
    const notaInputs = document.querySelectorAll('.nota-input');
    const notasNumericas = Array.from(notaInputs).map((notaInput) => Number(notaInput.value));

    if (notasNumericas.some((nota) => isNaN(nota))) {
      mostrarMensaje("Por favor, ingrese notas válidas.");
      return;
    }

    const sumador = notasNumericas.reduce((acc, nota) => acc + nota, 0);
    const promedio = sumador / notasNumericas.length;

    mostrarMensaje(`El promedio de ${usuarioActual.nombre} es ${promedio.toFixed(2)}`, 'success');
  });

  notasContainer.appendChild(calcularPromedioBtn);
}

function resetearInterfaz() {
  const calculoPromedioDiv = document.getElementById('calculoPromedio');
  const operacionesMatematicasDiv = document.getElementById('operacionesMatematicas');
  const num1Input = document.getElementById('num1');
  const num2Input = document.getElementById('num2');
  const operacionInput = document.getElementById('operacion');
  const cantidadNotasInput = document.getElementById('cantidadNotas');

  if (calculoPromedioDiv) {
    calculoPromedioDiv.style.display = 'none';
  }

  if (operacionesMatematicasDiv) {
    operacionesMatematicasDiv.style.display = 'none';
  }

  if (num1Input) {
    num1Input.value = '';
  }

  if (num2Input) {
    num2Input.value = '';
  }

  if (operacionInput) {
    operacionInput.value = '+';
  }

  if (cantidadNotasInput) {
    cantidadNotasInput.value = '';
  }

  document.getElementById('realizarOperacionBtn').style.display = 'none';
}

function mostrarMensaje(mensaje, tipo = 'error') {
  Swal.fire({
    icon: tipo === 'error' ? 'error' : 'success',
    text: mensaje,
    showConfirmButton: false,
    timer: 3000
  });
}