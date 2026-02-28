# Distance Comparer

A web application for comparing geographic locations using dual interactive maps. View and navigate two world maps side-by-side to visualize distances, explore different regions, and compare locations simultaneously.

## Features

- **Dual Map Display**: Two independent OpenStreetMap instances side-by-side (desktop) or stacked (mobile)
- **Independent Navigation**: Pan and zoom each map separately using mouse, touch, or keyboard
- **Distance Line Tool**: Measure and compare distances between two geographic points
  - Create lines with two clicks on the left map
  - Drag endpoints to adjust measurements
  - Synchronized distance display on right map
  - Rotate synchronized lines with keyboard controls
  - Real-time geodesic distance calculations (±0.5% accuracy)
- **Keyboard Accessible**: Full keyboard navigation with arrow keys, +/- for zoom, and Tab to switch focus
- **Responsive Layout**: Automatically adapts to viewport size with breakpoint at 768px
- **Screen Reader Support**: ARIA live regions announce zoom, position, and distance changes
- **Error Handling**: Automatic tile retry with exponential backoff, graceful error display
- **Performance Optimized**: <3s load time, <100ms interaction delay, <500KB bundle size

## Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd distance-comparer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## Usage

### Mouse/Touch Navigation

- **Pan**: Click and drag on a map to move it
- **Zoom**: Use scroll wheel, pinch gesture, or zoom controls
- **Focus**: Click on a map to focus it (shows blue border)

### Keyboard Navigation

1. Press `Tab` to focus the first map (blue border appears)
2. Use arrow keys (↑↓←→) to pan the focused map
3. Press `+` or `-` to zoom in/out
4. Press `Tab` again to switch to the second map
5. Press `Escape` to remove focus

### Screen Reader Support

When using a screen reader (NVDA, JAWS, VoiceOver):
- Navigate to map with Tab key
- Screen reader announces: "Interactive map panel. Use arrow keys to pan, plus and minus to zoom"
- Zoom changes announced: "Zoom level 5"
- Position changes announced: "Map center moved to 40.71 degrees latitude, -74.01 degrees longitude"

### Distance Line Tool

The Distance Line Tool allows you to measure geodesic distances between two geographic points and compare them across different map locations.

#### Activating the Tool

1. Click the "📏 Activate Distance Tool" button in the header
2. The button will turn white indicating the tool is active
3. Distance tooltips will appear at the bottom of each map

#### Creating a Distance Line (Left Map)

1. Activate the Distance Tool
2. Click once on the left map to set the start point (circle marker)
3. Move your mouse to see a preview line following the cursor
4. Click again to set the end point (arrow marker pointing in the line direction)
5. The distance will be calculated and displayed in both tooltips

#### Modifying the Line (Left Map)

**Drag Endpoints**:
- Click and drag the start point (circle) to reposition the line's beginning
- Click and drag the end point (arrow) to reposition the line's end
- Distance recalculates automatically as you drag
- The right map updates in real-time to match the new distance

**Visual Indicators**:
- Start point: Blue circle marker
- End point: Blue arrow pointing in the line direction
- Line: Blue solid line connecting the points
- Distance tooltip: Gradient tooltip showing "Measured Distance" in meters or kilometers

#### Synchronized Right Map

The right map displays a line with **exactly the same real-world distance** as the left map:

- Distance is locked and synchronized from the left map
- Line can be positioned anywhere on the right map
- Position and bearing are independent of the left map
- Allows comparison of distance across different geographic regions

#### Rotating the Line (Right Map)

**Keyboard Rotation**:
- Ensure the right map line is visible (create a line on the left map first)
- Press `Arrow Left` to rotate counterclockwise by 5°
- Press `Arrow Right` to rotate clockwise by 5°
- Hold `Shift` + `Arrow Left/Right` for 15° rotation steps
- Bearing is displayed in the tooltip (e.g., "Bearing: 45°")

**Drag to Reposition** (Right Map):
- **Drag start point (circle)**: Moves the entire line parallel to its current orientation (bearing stays locked)
- **Drag end point (arrow)**: Rotates the line around the start point (bearing changes, start point stays fixed)
- Distance remains locked to the left map value during all dragging

#### Edge Cases

**Zero-Length Lines**:
- Lines shorter than 1 meter are considered zero-length
- Rotation is automatically disabled for zero-length lines
- A warning appears in the console for debugging

**Lines Outside Viewport**:
- If both endpoints are outside the current map view, the line is marked as outside viewport
- Pan or zoom to bring at least one endpoint into view

#### Tooltips

**Left Map Tooltip** (Bottom left):
- Shows "Measured Distance"
- Displays current distance in meters (< 1000m) or kilometers
- Pulses with yellow gradient during line creation

**Right Map Tooltip** (Bottom right):
- Shows "Synchronized Distance"  
- Displays the same distance as left map
- Shows current bearing (e.g., "Bearing: 135°")
- Purple gradient indicates synchronized state

#### Example Workflow

1. **Compare NYC to LA distance**:
   - Activate Distance Tool
   - Click New York on left map
   - Click Los Angeles (preview line shows distance)
   - Left tooltip shows: "3,944 km"

2. **Compare same distance in Europe**:
   - Pan right map to show Europe
   - Right map shows 3,944 km line centered on the map
   - Use Arrow keys to rotate the line to desired bearing
   - Drag endpoints to position the line across specific cities

