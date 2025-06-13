document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentTimeEl = document.getElementById('current-time');
    const currentDateEl = document.getElementById('current-date');
    const monthYearEl = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarGrid = document.getElementById('calendar-grid');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const modalDateTitle = document.getElementById('modal-date-title');
    const taskForm = document.getElementById('task-form');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskPrioritySelect = document.getElementById('task-priority');
    const dayTasksList = document.getElementById('day-tasks-list');

    // State variables
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null; // Stores the date selected in the calendar

    // --- Utility Functions ---

    /**
     * Formats a Date object into a readable date string.
     * @param {Date} date The date object to format.
     * @returns {string} The formatted date string (e.g., "Quinta-feira, 12 de Junho de 2025").
     */
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    };

    /**
     * Formats a Date object into a readable time string.
     * @param {Date} date The date object to format.
     * @returns {string} The formatted time string (e.g., "18:30:45").
     */
    const formatTime = (date) => {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleTimeString('pt-BR', options);
    };

    /**
     * Updates the current time and date displayed in the header.
     */
    const updateHeaderDateTime = () => {
        const now = new Date();
        currentTimeEl.textContent = formatTime(now);
        currentDateEl.textContent = formatDate(now);
    };

    /**
     * Gets tasks from localStorage for a specific date.
     * @param {string} dateString The date in "YYYY-MM-DD" format.
     * @returns {Array<Object>} An array of tasks for that date.
     */
    const getTasks = (dateString) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        return tasks[dateString] || [];
    };

    /**
     * Saves tasks to localStorage for a specific date.
     * @param {string} dateString The date in "YYYY-MM-DD" format.
     * @param {Array<Object>} tasksArray An array of tasks to save for that date.
     */
    const saveTasks = (dateString, tasksArray) => {
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
        if (tasksArray.length > 0) {
            allTasks[dateString] = tasksArray;
        } else {
            delete allTasks[dateString]; // Remove entry if no tasks
        }
        localStorage.setItem('tasks', JSON.stringify(allTasks));
    };

    // --- Calendar Functions ---

    /**
     * Renders the calendar grid for the current month and year.
     */
    const renderCalendar = () => {
        calendarGrid.innerHTML = ''; // Clear previous days
        const today = new Date();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        monthYearEl.textContent = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // Fill leading empty days
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        // Fill days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            // Ensure date is set to start of day for comparison uniformity
            date.setHours(0, 0, 0, 0); 
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.dataset.date = dateString;

            // Check if it's today
            if (date.toDateString() === today.toDateString()) {
                dayDiv.classList.add('today');
            }

            // Disable past and current day for adding tasks
            // We want to compare with today's date at the start of the day
            const todayStartOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (date <= todayStartOfDay) { // Use <= to include today as disabled for adding new tasks
                dayDiv.classList.add('disabled');
            }

            const dayNumberSpan = document.createElement('span');
            dayNumberSpan.classList.add('day-number');
            dayNumberSpan.textContent = day;
            dayDiv.appendChild(dayNumberSpan);

            // Add task count badge
            const tasks = getTasks(dateString);
            const incompleteTasksCount = tasks.filter(task => !task.completed).length;
            if (incompleteTasksCount > 0) {
                const taskCountSpan = document.createElement('span');
                taskCountSpan.classList.add('task-count');
                taskCountSpan.textContent = incompleteTasksCount;
                dayDiv.appendChild(taskCountSpan);
            }

            // Event listener for clicking on a day
            dayDiv.addEventListener('click', () => {
                // Clicking on any day (even disabled ones) should open the modal to VIEW tasks
                // Only adding new tasks will be restricted by the 'disabled' class logic later
                selectedDate = date;
                openTaskModal();
            });

            calendarGrid.appendChild(dayDiv);
        }
    };

    /**
     * Handles navigation to the previous month.
     */
    const goToPrevMonth = () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    };

    /**
     * Handles navigation to the next month.
     */
    const goToNextMonth = () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    };

    // --- Task Modal Functions ---

    /**
     * Opens the task modal and populates it with tasks for the selected date.
     */
    const openTaskModal = () => {
        if (!selectedDate) return;

        // Update modal title
        modalDateTitle.textContent = `Tarefas para ${formatDate(selectedDate)}`;

        // Check if the selected date is in the past or today (to disable form)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const isPastOrToday = selectedDate <= today;

        if (isPastOrToday) {
            taskForm.style.display = 'none'; // Hide the form for past/current days
        } else {
            taskForm.style.display = 'block'; // Show the form for future days
        }

        // Load and display tasks for the selected day
        renderTasksForSelectedDay();

        // Show the modal
        taskModal.style.display = 'flex';
        taskDescriptionInput.focus(); // Focus on description input if form is visible
    };

    /**
     * Closes the task modal.
     */
    const closeTaskModal = () => {
        taskModal.style.display = 'none';
        taskForm.reset(); // Clear the form
        selectedDate = null; // Clear selected date
        renderCalendar(); // Re-render calendar to update task counts if any were added/deleted
    };

    /**
     * Renders the list of tasks in the modal for the currently selected day.
     */
    const renderTasksForSelectedDay = () => {
        dayTasksList.innerHTML = '';
        if (!selectedDate) return;

        const dateString = selectedDate.toISOString().split('T')[0];
        const tasks = getTasks(dateString);

        if (tasks.length === 0) {
            const noTasksLi = document.createElement('li');
            noTasksLi.textContent = 'Nenhuma tarefa para este dia.';
            dayTasksList.appendChild(noTasksLi);
            return;
        }

        // Sort tasks: incomplete tasks first, then by priority (high, medium, low)
        tasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1; // Incomplete (false) comes before completed (true)
            }
            const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add(task.priority); // Add priority class for styling

            if (task.completed) {
                li.classList.add('completed');
            }

            const taskTextSpan = document.createElement('span');
            taskTextSpan.classList.add('task-text');
            taskTextSpan.textContent = task.description;

            const priorityLabelSpan = document.createElement('span');
            priorityLabelSpan.classList.add('task-priority-label');
            priorityLabelSpan.textContent = task.priority === 'low' ? 'Baixa' :
                                             task.priority === 'medium' ? 'Média' : 'Alta';

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('task-actions');

            // Toggle Complete button
            const toggleCompleteButton = document.createElement('button');
            toggleCompleteButton.classList.add('toggle-complete');
            toggleCompleteButton.innerHTML = task.completed ? '&#10003;' : '&#9744;'; // Checkmark or empty box
            toggleCompleteButton.title = task.completed ? 'Marcar como não concluída' : 'Marcar como concluída';
            toggleCompleteButton.addEventListener('click', () => toggleTaskCompletion(dateString, index));

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-task');
            deleteButton.textContent = 'X';
            deleteButton.title = 'Remover tarefa';
            deleteButton.addEventListener('click', () => deleteTask(dateString, index));

            actionsDiv.appendChild(toggleCompleteButton);
            actionsDiv.appendChild(deleteButton);

            li.appendChild(taskTextSpan);
            li.appendChild(priorityLabelSpan);
            li.appendChild(actionsDiv);
            dayTasksList.appendChild(li);
        });
    };

    /**
     * Handles adding a new task to the selected day.
     * @param {Event} event The form submission event.
     */
    const addTask = (event) => {
        event.preventDefault();

        if (!selectedDate) {
            console.error('Nenhuma data selecionada para adicionar a tarefa.');
            return;
        }

        // Re-check if the selected date is actually in the future for adding tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        if (selectedDate <= today) {
            alert('Você só pode adicionar tarefas para dias futuros.');
            return;
        }

        const description = taskDescriptionInput.value.trim();
        const priority = taskPrioritySelect.value;

        if (!description) {
            alert('A descrição da tarefa não pode estar vazia.');
            return;
        }

        const dateString = selectedDate.toISOString().split('T')[0];
        const tasks = getTasks(dateString);
        tasks.push({ description, priority, completed: false }); // Add completed status
        saveTasks(dateString, tasks);

        taskDescriptionInput.value = ''; // Clear input
        taskPrioritySelect.value = 'low'; // Reset priority

        renderTasksForSelectedDay(); // Re-render tasks in the modal
        renderCalendar(); // Update calendar to show new task count
    };

    /**
     * Deletes a task from a specific date.
     * @param {string} dateString The date in "YYYY-MM-DD" format.
     * @param {number} index The index of the task to delete.
     */
    const deleteTask = (dateString, index) => {
        const tasks = getTasks(dateString);
        tasks.splice(index, 1); // Remove the task
        saveTasks(dateString, tasks);
        renderTasksForSelectedDay(); // Re-render tasks in the modal
        renderCalendar(); // Update calendar task counts
    };

    /**
     * Toggles the completion status of a task.
     * @param {string} dateString The date in "YYYY-MM-DD" format.
     * @param {number} index The index of the task to toggle.
     */
    const toggleTaskCompletion = (dateString, index) => {
        const tasks = getTasks(dateString);
        if (tasks[index]) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(dateString, tasks);
            renderTasksForSelectedDay(); // Re-render tasks in the modal
            renderCalendar(); // Update calendar task counts (as completed tasks don't count)
        }
    };

    // --- Event Listeners ---

    prevMonthBtn.addEventListener('click', goToPrevMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    closeModalBtn.addEventListener('click', closeTaskModal);
    taskForm.addEventListener('submit', addTask);

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            closeTaskModal();
        }
    });

    // --- Initialization ---

    // Update time and date every second
    setInterval(updateHeaderDateTime, 1000);
    updateHeaderDateTime(); // Initial call

    renderCalendar(); // Initial calendar render
});