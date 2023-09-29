const socket = new WebSocket("ws://localhost:8888/ws");
const showButton = document.getElementById("showDialog");
const favDialog = document.getElementById("favDialog");
const selectEl = favDialog.querySelector("select");
const confirmBtn = favDialog.querySelector("#confirmBtn");

showButton.addEventListener("click", () => {
    favDialog.showModal();
});

selectEl.addEventListener("change", () => {
    confirmBtn.value = selectEl.value;
});

confirmBtn.addEventListener("click", (event) => {
    event.preventDefault()
    favDialog.close(selectEl.value);
});

let status = true;
function zustand() {
    if (status === false) {
        closeNav();
        status = true;
    }
    else {
        openNav();
        status = false;
    }
}

function openNav() {
    let sidebar = document.getElementById("mySidebar");
    let wrapper = document.getElementById("wrapper");
    if (window.screen.width >= 768) {
        sidebar.classList.toggle("opendesktop");
        wrapper.classList.toggle("open");
    }
    else {
        sidebar.classList.toggle("openmobile");
    }
}

function closeNav() {
    let sidebar = document.getElementById("mySidebar");
    let wrapper = document.getElementById("wrapper");
    sidebar.classList.remove("opendesktop");
    sidebar.classList.remove("openmobile");
    sidebar.classList.add("sidebar");
    wrapper.classList.remove("open");
    wrapper.classList.add("wrapper");
    status = true;
}

async function add() {
    const todoInput = document.getElementById('eingabetodo');
    const priorityInput = document.getElementById('prio');
    const description = document.getElementById('description');
    const form = document.getElementById('form');

    let priority2 = 0;
    switch (priorityInput.value) {
        case "1":
            priority2 = 1;
            break;
        case "2":
            priority2 = 2;
            break;
        case "3":
            priority2 = 3;
            break;
        default:
            console.log("ERROR: " + priority2 + "is empty");
    }

    if (todoInput.value === '') {
        alert('Bitte geben Sie eine Aufgabe ein.');
        return;
    }

    const todo = {
        name: todoInput.value,
        description: description.value,
        priority: priority2,
        completed: false,
    };

    await fetch('http://localhost:8888/api/todos', {
        method: 'POST',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo),
    }).then(status)
        .then((id) => {
            closeNav();
            form.reset();
            todo.id = id;
        })
        .catch();
    function status(res) {
        if (!res.ok) {
            return Promise.reject()
        }
        return res;
    }
}

function removeTodo(id) {  // NACh ids löschen
    fetch(`http://localhost:8888/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
    }).then(() => load());

}
load();

function load() {
    fetch('http://localhost:8888/api/todos', {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            response.json().then(response => {
                //console.log(response, "res");
                //todos = response;
                renderTodos(response);
            });
        })
    closeNav();
}

function loadone(id) {
    fetch(`http://localhost:8888/api/todos/${id}`, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            response.json().then(response => {
                //console.log(response, "res");
                //todos = response;
                dototoparameter(response);
            });
        })
    closeNav();
}

function renderTodos(todos) {
    const todosContainer = document.getElementById('outputDiv');
    todosContainer.innerHTML = '';
    for (let i = 0; i < todos.length; i++) {
        dototoparameter(todos[i]);
    }
}

function checkbox() {
    let checkbox = document.getElementById("hide-checkbox");
    let boxes = document.getElementsByClassName("outputDiv");
    let checkboxes = document.getElementsByClassName("boxCheckbox");
    checkbox.addEventListener("change", function () {
        if (this.checked) {
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    boxes[i].classList.add("outputDiv-hide");
                } else {
                    boxes[i].classList.remove("outputDiv-hide");
                }
            }
        }
        else {
            for (let i = 0; i < boxes.length; i++) {
                boxes[i].classList.remove("outputDiv-hide");
            }
        }
    });
}

function dototoparameter(todo) {
    let divBox = document.createElement("div");
    let h1 = document.createElement("h1");
    let h2 = document.createElement("h2");
    let description = document.createElement("p");
    let button = document.createElement("button");
    let check = document.createElement("input");
    let outputDiv = document.getElementById("outputDiv");

    divBox.classList.add("outputDiv");
    h1.classList.add("h1.todo");
    button.classList.add("close-button");
    check.setAttribute("type", "checkbox");
    check.className = "boxCheckbox";
    button.innerText = "X";

    check.addEventListener("change", function () {
        todo.completed = this.checked
        let id = todo.id;
        fetch(`http://localhost:8888/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo),
        }).then();
    });

    button.addEventListener("click", function(){
        const id = todo.id;
        removeTodo(id);
    });

    let ausgabeprio = "";
    switch (todo.priority) {
        case 1:
            ausgabeprio = "Niedrig";
            break;
        case 2:
            ausgabeprio = "Mittel";
            break;
        case 3:
            ausgabeprio = "Hoch";
    }

    h1.textContent = `${todo.name}`;
    h2.textContent = `Priorität: ` + ausgabeprio;
    description.textContent = `${todo.description}`;

    if (todo.completed === true) {
        check.setAttribute("checked", "checked");
    }
    else {
        check.removeAttribute("checked");
    }

    divBox.appendChild(button);
    divBox.appendChild(h1);
    divBox.appendChild(description);
    divBox.appendChild(h2);
    divBox.appendChild(document.createTextNode("Done?"));
    divBox.appendChild(check);
    outputDiv.appendChild(divBox);
}

checkbox();

socket.addEventListener("message", (event) => {
    //console.log("Message from server ", event.data);
    let websocketResponse = JSON.parse(event.data);
    console.log('websocketResponse', websocketResponse);
    if (Object.keys(websocketResponse)[0] === 'Created') {
       let id = websocketResponse.Created;
        loadone(id);
    }
    else if (Object.keys(websocketResponse)[0] === 'Deleted') {
        load();
    }
   else if (Object.keys(websocketResponse)[0] === 'Updated') {
        load();
    }
});


