# TaskFlow - Modern Task Manager

A professional, feature-rich task management web application built with vanilla JavaScript, HTML, and CSS. TaskFlow demonstrates mastery of CRUD operations, data persistence with localStorage, and modern web development practices.

![TaskFlow Preview](assets/preview.png)
*Screenshot placeholder - add your own screenshot here*

## Live Demo

[View Live Demo](#) *(Add your deployed link here)*

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [LocalStorage Implementation](#localstorage-implementation)
- [CRUD Operations](#crud-operations)
- [External Libraries](#external-libraries)
- [Code Architecture](#code-architecture)
- [Browser Compatibility](#browser-compatibility)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

TaskFlow is a comprehensive task management application designed to showcase modern frontend development skills. Built entirely with vanilla JavaScript, it demonstrates:

- **Data Persistence**: Robust localStorage implementation with error handling
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Modular Architecture**: Clean separation of concerns (Storage, UI, App Logic)
- **Modern UI/UX**: Distinctive design with smooth animations and micro-interactions
- **Responsive Design**: Mobile-first approach that works on all devices

### Purpose

This project serves as a portfolio piece demonstrating:
1. Proficiency in vanilla JavaScript without framework dependencies
2. Understanding of browser storage APIs and data management
3. Ability to create professional, production-ready interfaces
4. Clean code practices and architectural design patterns

---

## Features

### Core Functionality

- **Task Management**
  - ✅ Create new tasks with title, description, category, priority, and due date
  - ✏️ Edit existing tasks inline
  - 🗑️ Delete tasks with confirmation prompts
  - ✔️ Mark tasks as complete/incomplete
  - 📊 Visual hierarchy (incomplete tasks first, then completed)

- **Organization & Filtering**
  - Custom categories with color coding
  -  Real-time search across task titles and descriptions
  -  Filter by category, status (pending/completed), or both
  -  Sort by date, priority, or alphabetically
  - Live statistics (total, completed, pending tasks)

- **Data Management**
  - Automatic saving to localStorage
  - Export all data as JSON backup
  - Import data from JSON file
  - Clear all completed tasks in one click
  - Data persists across browser sessions

- **User Experience**
  - 🌓 Dark/Light theme toggle
  - 🎨 Color-coded priority levels (High/Medium/Low)
  - ⏰ Overdue task indicators
  - 🎯 Empty state messages
  - ⌨️ Keyboard shortcuts (Ctrl/Cmd + K to add task, Esc to close modals)

### Visual Features

- **Animations**
  - Smooth entrance animations for task cards
  - Micro-interactions on hover and click
  - Staggered reveal animations
  - Success/error flash animations
  - Modal scaling and fade effects

- **Background Effects**
  - Interactive particle system (Particles.js)
  - Responsive to mouse hover and clicks
  - Configurable particle colors and behaviors

- **Design Highlights**
  - Refined brutalist aesthetic
  - Distinctive typography (Syne + IBM Plex Mono)
  - Muted earth tone palette with vibrant accents
  - Geometric layouts with intentional asymmetry
  - Professional color-coding system

---

## 🛠️ Technologies Used

### Core Technologies
- **HTML5** - Semantic markup structure
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)** - Modular architecture, async operations

### External Libraries

| Library | Version | Purpose | CDN Link |
|---------|---------|---------|----------|
| **Font Awesome** | 6.4.2 | Icons for UI elements | [Link](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css) |
| **Particles.js** | 2.0.0 | Interactive background particles | [Link](https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js) |
| **AOS** | 2.3.4 | Scroll-triggered animations | [Link](https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css) |
| **Google Fonts** | - | Syne & IBM Plex Mono fonts | [Link](https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap) |

**Why These Libraries?**
- **Font Awesome**: Industry-standard icon library, lightweight and comprehensive
- **Particles.js**: It's the first one ive ever used easy to Add, creates visual depth without impacting performance
- **AOS**: Provides smooth scroll animations with minimal JavaScript
- **Google Fonts**: Distinctive typography that avoids generic system fonts

---

## Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Jia-Son/taskflow.git
   cd taskflow
   ```

2. **Open in Browser**
   - Simply open `index.html` in your browser, OR
   - Use a local server (recommended):
   
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Start Using**
   - Navigate to `http://localhost:8000` (if using server)
   - Start creating tasks!

### No Build Process Required
This is a vanilla JavaScript application with no dependencies or build tools. All libraries are loaded via CDN.

---

## 📁 Project Structure

```
taskflow/
│
├── index.html              # Main HTML file
│
├── css/
│   ├── style.css          # Main styles with CSS variables
│   └── animations.css     # Animation keyframes and classes
│
├── js/
│   ├── storage.js         # LocalStorage operations (CRUD)
│   ├── ui.js              # UI rendering and DOM manipulation
│   └── app.js             # Main application controller
│
├── assets/
│   └── preview.png        # Screenshot for README
│
└── README.md              # This file
```

### File Responsibilities

**index.html**
- Semantic HTML structure
- CDN imports for external libraries
- Modal dialogs for forms and confirmations
- Accessibility attributes

**css/style.css**
- CSS custom properties (variables) for theming
- Layout with Grid and Flexbox
- Responsive design with media queries
- Component styling

**css/animations.css**
- Keyframe animations
- Transition definitions
- Micro-interaction effects
- Reduced motion support

**js/storage.js**
- localStorage abstraction layer
- CRUD operations for tasks
- CRUD operations for categories
- Data validation and error handling
- Import/export functionality

**js/ui.js**
- DOM manipulation
- Task card rendering
- Modal management
- Statistics updates
- Notification system

**js/app.js**
- Application initialization
- Event listener setup
- State management
- Filter and sort logic
- Controller for coordinating storage and UI

---

## Usage Guide

### Creating a Task

1. Click **"Add New Task"** button
2. Fill in the form:
   - **Title**: Task name (required)
   - **Description**: Additional details (optional)
   - **Category**: Select or create a category (required)
   - **Priority**: High, Medium, or Low (required)
   - **Due Date**: Deadline for the task (required)
3. Click **"Save Task"**

### Editing a Task

1. Click the **Edit icon** (pencil) on any task card
2. Modify the desired fields
3. Click **"Save Task"**

### Completing Tasks

- Click the **checkbox** on any task to mark it complete
- Completed tasks are visually dimmed and move to the bottom
- Click again to mark as incomplete

### Deleting Tasks

1. Click the **Delete icon** (trash) on any task card
2. Confirm the deletion in the popup

### Creating Categories

1. When adding/editing a task, click the **"+"** button next to the category dropdown
2. Enter a category name
3. Choose a color
4. Click **"Add Category"**

### Filtering & Sorting

- **Search**: Type in the search box to filter by title/description
- **Category Filter**: Select a category from the dropdown
- **Status Filter**: Show all, pending, or completed tasks
- **Sort**: Order by date, priority, or alphabetically

### Import/Export Data

**Export**
1. Click the **Download icon** in the header
2. A JSON file will be downloaded with all your data

**Import**
1. Click the **Upload icon** in the header
2. Select a previously exported JSON file
3. Your data will be restored

### Theme Toggle

Click the **Moon/Sun icon** in the header to switch between light and dark themes.

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open "Add Task" modal
- `Esc` - Close any open modal

---

## LocalStorage Implementation

### Data Structure

TaskFlow uses three separate localStorage keys for organization:

```javascript
// Tasks
localStorage.getItem('taskflow_tasks')
[
  {
    id: "task_1737889234567_abc123",
    title: "Complete project proposal",
    description: "Draft and finalize Q1 proposal",
    category: "cat_1",
    priority: "high",
    dueDate: "2026-02-01",
    completed: false,
    createdAt: "2026-01-26T10:30:00.000Z",
    completedAt: null
  }
]

// Categories
localStorage.getItem('taskflow_categories')
[
  {
    id: "cat_1",
    name: "Work",
    color: "#3b82f6"
  }
]

// Settings
localStorage.getItem('taskflow_settings')
{
  theme: "light",
  sortBy: "date",
  filterCategory: "all",
  filterStatus: "all"
}
```

### Error Handling

The application includes comprehensive error handling:

```javascript
// 1. localStorage availability check
isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
}

// 2. Quota exceeded handling
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('Storage quota exceeded. Please delete some tasks.');
  }
}

// 3. Data parsing safety
try {
  const data = JSON.parse(localStorage.getItem(key));
  return data || defaultValue;
} catch (error) {
  console.error('Error parsing data:', error);
  return defaultValue;
}
```

### Best Practices Implemented

1. **Abstraction Layer**: All localStorage operations are encapsulated in `StorageManager`
2. **Data Validation**: Input validation before saving
3. **Error Recovery**: Graceful fallbacks when localStorage fails
4. **Structured Keys**: Prefixed keys (`taskflow_*`) to avoid conflicts
5. **JSON Serialization**: Proper serialization/deserialization
6. **Atomic Operations**: Each CRUD operation is independent
7. **Initialization**: Auto-initialize with default data if empty

### localStorage Limitations

- **Storage Limit**: ~5-10MB depending on browser
- **Synchronous API**: Blocks main thread (minimal impact for this use case)
- **String Only**: All data must be serialized to JSON
- **Domain-Specific**: Data only accessible from the same origin
- **No Encryption**: Data stored in plain text

---

## 🔄 CRUD Operations

All CRUD operations are implemented in `storage.js` with comprehensive error handling.

### CREATE Operations

**Add Task**
```javascript
addTask(task) {
  // 1. Generate unique ID
  task.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 2. Add timestamps
  task.createdAt = new Date().toISOString();
  task.completed = false;
  task.completedAt = null;
  
  // 3. Save to storage
  const tasks = this.getTasks();
  tasks.push(task);
  return this.saveTasks(tasks);
}
```

**Add Category**
```javascript
addCategory(category) {
  const categories = this.getCategories();
  
  // Prevent duplicates
  if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
    return false;
  }
  
  category.id = `cat_${Date.now()}`;
  categories.push(category);
  return this.saveCategories(categories);
}
```

### READ Operations

**Get All Tasks**
```javascript
getTasks() {
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}
```

**Get Task by ID**
```javascript
getTaskById(taskId) {
  const tasks = this.getTasks();
  return tasks.find(t => t.id === taskId) || null;
}
```

### UPDATE Operations

**Update Task**
```javascript
updateTask(taskId, updates) {
  const tasks = this.getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return false;
  
  // Merge updates with existing task
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  
  return this.saveTasks(tasks);
}
```

**Toggle Task Completion**
```javascript
toggleTaskComplete(taskId) {
  const tasks = this.getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return false;
  
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  
  return this.saveTasks(tasks);
}
```

### DELETE Operations

**Delete Task**
```javascript
deleteTask(taskId) {
  const tasks = this.getTasks();
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  
  if (filteredTasks.length === tasks.length) {
    return false; // Task not found
  }
  
  return this.saveTasks(filteredTasks);
}
```

**Clear Completed Tasks**
```javascript
clearCompletedTasks() {
  const tasks = this.getTasks();
  const activeTasks = tasks.filter(t => !t.completed);
  return this.saveTasks(activeTasks);
}
```

---

## 🎨 External Libraries

### Particles.js Configuration

Interactive particle background that responds to user interaction:

```javascript
particlesJS('particles-js', {
  particles: {
    number: { value: 50 },
    color: { value: '#d97706' },
    opacity: { value: 0.3, random: true },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      opacity: 0.2
    },
    move: {
      enable: true,
      speed: 2,
      random: true
    }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' }
    }
  }
});
```

### AOS (Animate On Scroll)

Adds entrance animations to elements as they scroll into view:

```javascript
AOS.init({
  duration: 600,    // Animation duration in ms
  once: true,       // Only animate once
  offset: 50        // Offset from trigger point
});
```

### Font Awesome

Provides icon fonts for all UI elements:

```html
<i class="fas fa-plus"></i>        <!-- Add icon -->
<i class="fas fa-edit"></i>        <!-- Edit icon -->
<i class="fas fa-trash"></i>       <!-- Delete icon -->
<i class="fas fa-check-circle"></i> <!-- Complete icon -->
```

---

## 🏗️ Code Architecture

### Design Patterns

**1. Module Pattern**
Each JavaScript file is organized as a module with a single responsibility:
- `StorageManager`: Data layer
- `UIManager`: Presentation layer
- `AppController`: Application logic layer

**2. Separation of Concerns**
- HTML: Structure only
- CSS: Presentation only
- JavaScript: Behavior only

**3. Event Delegation**
Used for dynamically created elements to improve performance:
```javascript
// Instead of adding listeners to each task
// We use inline handlers that call controller methods
onclick="AppController.deleteTask('${task.id}')"
```

### State Management

Application state is centralized in `AppController`:

```javascript
state: {
  currentTasks: [],        // All tasks from storage
  currentCategories: [],   // All categories
  settings: {},            // User preferences
  editingTaskId: null     // Track which task is being edited
}
```

### Data Flow

```
User Action
    ↓
AppController (handles event)
    ↓
StorageManager (updates localStorage)
    ↓
AppController (reloads data)
    ↓
UIManager (renders updated view)
```

---

## 🌐 Browser Compatibility

### Tested Browsers
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Required Features
- CSS Grid and Flexbox
- ES6+ JavaScript (const, let, arrow functions, template literals)
- localStorage API
- CSS Custom Properties
- Fetch API (for external libraries)

### Fallbacks
- Prefers-reduced-motion media query for accessibility
- Graceful degradation if localStorage is unavailable
- Console warnings for missing features

---

## ⚠️ Known Limitations

1. **Storage Capacity**
   - Limited to ~5-10MB of data
   - No warning when approaching limit
   - Solution: Implement data cleanup or suggest export

2. **No Cloud Sync**
   - Data is device/browser-specific
   - Clearing browser data deletes all tasks
   - Solution: Use export/import feature for backups

3. **Single User**
   - No multi-user support or authentication
   - Not suitable for team collaboration
   - Solution: Future backend implementation

4. **No Recurring Tasks**
   - Tasks are one-time only
   - Solution: Add repeat functionality in future version

5. **Limited Task Details**
   - No subtasks or attachments
   - No task dependencies
   - Solution: Future enhancement

6. **Browser-Dependent**
   - Requires JavaScript enabled
   - Requires modern browser features
   - No offline-first progressive web app features

---

## Future Enhancements

### Planned Features

**Short Term**
- [ ] Task templates for recurring tasks
- [ ] Bulk task operations (select multiple, bulk delete)
- [ ] Drag-and-drop task reordering
- [ ] Task notes with Markdown support
- [ ] Keyboard navigation improvements

**Medium Term**
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality with Service Workers
- [ ] Task reminders/notifications
- [ ] Subtasks/checklists
- [ ] Task dependencies
- [ ] Color customization per category
- [ ] Custom sort options

**Long Term**
- [ ] Backend integration (Firebase/Supabase)
- [ ] User authentication
- [ ] Cloud sync across devices
- [ ] Team collaboration features
- [ ] Task sharing
- [ ] Calendar integration
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Unit tests with Jest
- [ ] E2E tests with Playwright
- [ ] Performance monitoring
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Bundle optimization
- [ ] TypeScript migration

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
1. Check if the issue already exists
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and version

### Suggesting Features
1. Create an issue with the "enhancement" label
2. Describe the feature and use case
3. Provide mockups if applicable

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Test in multiple browsers

---

## License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

##  Author

**Sonia Amanyi**
- Portfolio: [myfuturewebsite.com](#)
- GitHub: [@Jima-Son](https://github.com/Jima-Son)
- LinkedIn: [Sonia Amanyi](https://www.linkedin.com/in/sonia-amanyi-9a3ab5308/)
- Email: pwyahahiri@gmail.com

---

## 🙏 Acknowledgments

- **Font Awesome** for comprehensive icon library
- **Particles.js** by Vincent Garreau for particle effects
- **AOS** by Michał Sajnóg for scroll animations
- **Google Fonts** for beautiful typography
- The open-source community for inspiration and resources

---

## 📊 Project Stats

- **Lines of Code**: ~1,500+
- **Files**: 6 (HTML, CSS, JS)
- **External Dependencies**: 4 (all via CDN)
- **Browser Support**: Modern browsers (ES6+)
- **Development Time**: 3-5 days
- **Status**: ✅ Production Ready

---

**⭐ If you found this project helpful, please star the repository!**

---

*Last Updated: January 2026*
