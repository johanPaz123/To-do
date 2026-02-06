let tasks = [];

class Task {
  constructor(name, priority, category, deadline) {
    this.id = new Date();
    this.name = name;
    this.priority = priority;
    this.category = category;
    this.deadline = new Date() < deadline ? deadline : "";
    this.completed = false;
  }
}

function findSelectors(selector, text) {
  return selector.find(text).val();
}

$(function () {
  $("#todo-form").on("submit", function (e) {
    e.preventDefault();
    const taskName = findSelectors($(this), "[name='textTask']");
    const priority = findSelectors($(this), "[name='priority']");
    const category = findSelectors($(this), "[name='category']");
    const deadline = findSelectors($(this), "[name='deadline']");

    const newTask = new Task(taskName, priority, category, deadline);

    tasks.push(newTask);
    const todoList = $("#todo-list");
    todoList.empty();

    tasks.forEach((t) => {
      todoList.append(`
          <li class="todo-item">
              <h3 class="task-text">${t.name}</h3>
              <p>Prioridad: ${t.priority} - Categoría: ${t.category}</p>
              <button class="btn-edit">Editar</button>
              <button class="btn-complete">Completar</button>
          </li>
      `);
    });

    this.reset();
  });
});
