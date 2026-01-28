/* STATE */
let tasksData = {
    todo: [],
    progress: [],
    done: []
};

let dragElement = null;

/* DOM REFERENCES */
const todo = document.getElementById("todo");
const progress = document.getElementById("progress");
const done = document.getElementById("done");
const columns = [todo, progress, done];

const toggleModalButton = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");

/* LOCAL STORAGE */
function saveTasks() {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasksData));
}

function loadTasks() {
    const data = localStorage.getItem("kanbanTasks");
    if (data) {
        tasksData = JSON.parse(data);
    }
}

/* UI HELPERS */
function updateCounts() {
    columns.forEach(col => {
        const count = col.querySelector(".right");
        count.innerText = col.querySelectorAll(".task").length;
    });
}

/* TASK ELEMENT */
function createTaskElement(task) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");
    div.dataset.id = task.id;

    div.innerHTML = `
        <h2>${task.title}</h2>
        <p>${task.desc}</p>
        <button class="delete-btn">Delete</button>
    `;

    div.addEventListener("dragstart", () => {
        dragElement = div;
    });

    div.querySelector(".delete-btn").addEventListener("click", () => {
        deleteTask(div);
    });

    return div;
}

/* TASK ACTIONS */
function deleteTask(taskEl) {
    const taskId = taskEl.dataset.id;

    Object.keys(tasksData).forEach(col => {
        tasksData[col] = tasksData[col].filter(task => task.id !== taskId);
    });

    taskEl.remove();
    updateCounts();
    saveTasks();
}

function addTask(title, desc) {
    const task = {
        id: Date.now().toString(),
        title,
        desc
    };

    tasksData.todo.push(task);

    const taskEl = createTaskElement(task);
    todo.appendChild(taskEl);

    updateCounts();
    saveTasks();
}

/* DRAG & DROP */
function addDragEventsOnColumn(column) {
    column.addEventListener("dragenter", e => {
        e.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", e => {
        e.preventDefault();
    });

    column.addEventListener("drop", e => {
        e.preventDefault();
        column.classList.remove("hover-over");

        if (!dragElement) return;

        const taskId = dragElement.dataset.id;

        // remove from all columns in data
        Object.keys(tasksData).forEach(col => {
            tasksData[col] = tasksData[col].filter(t => t.id !== taskId);
        });

        // add to new column in data
        tasksData[column.id].push({
            id: taskId,
            title: dragElement.querySelector("h2").innerText,
            desc: dragElement.querySelector("p").innerText
        });

        column.appendChild(dragElement);

        updateCounts();
        saveTasks();
    });
}

/* MODAL EVENTS */
toggleModalButton.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});

addTaskButton.addEventListener("click", () => {
    const titleInput = document.querySelector("#task-title-input");
    const descInput = document.querySelector("#task-desc-input");

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (!title) return;

    addTask(title, desc);

    titleInput.value = "";
    descInput.value = "";
    modal.classList.remove("active");
});

/* INIT */
function init() {
    loadTasks();

    Object.keys(tasksData).forEach(col => {
        tasksData[col].forEach(task => {
            const el = createTaskElement(task);
            document.getElementById(col).appendChild(el);
        });
    });

    columns.forEach(addDragEventsOnColumn);
    updateCounts();
}

init();
