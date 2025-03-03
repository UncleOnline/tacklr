# Simple Kanban Board with Claude GTD Assistant

A lightweight Kanban board web application built with HTML, CSS, and vanilla JavaScript. This app helps you organize your tasks in a visual way across four different categories, and includes an AI assistant powered by Claude to help you prioritize tasks using the Getting Things Done (GTD) methodology.

## Features

- Four GTD-inspired columns: Inbox, Actions, Projects, and Someday/Maybe
- Drag and drop functionality to move tasks between columns
- Create, edit, and delete tasks
- Task details including title and description
- Data persistence using localStorage
- Responsive design that works on mobile and desktop
- **Claude AI Assistant** that helps you apply GTD principles to your task management
- **User authentication system** with personalized task storage
- **Multi-user support** with separate Kanban boards for each user

## How to Use

1. **Login or Register**:
   - Use the login page to create an account or sign in
   - Each user gets their own personalized Kanban board

2. **Add a new task**:
   - Click the "+ Add New Task" button at the top of the page to add a task to the Inbox
   - Or click the "+" button at the top of any column to add a task directly to that column

3. **Edit a task**:
   - Hover over a task and click the edit (pencil) icon

4. **Delete a task**:
   - Hover over a task and click the delete (trash) icon
   - Confirm your choice in the popup dialog

5. **Move a task between columns**:
   - Simply drag and drop a task from one column to another

6. **Use the Claude AI Assistant**:
   - Click the chat icon in the bottom right corner to open the assistant
   - Ask questions about task prioritization, GTD methodology, or for advice on organizing your tasks
   - Claude can analyze your current tasks and provide customized guidance

## Claude GTD Assistant

The AI assistant can help you apply Getting Things Done principles to your task management:

- **Ask for next actions**: Get recommendations on which tasks to focus on next
- **Analyze your board**: Receive a GTD-based analysis of your current tasks across all columns
- **Process your inbox**: Get guidance on how to process items in your inbox
- **Review projects**: Learn how to effectively manage your projects list
- **Prioritize actions**: Understand GTD's approach to prioritization based on context, time, energy, and priority
- **Manage someday/maybe items**: Get advice on handling your future possibilities list
- **Learn GTD principles**: Ask about GTD methodology and how to apply it to your workflow

Example questions you can ask Claude:
- "What should I focus on next?"
- "Can you analyze my current tasks?"
- "How should I process my inbox items?"
- "What's the GTD approach to prioritization?"
- "Can you explain GTD principles?"

## Getting Started

To run this application locally:

1. Clone or download this repository
2. Open the `login.html` file in your web browser
3. Create an account with any username and password (for demo purposes)
4. Start organizing your tasks!

No build process, dependencies, or installation is required. The app works entirely in your browser.

## Deployment

This application can be easily deployed online. See the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions on how to:

- Deploy to GitHub Pages (free and easy)
- Deploy to Netlify (more features)
- Use other static hosting options
- Set up a custom domain
- Enhance security for production use

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses the browser's Drag and Drop API for task movement
- Saves data to the browser's localStorage for persistence
- Multi-user support with user-specific localStorage
- Fully responsive design using CSS Grid and Flexbox
- Font Awesome icons for improved user experience
- Simulated Claude AI integration with pre-programmed GTD advice patterns

## Browser Compatibility

This application works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- HTML5 Drag and Drop API
- localStorage

## License

MIT 