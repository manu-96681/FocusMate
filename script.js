
/* =========================================
   1. GET HTML ELEMENTS
========================================= */

// Task elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const completedCountElement = document.getElementById("completedCount");

// Pomodoro elements
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const timerStatus = document.getElementById("timerStatus");

// Habit elements
const habitCheckboxes = document.querySelectorAll(".habit-checkbox");
const habitProgress = document.getElementById("habitProgress");

// Notes elements
const notesInput = document.getElementById("notesInput");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const notesStatus = document.getElementById("notesStatus");

// Weekly progress elements
const weeklyTasks = document.getElementById("weeklyTasks");
const weeklyHabits = document.getElementById("weeklyHabits");
const weeklyFocus = document.getElementById("weeklyFocus");
const focusTime = document.getElementById("focusTime");

// Motivation elements
const motivationQuote = document.getElementById("motivationQuote");
const newQuoteBtn = document.getElementById("newQuoteBtn");


/* =========================================
   2. LOCAL STORAGE HELPER
========================================= */

// Read saved data from browser storage
function loadData(key, defaultValue) {
    try {
        const savedData = localStorage.getItem(key);

        return savedData ? JSON.parse(savedData) : defaultValue;

    } catch (error) {
        console.error("Unable to load saved data:", error);
        return defaultValue;
    }
}

// Save data in browser storage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


/* =========================================
   3. DATE HELPERS
========================================= */

// Get today's date in YYYY-MM-DD format
function getTodayKey() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Get the Monday of the current week
function getWeekStart() {
    const today = new Date();

    const day = today.getDay();
    const difference = day === 0 ? 6 : day - 1;

    today.setDate(today.getDate() - difference);
    today.setHours(0, 0, 0, 0);

    return today;
}

// Check whether a date belongs to this week
function isThisWeek(dateString) {
    if (!dateString) {
        return false;
    }

    const date = new Date(dateString + "T00:00:00");
    const weekStart = getWeekStart();

    return date >= weekStart && date <= new Date(
        getTodayKey() + "T23:59:59"
    );
}


/* =========================================
   4. TASK MANAGER
========================================= */

// Load previously saved tasks
let tasks = loadData("focusmateTasks", []);

// Save tasks
function saveTasks() {
    saveData("focusmateTasks", tasks);
}

// Update dashboard task counter
function updateTaskCount() {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;

    completedCountElement.textContent = `${completed} / ${total}`;
}

// Update weekly task progress
function updateWeeklyTasks() {
    const count = tasks.filter(task => {
        return task.completed && isThisWeek(task.completedAt);
    }).length;

    weeklyTasks.textContent = count;
}

// Display tasks on the webpage
function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const newTask = document.createElement("li");

        // Create checkbox
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = task.completed;

        // Create task text
        const taskLabel = document.createElement("span");
        taskLabel.textContent = task.text;

        if (task.completed) {
            taskLabel.classList.add("completed");
        }

        // Create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        // Handle task completion
        checkBox.addEventListener("change", function() {

            task.completed = checkBox.checked;

            task.completedAt = task.completed ? getTodayKey() : null;

            taskLabel.classList.toggle("completed", task.completed);

            saveTasks();
            updateTaskCount();
            updateWeeklyTasks();

        });

        // Handle task deletion
        deleteBtn.addEventListener("click", function() {

            tasks = tasks.filter(item => item.id !== task.id);

            saveTasks();
            renderTasks();

        });

        // Add elements to the task
        newTask.appendChild(checkBox);
        newTask.appendChild(taskLabel);
        newTask.appendChild(deleteBtn);

        taskList.appendChild(newTask);

    });

    updateTaskCount();
    updateWeeklyTasks();
}

// Add a new task
function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: taskText,
        completed: false,
        completedAt: null
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

// Add task button event
addTaskBtn.addEventListener("click", addTask);

// Add task when Enter is pressed
taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});

