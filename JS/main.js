
// Seleccionamos los elementos del DOM con querySelector y guardamos sus referencias en variables
const form = document.querySelector(".grocery-form"); // Formulario
const alert = document.querySelector(".alert"); // Elemento de alerta
const grocery = document.getElementById("grocery"); // Campo de texto para ingresar las tareas
const submitBtn = document.querySelector(".submit-btn"); // Botón de "Agregar"
const container = document.querySelector(".grocery-container"); // Contenedor de la lista de tareas
const list = document.querySelector(".grocery-list"); // Lista de tareas
const clearBtn = document.querySelector(".clear-btn"); // Botón de "Limpiar Todo"
const checkBtn = document.querySelector(".complete-btn"); // Checkbox para marcar como completado

// Variables para opciones de edición
let editElement;
let editFlag = false;
let editID = "";

/* Eventos de la lista */

// Evento para enviar datos del formulario al agregar una nueva tarea
form.addEventListener("submit", addItem);

// Evento para limpiar todos los elementos de la lista
clearBtn.addEventListener("click", clearItems);

// Evento que se dispara cuando se carga la página para mostrar los elementos almacenados
window.addEventListener("DOMContentLoaded", setupItems);


/* Principales Funciones */

// Función para agregar una nueva tarea al formulario
function addItem(e) 
{
  e.preventDefault();
  const value = grocery.value;
  const id = new Date().getTime().toString();

  if (value !== "" && !editFlag) 
  {
    // Creamos un nuevo elemento de tarea y lo agregamos a la lista
    const element = document.createElement("article");
    let attr = document.createAttribute("data-id");
    attr.value = id;
    element.setAttributeNode(attr);
    element.classList.add("grocery-item");
    element.innerHTML = `
      <input type="checkbox" class="complete-btn">
      <p class="title">${value}</p>
      <div class="btn-container">
        <!-- Botón para editar -->
        <button type="button" class="edit-btn">
          <i class="fas fa-edit"></i>
        </button>
        <!-- Botón para eliminar -->
        <button type="button" class="delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Agregamos eventos a los botones de editar, eliminar y completar
    const deleteBtn = element.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", deleteItem);
    const editBtn = element.querySelector(".edit-btn");
    editBtn.addEventListener("click", editItem);
    const checkBtn = element.querySelector(".complete-btn");
    checkBtn.addEventListener("click", completeItem);

    // Agregamos el nuevo elemento a la lista
    list.appendChild(element);

    // Mostramos una alerta indicando que se agregó el elemento
    displayAlert("Elemento agregado exitosamente", "success");

    // Mostramos el contenedor de la lista
    container.classList.add("show-container");

    // Guardamos el elemento en el almacenamiento local
    addToLocalStorage(id, value);

    // Restauramos los valores predeterminados
    setBackToDefault();
  } 
  else if (value !== "" && editFlag) 
  {
    // Si se está en modo de edición, actualizamos el contenido del elemento
    editElement.innerHTML = value;
    displayAlert("Cambios Guardados", "success");

    // Actualizamos el almacenamiento local con la tarea editada
    editLocalStorage(editID, value);

    // Restauramos los valores predeterminados
    setBackToDefault();
  } 
  else 
  {
    // Si el campo está vacío, mostramos una alerta de error
    displayAlert("Asegúrate de ingresar texto", "danger");
  }
}


// Función para mostrar una alerta
function displayAlert(text, action) 
{
  alert.textContent = text;
  alert.classList.add(`alert-${action}`);

  // Removemos la alerta después de 1000 milisegundos (1 segundo)
  setTimeout(function () 
  {
    alert.textContent = "";
    alert.classList.remove(`alert-${action}`);
  }, 1000);
}


// Función para limpiar todos los elementos de la lista
function clearItems() 
{
  const items = document.querySelectorAll(".grocery-item");
  if (items.length > 0) 
  {
    items.forEach(function (item) 
    {
      list.removeChild(item);
    });
  }
  container.classList.remove("show-container");
  displayAlert("Se han eliminado todos los datos", "danger");
  setBackToDefault();

  // Eliminamos todos los elementos del almacenamiento local
  localStorage.removeItem("list");
}


// Función para eliminar un elemento específico
function deleteItem(e) 
{
  const element = e.currentTarget.parentElement.parentElement;
  const id = element.dataset.id;

  list.removeChild(element);

  // Si la lista está vacía, ocultamos el contenedor de la lista
  if (list.children.length === 0) 
  {
    container.classList.remove("show-container");
  }
  displayAlert("Elemento eliminado", "danger");

  // Eliminamos el elemento del almacenamiento local
  removeFromLocalStorage(id);

  // Restauramos los valores predeterminados
  setBackToDefault();
}


// Función para editar un elemento
function editItem(e) {
  const element = e.currentTarget.parentElement.parentElement;

  // Obtenemos el checkbox del elemento actual
  const checkbox = element.querySelector(".complete-btn");

  // Quitamos el subrayado y el marcado si el checkbox está marcado
  if (checkbox.checked) 
  {
    checkbox.checked = false;
    element.classList.remove("completed");
  }

  // Establecemos la opción de editar elementos
  editElement = e.currentTarget.parentElement.previousElementSibling;

  // Establecemos el valor del formulario
  grocery.value = editElement.innerHTML;
  editFlag = true;
  editID = element.dataset.id;
  submitBtn.textContent = "Editar";
}


// Función para completar una tarea
function completeItem(e) 
{
  const element = e.currentTarget.parentElement;
  if (e.currentTarget.checked) 
  {
    displayAlert("Guardada como: Tarea completada", "success");
    element.classList.add("completed");
  } 
  else 
  {
    displayAlert("Guardada como: Tarea pendiente", "danger");
    element.classList.remove("completed");
  }

  // Actualizamos el almacenamiento local con los estados actualizados de los checkboxes
  const checkboxes = document.querySelectorAll(".complete-btn");
  const checkboxStates = Array.from(checkboxes).map((checkbox) => checkbox.checked);
  localStorage.setItem("checkboxStates", JSON.stringify(checkboxStates));
}


// Función para restaurar los valores predeterminados del formulario
function setBackToDefault() 
{
  grocery.value = "";
  editFlag = false;
  editID = "";
  submitBtn.textContent = "Agregar";

  // Quitamos el subrayado y el marcado si el checkbox está marcado
  const checkboxes = document.querySelectorAll(".complete-btn");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkbox.checked = false;
      checkbox.parentElement.classList.remove("completed");
    }
  });
}


/* Almacenamiento Local */


// Función para agregar un elemento al almacenamiento local
function addToLocalStorage(id, value) 
{
  const grocery = { id, value };
  let items = getLocalStorage();
  items.push(grocery);
  localStorage.setItem("list", JSON.stringify(items));
}


// Función para obtener los elementos del almacenamiento local
function getLocalStorage() 
{
  return localStorage.getItem("list")
    ? JSON.parse(localStorage.getItem("list"))
    : [];
}


// Función para eliminar un elemento del almacenamiento local
function removeFromLocalStorage(id) 
{
  let items = getLocalStorage();

  // Filtramos el elemento con el ID correspondiente y lo eliminamos del array
  items = items.filter(function (item) 
  {
    if (item.id !== id) 
    {
      return item;
    }
  });

  // Actualizamos el almacenamiento local con el nuevo array de elementos
  localStorage.setItem("list", JSON.stringify(items));
}


// Función para editar un elemento en el almacenamiento local
function editLocalStorage(id, value) 
{
  let items = getLocalStorage();

  // Recorremos los elementos y actualizamos el valor de la tarea con el ID correspondiente
  items = items.map(function (item) 
  {
    if (item.id === id) 
    {
      item.value = value;
    }
    return item;
  });

  // Actualizamos el almacenamiento local con el array de elementos editados
  localStorage.setItem("list", JSON.stringify(items));
}


/* Configuración de los elementos */

// Función para configurar los elementos de la lista cuando se carga la página

function setupItems() 
{
  let items = getLocalStorage();

  // Si hay elementos en el almacenamiento local, los mostramos en la lista
  if (items.length > 0) 
  {
    items.forEach(function (item) 
    {
      createListItem(item.id, item.value);
    });
    container.classList.add("show-container");

    // Obtenemos el estado de los checkboxes del almacenamiento local
    const checkboxStates = JSON.parse(localStorage.getItem("checkboxStates"));
    const checkboxes = document.querySelectorAll(".complete-btn");

    // Recorremos los checkboxes y aplicamos el estado guardado
    checkboxes.forEach((checkbox, index) => 
    {
      checkbox.checked = checkboxStates[index];
      if (checkbox.checked) 
      {
        checkbox.parentElement.classList.add("completed");
      }
    });
  }
}


// Función para crear un elemento de tarea en la lista
function createListItem(id, value) 
{
  const element = document.createElement("article");
  let attr = document.createAttribute("data-id");
  attr.value = id;
  element.setAttributeNode(attr);
  element.classList.add("grocery-item");
  element.innerHTML = `
    <input type="checkbox" class="complete-btn">
    <p class="title">${value}</p>
    <div class="btn-container">
      <!-- Botón para editar -->
      <button type="button" class="edit-btn">
        <i class="fas fa-edit"></i>
      </button>
      <!-- Botón para eliminar -->
      <button type="button" class="delete-btn">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;

  // Agregamos eventos a los botones de editar, eliminar y completar
  const deleteBtn = element.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", deleteItem);
  const editBtn = element.querySelector(".edit-btn");
  editBtn.addEventListener("click", editItem);
  const checkBtn = element.querySelector(".complete-btn");
  checkBtn.addEventListener("click", completeItem);


  // Agregamos el nuevo elemento a la lista
  list.appendChild(element);
}
