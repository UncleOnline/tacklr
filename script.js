// DOM Elements
const addTaskBtn = document.getElementById('add-task-btn');
const taskForm = document.getElementById('task-form');
const taskModal = document.getElementById('task-modal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const taskColumnInput = document.getElementById('task-column');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const columnAddButtons = document.querySelectorAll('.column-add-btn');
const tasksContainers = document.querySelectorAll('.tasks-container');
const openChatBtn = document.getElementById('open-chat-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatAssistant = document.getElementById('chat-assistant');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const chatMessages = document.getElementById('chat-messages');

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('kanban_user_logged_in');
    if (isLoggedIn !== 'true') {
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Get current user
function getCurrentUser() {
    return localStorage.getItem('kanban_current_user') || 'default';
}

// Get user-specific storage key
function getUserStorageKey() {
    const username = getCurrentUser();
    return `kanban_board_tasks_${username}`;
}

// Local Storage Key
const STORAGE_KEY = getUserStorageKey();

// Tasks Data Structure
let tasks = {};

// Initialize the app
function init() {
    checkAuth();
    setupUserInterface();
    loadTasksFromStorage();
    renderAllTasks();
    setupEventListeners();
    setupChatAssistant();
}

// Setup user interface with username
function setupUserInterface() {
    // Add username to the header if it doesn't exist already
    const header = document.querySelector('header');
    if (!document.getElementById('user-info')) {
        const userInfo = document.createElement('div');
        userInfo.id = 'user-info';
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span>Welcome, <strong>${getCurrentUser()}</strong></span>
            <button id="logout-btn" class="logout-btn">Logout</button>
        `;
        header.appendChild(userInfo);
        
        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('kanban_user_logged_in');
            window.location.href = 'login.html';
        });
    }
}

// Load tasks from local storage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    tasks = storedTasks ? JSON.parse(storedTasks) : {
        inbox: [],
        actions: [],
        projects: [],
        'someday-maybe': []
    };
}

// Save tasks to local storage
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Generate a unique ID for tasks
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render all tasks in all columns
function renderAllTasks() {
    Object.keys(tasks).forEach(column => {
        renderColumnTasks(column);
    });
}

// Render tasks for a specific column
function renderColumnTasks(column) {
    const container = document.getElementById(`${column}-tasks`);
    container.innerHTML = '';
    
    if (tasks[column] && tasks[column].length) {
        tasks[column].forEach(task => {
            container.appendChild(createTaskCard(task, column));
        });
    }
}

// Create a task card element
function createTaskCard(task, column) {
    const card = document.createElement('div');
    card.classList.add('task-card');
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);
    card.setAttribute('data-column', column);
    
    const cardContent = `
        <div class="task-card-actions">
            <button class="edit-task-btn" data-id="${task.id}" data-column="${column}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-task-btn" data-id="${task.id}" data-column="${column}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <h3>${task.title}</h3>
        <p>${task.description || ''}</p>
    `;
    
    card.innerHTML = cardContent;
    
    // Add event listeners for task card actions
    card.querySelector('.edit-task-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditTaskModal(task, column);
    });
    
    card.querySelector('.delete-task-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id, column);
    });
    
    // Add drag and drop event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

// Set up all event listeners
function setupEventListeners() {
    // Main add task button
    addTaskBtn.addEventListener('click', () => openAddTaskModal('inbox'));
    
    // Column add buttons
    columnAddButtons.forEach(button => {
        button.addEventListener('click', () => {
            const column = button.getAttribute('data-column');
            openAddTaskModal(column);
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', closeTaskModal);
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
    
    // Submit task form
    taskForm.addEventListener('submit', handleTaskFormSubmit);
    
    // Drag and drop for task containers
    tasksContainers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
    });
    
    // Chat event listeners
    openChatBtn.addEventListener('click', openChatAssistant);
    closeChatBtn.addEventListener('click', closeChatAssistant);
    sendMessageBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// Open modal for adding a new task
function openAddTaskModal(column) {
    taskIdInput.value = '';
    taskColumnInput.value = column;
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    modalTitle.textContent = 'Add New Task';
    taskModal.style.display = 'block';
    taskTitleInput.focus();
}

// Open modal for editing an existing task
function openEditTaskModal(task, column) {
    taskIdInput.value = task.id;
    taskColumnInput.value = column;
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description || '';
    modalTitle.textContent = 'Edit Task';
    taskModal.style.display = 'block';
    taskTitleInput.focus();
}

// Close the task modal
function closeTaskModal() {
    taskModal.style.display = 'none';
    taskForm.reset();
}

// Handle task form submission
function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const taskId = taskIdInput.value;
    const column = taskColumnInput.value;
    const taskData = {
        title: taskTitleInput.value,
        description: taskDescriptionInput.value
    };
    
    if (taskId) {
        // Edit existing task
        updateTask(taskId, column, taskData);
    } else {
        // Add new task
        addTask(column, taskData);
    }
    
    closeTaskModal();
}

// Add a new task
function addTask(column, taskData) {
    const newTask = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        createdAt: new Date().toISOString()
    };
    
    tasks[column].push(newTask);
    saveTasksToStorage();
    renderColumnTasks(column);
}

// Update an existing task
function updateTask(taskId, column, taskData) {
    const taskIndex = tasks[column].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[column][taskIndex] = {
            ...tasks[column][taskIndex],
            title: taskData.title,
            description: taskData.description,
            updatedAt: new Date().toISOString()
        };
        
        saveTasksToStorage();
        renderColumnTasks(column);
    }
}

// Delete a task
function deleteTask(taskId, column) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks[column] = tasks[column].filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderColumnTasks(column);
    }
}

// Move a task from one column to another
function moveTask(taskId, sourceColumn, targetColumn) {
    // Find the task in the source column
    const taskIndex = tasks[sourceColumn].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        // Remove from source column and add to target column
        const taskToMove = tasks[sourceColumn][taskIndex];
        tasks[sourceColumn].splice(taskIndex, 1);
        tasks[targetColumn].push(taskToMove);
        
        saveTasksToStorage();
        renderColumnTasks(sourceColumn);
        renderColumnTasks(targetColumn);
    }
}

// Drag and Drop Event Handlers
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = {
        id: this.getAttribute('data-id'),
        column: this.getAttribute('data-column')
    };
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(draggedTask));
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;
    
    // Remove drag-over class from all containers
    tasksContainers.forEach(container => {
        container.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    this.classList.remove('drag-over');
    
    // Get the target column
    const targetColumn = this.id.replace('-tasks', '');
    
    // Get the dragged task data
    if (draggedTask && draggedTask.column !== targetColumn) {
        moveTask(draggedTask.id, draggedTask.column, targetColumn);
    }
    
    return false;
}

// Chat Assistant Functions
function setupChatAssistant() {
    // Initial setup complete in HTML
}

function openChatAssistant() {
    chatAssistant.classList.add('open');
    chatInput.focus();
}

function closeChatAssistant() {
    chatAssistant.classList.remove('open');
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    chatInput.value = '';
    
    // Show thinking indicator
    showThinkingIndicator();
    
    // Process the message and generate a response
    setTimeout(() => {
        generateClaudeResponse(message);
    }, 1000);
}

function addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = content;
    
    messageContent.appendChild(messageParagraph);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showThinkingIndicator() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'assistant', 'thinking-message');
    
    const thinkingContent = document.createElement('div');
    thinkingContent.classList.add('message-content');
    
    const thinkingIndicator = document.createElement('div');
    thinkingIndicator.classList.add('thinking');
    thinkingIndicator.innerHTML = '<span></span><span></span><span></span>';
    
    thinkingContent.appendChild(thinkingIndicator);
    thinkingDiv.appendChild(thinkingContent);
    chatMessages.appendChild(thinkingDiv);
    
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeThinkingIndicator() {
    const thinkingMessage = document.querySelector('.thinking-message');
    if (thinkingMessage) {
        thinkingMessage.remove();
    }
}

function generateClaudeResponse(userMessage) {
    // Remove thinking indicator
    removeThinkingIndicator();
    
    // Get all tasks for context
    const allTasks = getAllTasks();
    
    // Process the user message and generate a response based on GTD principles
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        const helpResponse = "I can help you prioritize your tasks using GTD principles. You can ask me things like:\n\n" +
            "- What should I focus on next?\n" +
            "- How can I prioritize my actions?\n" +
            "- Can you analyze my current tasks?\n" +
            "- What's the GTD approach to my current projects?\n" +
            "- How should I organize my inbox items?";
        addMessageToChat('assistant', helpResponse);
    } 
    else if (lowerMessage.includes('focus') || lowerMessage.includes('next action') || lowerMessage.includes('what should i do')) {
        const nextActionAdvice = analyzeNextActions(allTasks);
        addMessageToChat('assistant', nextActionAdvice);
    } 
    else if (lowerMessage.includes('prioritize') || lowerMessage.includes('priority')) {
        const prioritizationAdvice = providePrioritizationAdvice(allTasks);
        addMessageToChat('assistant', prioritizationAdvice);
    } 
    else if (lowerMessage.includes('analyze') || lowerMessage.includes('review') || lowerMessage.includes('my tasks')) {
        const taskAnalysis = analyzeAllTasks(allTasks);
        addMessageToChat('assistant', taskAnalysis);
    } 
    else if (lowerMessage.includes('gtd') || lowerMessage.includes('getting things done')) {
        const gtdPrinciples = explainGTDPrinciples();
        addMessageToChat('assistant', gtdPrinciples);
    } 
    else if (lowerMessage.includes('inbox') || lowerMessage.includes('process')) {
        const inboxAdvice = processInbox(allTasks);
        addMessageToChat('assistant', inboxAdvice);
    } 
    else if (lowerMessage.includes('someday') || lowerMessage.includes('maybe')) {
        const somedayAdvice = handleSomedayMaybe(allTasks);
        addMessageToChat('assistant', somedayAdvice);
    } 
    else if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
        const projectsAdvice = reviewProjects(allTasks);
        addMessageToChat('assistant', projectsAdvice);
    } 
    else {
        // General response
        const generalResponse = "I'm here to help with your task management using GTD principles. You can ask me to analyze your tasks, suggest next actions, or provide prioritization advice.";
        addMessageToChat('assistant', generalResponse);
    }
}

// Get all tasks in a single array with column information
function getAllTasks() {
    const allTasks = [];
    
    Object.keys(tasks).forEach(column => {
        tasks[column].forEach(task => {
            allTasks.push({
                ...task,
                column: column
            });
        });
    });
    
    return allTasks;
}

// GTD Analysis Functions
function analyzeNextActions(allTasks) {
    const actionTasks = allTasks.filter(task => task.column === 'actions');
    
    if (actionTasks.length === 0) {
        return "You don't have any tasks in your Actions column. According to GTD, you should move your next actionable items there. Look through your Inbox and Projects to identify single, physical actions you can take right now.";
    }
    
    // Choose a couple of high-priority actions
    const priorityActions = actionTasks.slice(0, Math.min(3, actionTasks.length));
    
    let response = "Based on your Actions list, here are some next actions you might focus on:\n\n";
    
    priorityActions.forEach(task => {
        response += `• ${task.title}${task.description ? ` - ${task.description}` : ''}\n`;
    });
    
    response += "\nAccording to GTD principles, you should choose your next action based on your context (location, tools available), time available, energy level, and priority. Which of these tasks matches your current situation?";
    
    return response;
}

function providePrioritizationAdvice(allTasks) {
    // Check if inbox needs processing first
    const inboxTasks = allTasks.filter(task => task.column === 'inbox');
    
    if (inboxTasks.length > 0) {
        return "I notice you have items in your Inbox. According to GTD, you should process these first: decide if they're actionable, and if so, determine the next physical action. Move items to the appropriate columns before prioritizing your Actions.";
    }
    
    const actionTasks = allTasks.filter(task => task.column === 'actions');
    
    if (actionTasks.length === 0) {
        return "You don't have any actions to prioritize yet. Look through your Projects column and identify the next physical actions for each project, then move them to Actions.";
    }
    
    return "For prioritizing your actions according to GTD, consider these four criteria:\n\n" +
        "1. Context: What can you do in your current location with the tools available?\n" +
        "2. Time available: What actions fit within the time you have right now?\n" +
        "3. Energy level: What actions match your current physical and mental energy?\n" +
        "4. Priority: What has the highest payoff or most urgent deadline?\n\n" +
        "Unlike other systems, GTD doesn't focus on assigning traditional priorities (A, B, C) to all tasks. Instead, you choose actions that you can do right now based on your situation.";
}

function analyzeAllTasks(allTasks) {
    const inboxCount = allTasks.filter(task => task.column === 'inbox').length;
    const actionsCount = allTasks.filter(task => task.column === 'actions').length;
    const projectsCount = allTasks.filter(task => task.column === 'projects').length;
    const somedayCount = allTasks.filter(task => task.column === 'someday-maybe').length;
    
    let analysis = "Here's an analysis of your Kanban board from a GTD perspective:\n\n";
    
    analysis += `• Inbox: ${inboxCount} items - `;
    if (inboxCount > 5) {
        analysis += "Your inbox is getting full. Consider processing these items soon.\n";
    } else if (inboxCount > 0) {
        analysis += "You have a few items to process.\n";
    } else {
        analysis += "Empty! Good job processing your inbox.\n";
    }
    
    analysis += `• Actions: ${actionsCount} items - `;
    if (actionsCount > 20) {
        analysis += "This is quite a lot of next actions. Consider reviewing if all of these are truly single, physical actions.\n";
    } else if (actionsCount > 0) {
        analysis += "You have a good list of next actions to choose from.\n";
    } else {
        analysis += "No next actions defined. Look through your projects to identify what actions you can take now.\n";
    }
    
    analysis += `• Projects: ${projectsCount} items - `;
    if (projectsCount > 10) {
        analysis += "You have many active projects. Consider if some should be moved to Someday/Maybe.\n";
    } else if (projectsCount > 0) {
        analysis += "Make sure each project has at least one next action in your Actions column.\n";
    } else {
        analysis += "No projects defined. Projects are outcomes requiring multiple steps.\n";
    }
    
    analysis += `• Someday/Maybe: ${somedayCount} items - `;
    if (somedayCount > 0) {
        analysis += "These items are for your regular GTD review. Consider if any should be activated as projects now.\n";
    } else {
        analysis += "No items for future consideration. This list can hold ideas you're not ready to commit to yet.\n";
    }
    
    return analysis;
}

function explainGTDPrinciples() {
    return "Getting Things Done (GTD) is a productivity method created by David Allen based on these key principles:\n\n" +
        "1. Capture: Collect everything that has your attention in trusted external systems (like your Inbox column).\n\n" +
        "2. Clarify: Process what you've captured by asking 'Is it actionable?'\n" +
        "   - If NO: Trash it, reference it, or put in Someday/Maybe\n" +
        "   - If YES: Decide the next action and do it (if under 2 minutes), delegate it, or defer it\n\n" +
        "3. Organize: Put items where they belong:\n" +
        "   - Next actions go to Actions column\n" +
        "   - Project outcomes go to Projects column\n" +
        "   - Future possibilities go to Someday/Maybe column\n\n" +
        "4. Reflect: Review your system regularly (daily and weekly reviews)\n\n" +
        "5. Engage: Simply do the actions you've identified based on context, time, energy, and priority\n\n" +
        "Your kanban board already follows this structure with its columns!";
}

function processInbox(allTasks) {
    const inboxTasks = allTasks.filter(task => task.column === 'inbox');
    
    if (inboxTasks.length === 0) {
        return "Your Inbox is empty - great job! Following GTD principles, you've processed all incoming items.";
    }
    
    let response = "Here's how to process your Inbox according to GTD:\n\n";
    
    if (inboxTasks.length > 0) {
        response += "For each item, ask: 'Is it actionable?'\n\n";
        
        response += "If NOT actionable:\n";
        response += "• Trash it if it's not needed\n";
        response += "• Reference it if you might need the information later\n";
        response += "• Move it to Someday/Maybe if it's something for the future\n\n";
        
        response += "If it IS actionable:\n";
        response += "• If it takes less than 2 minutes, do it immediately\n";
        response += "• If it's a multi-step project, move it to Projects\n";
        response += "• Otherwise, identify the next physical action and move it to Actions\n\n";
        
        response += "Let's practice with a few items from your Inbox:\n\n";
        
        // Provide specific advice for up to 3 inbox items
        const sampleItems = inboxTasks.slice(0, Math.min(3, inboxTasks.length));
        
        sampleItems.forEach(task => {
            response += `• "${task.title}": `;
            
            // Simple heuristic for demonstration - in reality would need more complex analysis
            if (task.title.toLowerCase().includes('idea') || task.title.toLowerCase().includes('maybe')) {
                response += "This sounds like a Someday/Maybe item if you're not ready to act on it yet.\n";
            } else if (task.title.toLowerCase().includes('project') || task.description && task.description.length > 50) {
                response += "This might be a project requiring multiple steps. Consider moving to Projects.\n";
            } else {
                response += "Identify the next physical action and move to Actions.\n";
            }
        });
    }
    
    return response;
}

function handleSomedayMaybe(allTasks) {
    const somedayTasks = allTasks.filter(task => task.column === 'someday-maybe');
    
    if (somedayTasks.length === 0) {
        return "You don't have any items in your Someday/Maybe list. This is where you store ideas, projects, or tasks that you're interested in but not committed to doing right now. During your weekly review, you can check if any of these should be activated.";
    }
    
    let response = "Your Someday/Maybe list contains items you might want to do in the future. In GTD, you should review this list regularly (typically in your weekly review) to see if any items should be activated now.\n\n";
    
    response += "Some questions to ask about each Someday/Maybe item:\n";
    response += "• Has its priority or relevance changed?\n";
    response += "• Do you have the resources (time, energy, tools) to take it on now?\n";
    response += "• Is this the right season or context to start this?\n";
    response += "• Is there a deadline approaching that makes this more urgent?\n\n";
    
    response += "If you decide to activate an item, move it to Projects (if it requires multiple steps) or directly to Actions (if it's a single task).";
    
    return response;
}

function reviewProjects(allTasks) {
    const projectTasks = allTasks.filter(task => task.column === 'projects');
    
    if (projectTasks.length === 0) {
        return "You don't have any projects defined. In GTD, a project is any outcome requiring more than one action step. Review your actions and someday/maybe items to see if any should be promoted to projects.";
    }
    
    let response = "In GTD, projects are outcomes requiring multiple steps. For each project, you should:\n\n";
    response += "• Clearly define the successful outcome (what 'done' looks like)\n";
    response += "• Identify the very next physical action needed to move it forward\n";
    response += "• Ensure each project has at least one next action in your Actions column\n\n";
    
    response += "During your weekly review, ask for each project:\n";
    response += "• Is this still relevant and active?\n";
    response += "• What's the next action needed?\n";
    response += "• Are there any waiting-for items related to this?\n";
    response += "• Should this be deferred to Someday/Maybe?\n\n";
    
    if (projectTasks.length > 0) {
        response += "Here are some of your current projects. For each one, ensure you have a clear next action in your Actions column:\n\n";
        
        const sampleProjects = projectTasks.slice(0, Math.min(3, projectTasks.length));
        
        sampleProjects.forEach(project => {
            response += `• ${project.title}\n`;
        });
    }
    
    return response;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init); 