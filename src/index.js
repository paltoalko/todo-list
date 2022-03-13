/* eslint-disable no-tabs */
/* eslint-disable indent */
/* eslint-disable no-use-before-define */
import "./style.css";

const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector(
	"[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const taskContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTaskButton = document.querySelector(
	"[data-clear-complete-tasks-button]"
);

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let taskDate;

listsContainer.addEventListener("click", e => {
	if (e.target.tagName.toLowerCase() === "li") {
		selectedListId = e.target.dataset.listId;
		saveAndRender();
	}
});

taskContainer.addEventListener("click", e => {
	if (e.target.tagName.toLowerCase() === "input") {
		const selectedList = lists.find(list => list.id === selectedListId);
		const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
		selectedTask.complete = e.target.checked;
		save();
		renderTaskCount(selectedList);
	}
});

deleteListButton.addEventListener("click", e => {
	lists = lists.filter(list => list.id !== selectedListId);
	selectedListId = null;
	saveAndRender();
});

clearCompleteTaskButton.addEventListener("click", e => {
	const selectedList = lists.find(list => list.id === selectedListId);
	selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
	saveAndRender();
});

newListForm.addEventListener("submit", e => {
	e.preventDefault();
	const listName = newListInput.value;
	if (listName == null || listName === "") return;
	const list = createList(listName);
	newListInput.value = null;
	lists.push(list);
	saveAndRender();
});

const getTaskDate = document.querySelector("[data-new-task-date-input]");

getTaskDate.addEventListener("change", e => {
	e.preventDefault();
	taskDate = getTaskDate.value;
	return taskDate;
});

newTaskForm.addEventListener("submit", e => {
	e.preventDefault();
	const taskName = newTaskInput.value;
	if (
		taskName == null ||
		taskName === "" ||
		taskDate === undefined ||
		taskDate === ""
	) {
		return;
	}
	const task = createTask(taskName, taskDate);
	newTaskInput.value = null;
	getTaskDate.value = null;
	const selectedList = lists.find(list => list.id === selectedListId);
	selectedList.tasks.push(task);
	saveAndRender();
});

function createList(name) {
	return { id: Date.now().toString(), name, tasks: [] };
}

function createTask(name, taskDate) {
	return {
		id: taskDate.replaceAll("-", "").toString(),
		name,
		taskDate,
		complete: false,
	};
}

function save() {
	localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
	localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function saveAndRender() {
	save();
	render();
}

function render() {
	clearElement(listsContainer);
	renderLists();
	const selectedList = lists.find(list => list.id === selectedListId);

	if (selectedListId == null) {
		listDisplayContainer.style.display = "none";
	} else {
		listDisplayContainer.style.display = "";
		listTitleElement.innerText = selectedList.name;
		renderTaskCount(selectedList);
		clearElement(taskContainer);
		renderTasks(selectedList);
		sortTasks();
	}
}

function renderTasks(selectedList) {
	selectedList.tasks.forEach(task => {
		const taskElement = document.importNode(taskTemplate.content, true);
		const checkbox = taskElement.querySelector("input");
		checkbox.id = task.id;
		checkbox.checked = task.complete;
		const label = taskElement.querySelector("label");
		const date = taskElement.querySelector(".date-task");
		date.append(task.taskDate);

		const nameId = task.id.replaceAll("-", "").toString();
		taskElement.querySelector("div").classList.add(nameId);

		label.htmlFor = task.id;
		label.append(task.name);

		taskContainer.appendChild(taskElement);
	});
}

function sortTasks() {
	const tasks = document.querySelector("div.tasks");
	const task = tasks.childNodes;
	const taskArr = [...task];
	let i;

	// eslint-disable-next-line no-nested-ternary
	taskArr.sort((a, b) =>
		a.className === b.className ? 0 : a.className > b.className ? 1 : -1
	);

	for (i = 0; i < taskArr.length; ++i) {
		tasks.appendChild(taskArr[i]);
	}
}

function renderTaskCount(selectedList) {
	const incompleteTaskCount = selectedList.tasks.filter(
		task => !task.complete
	).length;
	const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
	listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
}

function renderLists() {
	lists.forEach(list => {
		const listElement = document.createElement("li");
		listElement.dataset.listId = list.id;
		listElement.classList.add("list-name");
		listElement.innerText = list.name;
		if (list.id === selectedListId) {
			listElement.classList.add("active-list");
		}
		listsContainer.appendChild(listElement);
	});
}

function clearElement(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

render();
