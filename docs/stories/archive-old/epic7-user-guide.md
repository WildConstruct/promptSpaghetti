# Epic 7 User Guide: Advanced Settings & Palette Categorization

This guide covers the new features introduced in Epic 7: Advanced Settings Modal and Enhanced Palette Categorization System.

## Table of Contents

1. [Advanced Settings Modal](#advanced-settings-modal)
2. [Enhanced Palette System](#enhanced-palette-system)
3. [Search & Favorites](#search--favorites)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Import/Export Settings](#importexport-settings)
6. [Troubleshooting](#troubleshooting)

## Advanced Settings Modal

The Advanced Settings Modal provides comprehensive control over graph execution, batch processing, performance monitoring, and interface customization.

### Opening the Settings Modal

**Method 1: Keyboard Shortcut**

- Press `Alt + S` (Windows/Linux) or `Option + S` (Mac)

**Method 2: Toolbar Button**

- Click the "Advanced" button in the Director Preview Toolbar (gear icon)

### Settings Categories

#### 1. Execution Settings

**Seed Configuration**

- **Enable Deterministic Seed**: Toggle between random and deterministic execution
- **Seed Value**: Numeric input for specific seed values
- **Auto-generate**: Automatically create new seeds for each execution
- **Seed History**: Quick access to recently used seeds (up to 10)

_Use Case_: Ensure reproducible results across different sessions or share specific configurations with team members.

**Temperature Controls**

- **Enable Temperature Control**: Toggle randomness/creativity level control
- **Temperature Slider**: Range from 0.1 (conservative) to 2.0 (very creative)
- **Quick Presets**: Conservative (0.3), Balanced (1.0), Creative (1.7)
- **Visual Indicator**: Shows current temperature level in preview results

_Use Case_: Fine-tune the randomness level for different content types - use conservative for technical documentation, creative for marketing copy.

**Run Count Settings**

- **Variant Count**: Number of preview variants to generate (1-50)
- **Performance Warning**: Alerts when high counts may impact performance
- **Quick Presets**: Common values (1, 3, 5, 10, 20)
- **Performance Indicator**: Real-time estimation of execution time

_Use Case_: Balance between variety of options and system performance.

#### 2. Batch Processing

**Batch Configuration**

- **Batch Size**: Number of variants to process simultaneously (1-100)
- **Output Format**: Choose between Individual Files, Combined Text, CSV, or JSON
- **Naming Pattern**: Customizable file naming with variables:
  - `{seed}`: Current seed value
  - `{timestamp}`: Date and time
  - `{index}`: Sequential number
- **Include Metadata**: Add execution information to output files
- **Auto-download**: Automatically download results when processing completes

_Example Naming Patterns_:

- `result-{seed}-{timestamp}` → `result-12345-2024-01-15-14-30-00`
- `batch-{index}-creative` → `batch-001-creative`

#### 3. Performance & Debug

**Performance Monitoring**

- **Show Execution Times**: Display timing information for each operation
- **Memory Usage**: Monitor memory consumption during execution
- **Enable Caching**: Cache results to improve performance for repeated operations
- **Debug Logging**: Detailed execution logs in browser console

**Performance Profiles**:

- **Optimized** (0-2 options enabled): Best performance
- **Balanced** (3 options enabled): Good balance of monitoring and speed
- **Debug Mode** (4+ options enabled): Full monitoring, slower performance

#### 4. Interface & Accessibility

**Theme Settings**

- **System Theme**: Automatically match your operating system preference
- **Light Theme**: Bright interface for well-lit environments
- **Dark Theme**: Dark interface for low-light environments

**User Interaction**

- **Show Tooltips**: Display helpful information on hover
- **Keyboard Shortcuts**: Enable/disable keyboard navigation shortcuts
- **Reduce Animations**: Minimize motion for users with vestibular disorders
- **High Contrast**: Increase contrast for better visibility

### Settings Management

**Import/Export**

- **Export Settings**: Save current configuration to a JSON file
- **Import Settings**: Load configuration from a previously exported file
- **Reset to Defaults**: Restore all settings to factory defaults

**Keyboard Shortcuts in Settings Modal**:

- `Ctrl/Cmd + S`: Save settings manually
- `Ctrl/Cmd + R`: Reset all settings to defaults
- `Escape`: Close modal

## Enhanced Palette System

The new palette system organizes nodes into logical categories with powerful search and favorites functionality.

### Node Categories

#### Content Building (Blue)

- **Character/Subject**: Define people, entities, or subjects
- **Connector**: Link words and phrases
- **Attribute**: Descriptive qualities and characteristics
- **Action**: Verbs and activities

_Use Case_: Basic content creation and prompt building

#### Flow Control (Green)

- **Random Selection**: Choose from multiple options with weighted probability
- **Combine**: Join multiple text elements seamlessly
- **Reference**: Include content from other templates

_Use Case_: Control how content flows and connects together

#### Advanced Rules (Purple)

- **Smart Random**: Advanced selection with custom distribution patterns
- **If/Then**: Conditional branching based on variables or expressions

_Use Case_: Sophisticated logic for complex content generation scenarios

#### Transform & Logic (Orange)

- **Step by Step**: Sequential processing with various patterns
- **Chain Process**: Markov-style state transitions and probability chains

_Use Case_: Advanced data transformation and pattern-based generation

#### Output & Results (Red)

- **Result**: Final output nodes for generated content

_Use Case_: Define final outputs and result formatting

#### Memory & Variables (Violet)

- **Store Value**: Save values for later use in workflow
- **Retrieve Value**: Access previously stored values

_Use Case_: Create complex workflows with state management

#### Custom Processing (Cyan)

- **Custom Script**: Python scripts for advanced processing

_Use Case_: Extend functionality with custom logic and transformations

### Palette Modes

**Expanded Mode** (Default)

- Full category organization with labels and descriptions
- Search functionality
- Favorites management
- Tab navigation between categories

**Collapsed Mode**

- Icon-only view for space efficiency
- All nodes shown in vertical list
- Drag and drop still fully functional

### Category Features

**Collapsible Sections**

- Click category headers to expand/collapse
- Chevron indicators show current state
- Node count badges show items in each category

**Visual Coding**

- Each category has a unique color for quick identification
- Color-coded badges appear in search results
- Consistent iconography across all categories

## Search & Favorites

### Search Functionality

**Real-time Search**

- Type in the search box to instantly filter nodes
- Search across node names, descriptions, and categories
- Fuzzy matching finds approximate matches (e.g., "Charactr" finds "Character")

**Search Features**:

- **Multi-term Search**: "custom script" finds nodes matching both terms
- **Category Search**: Include category names in search results
- **Relevance Scoring**: Results sorted by match quality
- **Search Suggestions**: Auto-complete suggestions as you type

**Search Tips**:

- Use partial words: "char" finds "Character"
- Search by function: "random" finds random selection nodes
- Search by category: "memory" finds all memory-related nodes
- Use descriptive terms: "save value" finds storage nodes

### Favorites System

**Adding Favorites**

- Click the star icon next to any node in expanded mode
- Favorites are automatically saved and persist across sessions

**Managing Favorites**

- Favorites appear in a special "Favorites" category tab
- Reorder favorites by dragging within the favorites list
- Remove from favorites by clicking the filled star icon

**Favorites Features**:

- **Quick Access**: Favorites tab for instant access to most-used nodes
- **Persistence**: Automatically saved to browser storage
- **Import/Export**: Share favorite lists with team members
- **Visual Indicators**: Filled/outlined stars show favorite status

### Tab Navigation

**Category Tabs**

- Click category names to switch between groups
- Active tab highlighted with category color
- Smooth transitions between categories

**Special Tabs**:

- **Favorites**: Shows only favorited nodes (when favorites exist)
- **Search Results**: Shows search matches (when searching)
- **All**: Complete list of all nodes (special view)

## Keyboard Shortcuts

### Global Shortcuts

- `Alt/Option + S`: Open Advanced Settings Modal
- `Ctrl/Cmd + /`: Focus search box (when palette is expanded)

### Settings Modal Shortcuts

- `Ctrl/Cmd + S`: Save settings
- `Ctrl/Cmd + R`: Reset to defaults
- `Escape`: Close modal

### Palette Navigation

- `Tab`: Navigate between interactive elements
- `Enter/Space`: Activate buttons and toggles
- `Arrow Keys`: Navigate within categories
- `Escape`: Clear search (when search box is focused)

## Import/Export Settings

### Exporting Settings

1. Open the Advanced Settings Modal (`Alt + S`)
2. Click the **Export** button in the footer
3. A JSON file will be downloaded with your current settings
4. File name format: `prompt-spaghetti-settings-YYYY-MM-DD.json`

### Importing Settings

1. Open the Advanced Settings Modal (`Alt + S`)
2. Click the **Import** button in the footer
3. Select a previously exported settings JSON file
4. Settings will be validated and applied
5. Warning messages will appear for version mismatches

### Settings File Format

```json
{
  "settings": {
    "seed": {
      "enabled": false,
      "value": 12345,
      "history": [12345, 67890],
      "autoGenerate": true
    },
    "temperature": {
      "enabled": true,
      "value": 1.2,
      "showIndicator": true,
      "presets": [...]
    },
    // ... other settings
  },
  "metadata": {
    "exportedAt": "2024-01-15T14:30:00.000Z",
    "version": "1.0.0",
    "appVersion": "1.0.0"
  }
}
```

### Sharing Settings

**Team Collaboration**:

1. Export your optimized settings configuration
2. Share the JSON file with team members
3. Team members import the file to use identical settings
4. Ensures consistent results across different users

**Backup and Restore**:

1. Export settings before making major changes
2. Keep backup files for different project types
3. Import specific configurations for different workflows

## Troubleshooting

### Common Issues

**Settings Not Saving**

- Check browser storage permissions
- Ensure localStorage is enabled
- Try manually saving with `Ctrl/Cmd + S`

**Search Not Working**

- Clear search box and try again
- Check for typos in search terms
- Try broader search terms (e.g., "content" instead of "content building")

**Favorites Not Persisting**

- Check browser storage permissions
- Ensure cookies/local storage are enabled
- Try exporting/importing favorites

**Performance Issues**

- Reduce run count in settings (try 5 or fewer variants)
- Disable performance monitoring options
- Enable caching in performance settings
- Consider using batch processing for large operations

### Performance Optimization

**For Better Speed**:

1. Keep run count under 10 variants
2. Disable execution timing and memory monitoring
3. Enable result caching
4. Use collapsed palette mode for large node sets

**For Better Quality**:

1. Use higher run counts (10-20 variants)
2. Enable temperature control for consistent creativity levels
3. Use deterministic seeds for reproducible results
4. Enable detailed logging for debugging

### Browser Compatibility

**Supported Browsers**:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:

- LocalStorage support
- ES6 JavaScript features
- CSS Grid and Flexbox
- Drag and Drop API

### Getting Help

**Resources**:

- Check browser console for detailed error messages
- Export settings before reporting issues
- Include browser version and operating system in bug reports
- Use search functionality to find nodes instead of browsing categories

**Best Practices**:

1. Start with default settings for new projects
2. Use favorites for frequently accessed nodes
3. Export settings configurations for different project types
4. Regularly clear browser cache if experiencing issues
5. Use descriptive search terms for better results

---

_This guide covers Epic 7 features. For additional help with core functionality, see the main user documentation._