// Display saved tasks when the page opens
renderTasks();


/* =========================================
   5. POMODORO TIMER
========================================= */

// Set timer to 25 minutes
const WORK_TIME = 25 * 60;

let timeLeft = WORK_TIME;
let timerInterval = null;

// Update timer display
function updateTimerDisplay() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

// Load focus sessions
let focusSessions = loadData("focusmateSessions", []);

// Update focus progress
function updateFocusProgress() {

    const totalSessions = focusSessions.length;

    const thisWeekSessions = focusSessions.filter(isThisWeek).length;

    weeklyFocus.textContent = thisWeekSessions;

    focusTime.textContent = `${totalSessions * 25} Minutes`;

}

// Start timer
startBtn.addEventListener("click", function() {

    if (timerInterval !== null) {
        return;
    }

    timerStatus.textContent = "Stay focused! You are doing great.";

    timerInterval = setInterval(function() {

        timeLeft--;

        updateTimerDisplay();

        // Check whether the timer has finished
        if (timeLeft <= 0) {

            clearInterval(timerInterval);
            timerInterval = null;

            timeLeft = 0;
            updateTimerDisplay();

            timerStatus.textContent = "🎉 Focus session completed! Take a break.";

            // Save completed focus session
            focusSessions.push(getTodayKey());

            saveData("focusmateSessions", focusSessions);

            updateFocusProgress();

            alert("Congratulations! You completed a 25-minute focus session.");

        }

    }, 1000);

});

// Pause timer
pauseBtn.addEventListener("click", function() {

    clearInterval(timerInterval);
    timerInterval = null;

    timerStatus.textContent = "Timer paused. Resume when ready.";

});

// Reset timer
resetBtn.addEventListener("click", function() {

    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = WORK_TIME;

    updateTimerDisplay();

    timerStatus.textContent = "Ready to focus?";

});

// Show initial timer
updateTimerDisplay();
updateFocusProgress();


/* =========================================
   6. HABIT TRACKER
========================================= */

// Load saved habit progress
let savedHabits = loadData("focusmateHabits", {});

// Update habit progress
function updateHabitProgress() {

    let completed = 0;

    habitCheckboxes.forEach((checkbox, index) => {

        if (checkbox.checked) {
            completed++;
        }

        // Save each habit's checkbox status
        savedHabits[index] = checkbox.checked;

    });

    habitProgress.textContent =
        `${completed} / ${habitCheckboxes.length} habits completed`;

    weeklyHabits.textContent = completed;

    saveData("focusmateHabits", savedHabits);

}

// Restore habit progress when the page opens
habitCheckboxes.forEach((checkbox, index) => {

    checkbox.checked = savedHabits[index] === true;

    checkbox.addEventListener("change", updateHabitProgress);

});

// Display initial habit progress
updateHabitProgress();


/* =========================================
   7. NOTES SECTION
========================================= */

// Load previously saved notes
notesInput.value = localStorage.getItem("focusmateNotes") || "";

// Save notes
saveNotesBtn.addEventListener("click", function() {

    localStorage.setItem("focusmateNotes", notesInput.value);

    notesStatus.textContent = "✅ Your notes have been saved!";

});


/* =========================================
   8. DAILY MOTIVATION
========================================= */

// Collection of motivational quotes
const quotes = [

    "Success doesn't come from what you do occasionally. It comes from what you do consistently.",

    "Small progress is still progress. Keep moving forward.",

    "Don't wait for motivation. Start, and motivation will follow.",

    "Your future is created by what you do today, not tomorrow.",

    "Focus on progress, not perfection.",

    "Great things are done by a series of small things brought together.",

    "Every expert was once a beginner. Keep learning and growing."

];

// Display a random motivational quote
newQuoteBtn.addEventListener("click", function() {

    const randomIndex = Math.floor(Math.random() * quotes.length);

    motivationQuote.textContent = `"${quotes[randomIndex]}"`;

});