3. **Adjust measurement**:
   - Drag LA endpoint to San Francisco on left map
   - Distance updates to ~4,130 km
   - Right map line automatically adjusts to maintain the new distance

#### Keyboard Shortcuts Summary

- `📏 Button`: Activate/deactivate Distance Tool
- `Click + Click` (Left Map): Create distance line
- `Drag` (Left Map): Adjust endpoints and distance
- `Arrow Left/Right` (Right Map): Rotate line by 5° (Shift for 15°)
- `Drag` (Right Map Start): Move line parallel
- `Drag` (Right Map End): Rotate line around start point

#### Accessibility

- **ARIA labels**: Maps labeled as "Distance measurement tool for left/right map"
- **Screen reader announcements**: Distance changes announced as "Measurement updated: 1,234 meters"
- **Focus indicators**: Endpoints show blue outline when focused
- **Keyboard navigation**: Full control without mouse

## Architecture

### Technology Stack

- **Framework**: Vue 3.4+ with Composition API
- **Language**: TypeScript 5.x (strict mode)
- **Build Tool**: Vite 5.0
- **Map Library**: Leaflet 1.9.4
- **Tile Provider**: OpenStreetMap

### Project Structure

```
src/
├── components/
│   ├── MapPanel.vue          # Single map instance component
│   ├── MapContainer.vue      # Dual map layout wrapper
│   └── DistanceLine.vue      # Distance measurement tool component
├── composables/
│   ├── useLeafletMap.ts      # Leaflet initialization & lifecycle
│   ├── useMapEvents.ts       # Event handling & debouncing
│   ├── useMapNavigation.ts   # Navigation methods
│   ├── useMapKeyboard.ts     # Keyboard navigation
│   ├── useGeodesic.ts        # Geodesic calculations (Haversine formula)
│   ├── useDistanceLine.ts    # Distance line state management
│   ├── useLineCreation.ts    # Two-click line creation workflow
│   ├── useLineDrag.ts        # Endpoint dragging interactions
│   ├── useLineRotation.ts    # Line rotation (keyboard & mouse)
│   └── useLineSync.ts        # Left-right map synchronization
├── types/
│   └── map.types.ts          # TypeScript type definitions
├── config/
│   └── map.config.ts         # Default configuration constants
├── assets/
│   └── main.css              # Global styles
├── App.vue                   # Application root
└── main.ts                   # Application entry point
```

### Component Architecture

```
App.vue
└── MapContainer.vue (layout & responsiveness)
    ├── MapPanel.vue (left map)
    │   ├── useLeafletMap (initialization)
    │   ├── useMapEvents (event handling)
    │   ├── useMapNavigation (navigation methods)
    │   ├── useMapKeyboard (keyboard support)
    │   └── DistanceLine.vue (distance tool)
    │       ├── useDistanceLine (line state & rendering)
    │       ├── useLineCreation (two-click creation)
    │       ├── useLineDrag (endpoint dragging)
    │       └── useGeodesic (distance calculations)
    └── MapPanel.vue (right map)
        ├── (same map composables)
        └── DistanceLine.vue (synchronized line)
            ├── useDistanceLine (line state & rendering)
            ├── useLineRotation (keyboard rotation)
            ├── useLineDrag (constrained dragging)
            ├── useLineSync (distance synchronization)
            └── useGeodesic (distance calculations)
```

### Key Design Decisions

1. **Composable-First**: Logic encapsulated in reusable composables
2. **ShallowRef for Leaflet**: Prevents Vue reactivity issues with Leaflet objects
3. **Event Debouncing**: 150ms delay on moveend/zoomend to reduce event frequency
4. **Automatic Cleanup**: All event listeners removed on component unmount
5. **Exponential Backoff**: Tile retry delays: 1s, 2s, 4s
6. **CSS Isolation**: Leaflet elements protected from global CSS resets

## Configuration

Default settings in `src/config/map.config.ts`:

```typescript
DEFAULT_CENTER: { lat: 0, lng: 0 }  // Null Island
DEFAULT_ZOOM: 2                      // World view
MIN_ZOOM: 2                          // Prevent over-zoom out
MAX_ZOOM: 18                         // Street level
KEYBOARD_PAN_STEP: 50                // Pixels per arrow key press
EVENT_DEBOUNCE_DELAY: 150            // Milliseconds
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

Measured on 25 Mbps connection:
- **Initial Load**: <3 seconds
- **Interaction Delay**: <100ms (perceived instantaneous)
- **Bundle Size**: <500KB gzipped
- **Lighthouse Score**: 95+ (accessibility)

## Accessibility

- ✅ Keyboard navigation (WCAG 2.1 Level AA)
- ✅ Screen reader support (ARIA labels and live regions)
- ✅ Focus indicators (2px blue outline)
- ✅ High contrast (4.5:1 minimum)
- ✅ No motion required (keyboard alternative)

## Development

### Type Checking

```bash
# Run TypeScript type checking
npm run build
```

### Code Style

- **Strict TypeScript**: All types explicit, no `any`
- **Composition API**: `<script setup>` single-file components
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for public APIs

## License

[Your License Here]

## Contributing

[Contributing guidelines if applicable]

## Acknowledgments

- Maps provided by [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Powered by [Leaflet](https://leafletjs.com/) mapping library
