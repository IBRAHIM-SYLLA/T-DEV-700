# TimeTrack Pro - Component Architecture Documentation

## 📁 Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── buttons/         # Button components
│   │   ├── Button.jsx          # Base button component
│   │   ├── SpecializedButtons.jsx  # Specialized buttons (Clock, Login, etc.)
│   │   └── index.js            # Button exports
│   ├── common/          # Common UI components
│   │   ├── StatusBadge.jsx     # Status indicator badges
│   │   ├── Card.jsx            # Reusable card component
│   │   ├── LoadingSpinner.jsx  # Loading spinner
│   │   ├── FormInput.jsx       # Form input with validation
│   │   └── index.js            # Common component exports
│   └── index.js         # Main component exports
├── utils/               # Utility functions
│   ├── timeUtils.js     # Time and date utilities
│   ├── storageUtils.js  # localStorage utilities
│   ├── businessLogic.js # Business logic functions
│   └── index.js         # Utility exports
├── pages/               # Page components
├── style/               # Styling
└── ...
```

## 🔧 Components

### Buttons (`/components/buttons/`)

#### Base Button Component
```jsx
import { Button } from '../../components';

<Button 
  variant="primary"     // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline'
  size="medium"         // 'small' | 'medium' | 'large'
  icon="🎯"            // Optional icon
  disabled={false}      // Disabled state
  onClick={handleClick}
>
  Button Text
</Button>
```

#### Specialized Buttons
```jsx
import { ClockInButton, ClockOutButton, LoginButton, LogoutButton, EditProfileButton, BackButton, SaveButton, CancelButton } from '../../components';

// Pointage buttons
<ClockInButton onClick={handleClockIn} disabled={isPresent} />
<ClockOutButton onClick={handleClockOut} disabled={!isPresent} />

// Auth buttons
<LoginButton onClick={handleLogin} loading={isLoading} />
<LogoutButton onClick={handleLogout} />

// Profile buttons
<EditProfileButton onClick={openProfile} />
<BackButton onClick={goBack} text="Retour" />
<SaveButton onClick={save} loading={isSaving} />
<CancelButton onClick={cancel} />
```

### Common Components (`/components/common/`)

#### Status Badge
```jsx
import { StatusBadge } from '../../components';

<StatusBadge 
  status="Retard 5min"
  variant="late"        // 'success' | 'warning' | 'danger' | 'info' | 'late'
  style={{ marginLeft: '8px' }}
/>
```

#### Card Component
```jsx
import { Card } from '../../components';

<Card 
  title="Card Title"
  icon="📊"
  hoverable={true}
  onClick={handleCardClick}
>
  Card content goes here
</Card>
```

#### Form Input
```jsx
import { FormInput } from '../../components';

<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Entrez votre email"
  required={true}
  error={emailError}
/>
```

#### Loading Spinner
```jsx
import { LoadingSpinner } from '../../components';

<LoadingSpinner 
  size="medium"         // 'small' | 'medium' | 'large'
  color="#3b82f6"
  text="Chargement..."
/>
```

## 🛠 Utilities (`/utils/`)

### Time Utilities
```jsx
import { 
  formatTime, 
  formatDate, 
  formatDuration, 
  getCurrentDateKey,
  differenceInMinutes,
  createStandardStartTime,
  parseEarliestStartTime 
} from '../../utils';

// Format time to French locale (14:30)
const timeStr = formatTime(new Date()); 

// Format date to French locale (24/10/2025)
const dateStr = formatDate(new Date());

// Format duration (8.5 hours → "8h 30m")
const durationStr = formatDuration(8.5);

// Get localStorage date key
const dateKey = getCurrentDateKey(); // "Mon Oct 24 2025"

// Calculate difference in minutes
const diff = differenceInMinutes(laterDate, earlierDate);

// Create standard work start time (09:00 for given date)
const startTime = createStandardStartTime(new Date(), 9, 0);
```

### Storage Utilities
```jsx
import { 
  getTimeTrackData, 
  saveTimeTrackData, 
  getCurrentUser, 
  saveCurrentUser, 
  getHistoryData, 
  saveHistoryData, 
  updateTodayInHistory 
} from '../../utils';

// Get/save timetrack data
const data = getTimeTrackData(dateKey);
saveTimeTrackData(dateKey, timeData);

// User management
const user = getCurrentUser();
saveCurrentUser(userObject);

// History management
const history = getHistoryData();
updateTodayInHistory(todayRecord);
```

### Business Logic
```jsx
import { 
  calculateLateness, 
  calculateTotalOvertime, 
  createSessionObject, 
  createDailySummary, 
  filterRecordsByPeriod 
} from '../../utils';

// Calculate lateness with tolerance
const { lateMinutes, earlyMinutes, overtimeBonus } = calculateLateness(
  sessions, 
  currentSessionStart, 
  5,  // tolerance minutes
  9   // standard hour
);

// Calculate total overtime
const overtime = calculateTotalOvertime(workedHours, overtimeBonus);

// Create session object
const session = createSessionObject(sessionNumber, startTime, endTime);

// Create daily summary
const summary = createDailySummary(sessions, date);

// Filter records by period
const filtered = filterRecordsByPeriod(records, 'Ce mois');
```

## 🎯 Migration Benefits

### Before (Old Code)
```jsx
// Duplicated button styling in every file
<button 
  style={{
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    // ... more styles
  }}
  onClick={handleClick}
>
  Button
</button>

// Duplicated time formatting
const formatTime = (date) => {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Duplicated localStorage logic
const data = JSON.parse(localStorage.getItem(`timeTrack_${dateKey}`) || '{}');
```

### After (New Architecture)
```jsx
// Clean, reusable components
<Button variant="primary" onClick={handleClick}>
  Button
</Button>

// Centralized utilities
import { formatTime, getTimeTrackData } from '../../utils';
const timeStr = formatTime(date);
const data = getTimeTrackData(dateKey);
```

## 🚀 Production Benefits

1. **Code Reusability**: Components are reused across multiple pages
2. **Consistency**: All buttons, badges, and UI elements look identical
3. **Maintainability**: Change styling in one place, affects entire app
4. **Debugging**: Centralized logic is easier to debug and test
5. **Performance**: Less duplicated code = smaller bundle size
6. **Developer Experience**: Import what you need, IntelliSense support
7. **Testing**: Test utilities and components independently

## 📝 Usage Examples

### Converting Old Pointage to New Architecture
```jsx
// OLD WAY
const formatTime = (date) => { /* duplicate code */ };
<button style={complexStyles} onClick={handleClockIn}>Clock In</button>

// NEW WAY
import { formatTime, ClockInButton } from '../../utils', '../../components';
<ClockInButton onClick={handleClockIn} disabled={isPresent} />
```

### Converting Old MonResume to New Architecture
```jsx
// OLD WAY
const formatDuration = (hours) => { /* duplicate code */ };
<span style={badgeStyles}>Retard 5min</span>

// NEW WAY
import { formatDuration, StatusBadge } from '../../utils', '../../components';
<StatusBadge status="Retard 5min" variant="late" />
```

This architecture makes the codebase more maintainable, scalable, and production-ready! 🎉