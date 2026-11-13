# 🧩 Components Guide

This document provides an overview of the main UI components used in the application.

## Component Categories

### Navigation Components

#### Navbar (`Components/Navbar.jsx`)

Main navigation bar displayed on all pages.

**Features:**
- Logo and brand
- Navigation links
- Theme toggle (light/dark mode)
- User authentication status
- Mobile responsive menu

**Key States:**
- `darkMode` - Current theme state
- `isMenuOpen` - Mobile menu toggle

**Theme Logic:**
```jsx
// Theme is stored in localStorage
const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark" ? true : false
);

// Default theme is light mode
useEffect(() => {
  if (!localStorage.getItem("theme")) {
    setDarkMode(false);
    localStorage.setItem("theme", "light");
  }
}, []);
```

---

#### Sidebar (`Components/Sidebar.jsx`)

Admin dashboard sidebar navigation.

**Features:**
- Navigation menu for admin sections
- Collapsible on mobile
- Active link highlighting

---

### Course Components

#### Course Cards

Display course information in card format.

**Usage:**
```jsx
<CourseCard 
  course={courseData}
  onClick={() => navigate(`/courses/${courseData._id}`)}
/>
```

---

#### ExamModal (`Components/ExamModal.jsx`)

Modal for taking exams/quizzes.

**Features:**
- Question display with options
- Timer functionality
- Auto-submit on time end
- Progress tracking

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `exam` | Object | Exam data with questions |
| `isOpen` | Boolean | Modal visibility |
| `onClose` | Function | Close handler |
| `onSubmit` | Function | Submit handler |
| `timeLimit` | Number | Time in minutes |

---

### Form Components

#### Input Fields

Standard input styling:

```jsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 
             border border-gray-200 dark:border-gray-700 
             text-gray-900 dark:text-white 
             placeholder-gray-400 
             focus:outline-none focus:border-green-500 dark:focus:border-blue-500 
             focus:ring-2 focus:ring-green-500/20 dark:focus:ring-blue-500/20 
             transition-colors"
  placeholder="Placeholder text..."
/>
```

#### Select Dropdowns

```jsx
<select className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 
                   text-gray-900 dark:text-white 
                   focus:outline-none focus:border-green-500 
                   appearance-none cursor-pointer">
  <option value="">Select option</option>
</select>
```

#### Buttons

**Primary Button:**
```jsx
<button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 
                   text-white font-semibold 
                   hover:from-green-600 hover:to-green-700 
                   transition-all duration-300 
                   shadow-lg shadow-green-500/25">
  Primary Action
</button>
```

**Secondary Button:**
```jsx
<button className="px-6 py-3 rounded-xl 
                   border border-gray-200 dark:border-gray-700 
                   text-gray-700 dark:text-gray-300 
                   hover:bg-gray-50 dark:hover:bg-gray-800 
                   transition-all duration-300">
  Secondary Action
</button>
```

**Destructive Button:**
```jsx
<button className="px-6 py-3 rounded-xl 
                   bg-green-500 text-white 
                   hover:bg-green-600 
                   transition-all duration-300">
  Delete
</button>
```

---

### Card Components

**Standard Card:**
```jsx
<div className="bg-white dark:bg-gray-800 
                rounded-2xl p-6 
                border border-gray-200 dark:border-gray-700 
                shadow-sm 
                hover:shadow-lg transition-all duration-300">
  {/* Card content */}
</div>
```

**Interactive Card:**
```jsx
<div className="group bg-white dark:bg-gray-800 
                rounded-2xl p-6 
                border border-gray-200 dark:border-gray-700 
                cursor-pointer 
                hover:border-green-500/50 dark:hover:border-blue-500/50 
                hover:shadow-xl hover:shadow-green-500/10 
                transition-all duration-300">
  {/* Clickable card content */}
</div>
```

---

### Table Components

**Responsive Table:**
```jsx
<div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700/50">
          <th className="text-right px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
            Column Header
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       hover:bg-gray-50 dark:hover:bg-gray-700/50 
                       transition-colors">
          <td className="px-6 py-4 text-gray-900 dark:text-white">
            Cell content
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### Feedback Components

#### Loading Spinner

```jsx
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-12 w-12 
                  border-b-2 border-green-500 dark:border-blue-500">
  </div>
</div>
```

#### Empty State

```jsx
<div className="text-center py-20 text-gray-500 dark:text-gray-400">
  <FaIcon className="text-6xl mx-auto mb-4 opacity-30" />
  <p className="text-xl">No items found</p>
</div>
```

#### Toast Notifications

Using react-hot-toast:

```jsx
import { toast } from 'react-hot-toast';

// Success
toast.success('Operation completed successfully');

// Error
toast.error('Something went wrong');

// Custom
toast('Custom message', { icon: '👋' });
```

---

## Component Best Practices

1. **Use consistent spacing** - Use Tailwind's spacing scale (p-4, p-6, gap-4, etc.)
2. **Always include dark mode** - Add `dark:` variants for all colors
3. **Follow RTL conventions** - Use `text-right` and directional properties
4. **Add transitions** - Use `transition-all duration-300` for smooth interactions
5. **Use semantic colors** - Success=red, Error=red, Warning=emerald, Info=blue
6. **Make components responsive** - Use responsive prefixes (sm:, md:, lg:)

## Icon Usage

The project uses `react-icons` library:

```jsx
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaPlus 
} from 'react-icons/fa';

// Usage
<FaUser className="w-5 h-5 text-gray-500" />
```

Common icon packages:
- `react-icons/fa` - Font Awesome
- `react-icons/hi` - Heroicons
- `react-icons/md` - Material Design
