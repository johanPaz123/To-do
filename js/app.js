class Task {
  constructor(name, priority, category, deadline) {
    this.id = Date.now().toString();
    this.name = name;
    this.priority = priority;
    this.category = category;
    this.deadline = deadline;
    this.completed = false;
  }
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

$(function () {
    // 1. Cargar datos iniciales
    renderTasks();

    // --- FORMULARIO: AÑADIR TAREA ---
    $("#todo-form").on("submit", function (e) {
        e.preventDefault();
        const name = $("#todo-input").val().trim();
        const priority = $("#priority-select").val();
        const category = $("#category-select").val();
        const deadline = $("#due-date").val();

        if (name === "") return alert("Escribe una tarea");

        const newTask = new Task(name, priority, category, deadline);
        tasks.push(newTask);
        saveAndRender();
        this.reset();
    });

    // --- EXPORTAR (Botón con ID: export-btn) ---
    $("#export-btn").on("click", function () {
        if (tasks.length === 0) return alert("No hay tareas para exportar");
        
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = "mis_tareas.json";
        link.click();
        
        URL.revokeObjectURL(url);
    });

    // --- IMPORTAR (Botón con ID: import-btn-trigger e input: import-input) ---
    $("#import-btn-trigger").on("click", function () {
        $("#import-input").trigger("click");
    });

    $("#import-input").on("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        $(reader).on("load", function (event) {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    tasks = imported;
                    saveAndRender();
                    alert("✅ Tareas importadas correctamente");
                } else {
                    alert("❌ El formato del archivo no es válido");
                }
            } catch (err) {
                alert("❌ Error al leer el archivo JSON");
            }
            $("#import-input").val("");
        });
        reader.readAsText(file);
    });
    
    // Completar
    $("#todo-list").on("click", ".btn-complete", function () {
        const id = $(this).closest(".todo-item").data("id").toString();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveAndRender();
        }
    });

    // Eliminar
    $("#todo-list").on("click", ".btn-delete", function () {
        const $item = $(this).closest(".todo-item");
        const id = $item.data("id").toString();
        $item.fadeOut(300, function() {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
        });
    });

    // Filtros
    $(".filter-btn").on("click", function () {
        $(".filter-btn").removeClass("active");
        $(this).addClass("active");
        renderTasks($(this).data("filter"));
    });

    // Búsqueda
    $("#search-input").on("input", function () {
        renderTasks("all", $(this).val().toLowerCase());
    });

    // Limpiar completadas
    $("#clear-completed").on("click", function () {
        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
    });

    // Modo oscuro
    $("#theme-toggle").on("click", function () {
        $("body").toggleClass("dark-mode");
        const isDark = $("body").hasClass("dark-mode");
        $(this).find("i").attr("class", isDark ? "fas fa-sun" : "fas fa-moon");
    });
});

// --- FUNCIONES CORE ---

function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks($(".filter-btn.active").data("filter"));
}

function renderTasks(filter = "all", searchQuery = "") {
    const $list = $("#todo-list");
    $list.empty();

    let filtered = tasks;
    if (filter === "active") filtered = tasks.filter(t => !t.completed);
    if (filter === "completed") filtered = tasks.filter(t => t.completed);
    if (searchQuery) filtered = filtered.filter(t => t.name.toLowerCase().includes(searchQuery));

    filtered.forEach(t => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = t.deadline && t.deadline < today && !t.completed;

        $list.append(`
            <li class="todo-item priority-${t.priority} ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                <div class="task-text">
                    <span class="badge-category">${t.category}</span>
                    <h3>${t.name}</h3>
                    <small>📅 ${t.deadline || 'Sin fecha'}</small>
                    ${isOverdue ? '<span class="overdue">⚠️ Vencida</span>' : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-complete"><i class="fas fa-check"></i></button>
                    <button class="btn-icon btn-delete"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `);
    });
    updateStats();
}

function updateStats() {
    const count = tasks.filter(t => !t.completed).length;
    $("#items-left").text(`${count} tareas pendientes`);
}