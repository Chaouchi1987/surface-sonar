# Geo Insights Hub

GEOANOMALY PRO — MASTER BUILD PROMPT

1. PROJECT IDENTITY

Build a production-grade scientific geospatial anomaly analysis platform called:

GeoAnomaly Pro

This is NOT a game, demo, mockup, fictional GIS application, or visual simulation.

The platform must analyze real geospatial and satellite datasets and identify geographically unusual signatures that are worthy of field investigation.

Fundamental scientific rule

The system MUST NOT claim that it directly detects:

underground objects

buried rooms

tunnels

archaeological objects

treasure

cavities

metals underground

human-made structures underground

The system detects statistically unusual surface/subsurface-proxy geospatial signatures and target zones derived from real datasets.

Any possible underground interpretation must be presented only as a hypothesis requiring independent field verification.

2. CORE ARCHITECTURE

The application must be designed around this architecture:

                    GEOANOMALY PRO
                          |
             ┌────────────┴────────────┐
             |                         |
        FRONTEND                    BACKEND
             |                         |
      React / TypeScript          Python / FastAPI
      Leaflet / GIS UI                  |
             |                          |
             └──────────── API ─────────┘
                                        |
                              Google Earth Engine
                                        |
          ┌───────────────┬─────────────┼───────────────┐
          |               |             |               |
      Sentinel-2      Sentinel-1      DEM            ASTER
          |               |             |               |
       Optical           SAR          Terrain        Minerals


Lovable should build the frontend and the API integration layer.

The scientific processing engine must be designed as an external Python/FastAPI service.

Do NOT replace the Python scientific backend with fabricated JavaScript calculations.

Do NOT create fake satellite results in the frontend.

3. FRONTEND TECHNOLOGY

Use:

React

TypeScript

modern component architecture

Leaflet

responsive layout

desktop-first GIS interface

dark scientific dashboard theme

clean professional cartography

modular components

reusable UI components

strong loading/error states

The application should look like a professional remote-sensing / GIS intelligence workstation rather than a generic SaaS dashboard.

4. MAIN APPLICATION LAYOUT

Create a full-screen GIS analysis workstation.

Left sidebar

Sections:

Project

AOI

Data Sources

Analysis

Geological Intelligence

Anomaly Detection

Targets

Temporal Analysis

Reports

Settings

Main area

Interactive Leaflet map.

Right panel

Context-sensitive analysis panel showing:

selected target

coordinates

anomaly score

supporting evidence

active layers

measurements

target ranking

analysis status

Bottom panel

Analysis timeline / processing status:

Data Acquisition
        ↓
Preprocessing
        ↓
Feature Extraction
        ↓
Anomaly Detection
        ↓
Spatial Clustering
        ↓
Target Ranking
        ↓
Final Targets


5. LANDING / DASHBOARD

Create a professional dashboard named:

GeoAnomaly Pro

Subtitle:

Scientific Geospatial Anomaly Intelligence Platform

Dashboard cards:

Active AOI

Data Sources

Analysis Status

Detected Targets

Top Target

Last Analysis

Processing Time

Do NOT display invented statistics.

If no real analysis has been performed, show:

No analysis available

instead of fabricated numbers.

6. AOI SYSTEM

Allow the user to define an Area Of Interest using:

map click

latitude / longitude

radius

polygon

rectangle

GeoJSON upload

Support target investigation scales from approximately:

10 m
20 m
50 m
100 m
200 m
300 m
500 m


Do not round coordinates to four decimal places.

Preserve sufficient coordinate precision for meter-scale analysis.

Display:

center coordinates

AOI dimensions

area

radius

coordinate reference information

7. REAL DATA ONLY

The platform must never generate synthetic scientific data.

Strictly prohibit:

Math.random()
random coordinates
random anomaly scores
fake heatmaps
fake contours
fake satellite values
fake target locations
placeholder anomaly coordinates
fabricated confidence values


If the backend is unavailable:

Display:

Backend unavailable — no scientific analysis can be performed.

Never silently fall back to fake data.

8. DATA SOURCES

The system architecture must support:

Optical

Sentinel-2

Landsat 8

Landsat 9

SAR

Sentinel-1

DEM

Copernicus DEM

SRTM

NASADEM

Thermal

ASTER

Landsat thermal products

MODIS where appropriate

Hyperspectral / future

EMIT

The UI must show the status of each data source:

Available
Unavailable
Processing
No Coverage
Authentication Required


Never pretend that a dataset was successfully retrieved if it was not.

9. GOOGLE EARTH ENGINE

The frontend must NEVER contain:

Earth Engine private credentials

OAuth secrets

service-account private keys

sensitive API credentials

Earth Engine authentication belongs to the backend.

The backend will use:

Google Earth Engine Python API

The configured Earth Engine project is:

project-f00674bb-1e61-4eec-b16


The frontend communicates with the Python backend through REST API endpoints.

10. BACKEND API CONTRACT

Design the frontend around a configurable backend URL:

VITE_API_BASE_URL


Example:

https://your-backend-domain/api


During local development:

http://localhost:8000


Create an API service layer rather than scattering fetch calls throughout components.

Suggested services:

aoiService
analysisService
targetService
layerService
reportService
healthService


11. EXPECTED API ENDPOINTS

Design the frontend to support endpoints such as:

GET  /health

POST /aoi

POST /analysis/start

GET  /analysis/{analysis_id}

GET  /analysis/{analysis_id}/status

GET  /analysis/{analysis_id}/layers

GET  /analysis/{analysis_id}/targets

GET  /analysis/{analysis_id}/targets/{target_id}

GET  /analysis/{analysis_id}/heatmap

GET  /analysis/{analysis_id}/contours

GET  /analysis/{analysis_id}/report


Do not assume these endpoints already exist.

Create a clean API abstraction so the backend can be implemented independently.

12. ANALYSIS PIPELINE

The UI must represent the following scientific pipeline:

AOI
 ↓
Data Acquisition
 ↓
Preprocessing
 ↓
Feature Extraction
 ↓
Feature Matrix
 ↓
PCA
 ↓
Statistical Analysis
 ↓
Isolation Forest
 ↓
LOF
 ↓
Z-Score
 ↓
Anomaly Ensemble
 ↓
Spatial Clustering
 ↓
Multi-scale Consensus
 ↓
Temporal Validation
 ↓
Geological Intelligence
 ↓
Target Ranking
 ↓
Top 1 / Top 2 / Top 3


The frontend must display the current pipeline stage.

13. FEATURE EXTRACTION

The backend architecture must support:

Vegetation

NDVI

Moisture

NDMI

NDWI where appropriate

Built-up / surface context

NDBI

Spectral geology

Iron Oxide

Clay Minerals

Hydrothermal Alteration

Terrain

Elevation

Slope

Aspect

Curvature

TPI

TRI

Hillshade

Structural

Lineament density

lineament orientation

local structural anomalies

SAR

VV

VH

VV/VH relationships

temporal SAR change

local backscatter anomalies

14. GEOLOGICAL INTELLIGENCE

Create a dedicated Geological Intelligence module.

It must analyze:

Iron Oxide
Clay Minerals
Hydrothermal Alteration
Terrain
Slope
Elevation
Structural Features
Lineaments
Spectral Relationships
Spatial Context


The module must not simply assign arbitrary geological scores.

Every geological result must have supporting features.

For example:

Geological Interest

Supporting evidence:
- Iron oxide anomaly
- Clay spectral response
- structural alignment
- terrain discontinuity


15. LINEAMENT DETECTION

The backend architecture must support real lineament extraction.

Potential processing workflow:

DEM / optical image
        ↓
edge enhancement
        ↓
Canny / gradient analysis
        ↓
Hough Transform or equivalent
        ↓
line extraction
        ↓
orientation analysis
        ↓
density calculation
        ↓
spatial correlation with anomalies


Do not draw decorative or synthetic lines.

Every lineament displayed on the map must originate from actual processed data.

16. PCA

Use PCA to analyze correlations and reduce feature dimensionality.

The frontend should display:

number of input features

retained components

explained variance

principal component contribution

Do not invent PCA values.

17. ANOMALY DETECTION

Support:

Z-Score

Detect statistically unusual values.

Isolation Forest

Detect multivariate anomalies.

Local Outlier Factor

Detect local spatial/feature outliers.

PCA distance

Identify observations distant from the normal feature distribution.

The final anomaly result must be an ensemble rather than blindly trusting one algorithm.

18. ANOMALY ENSEMBLE

Create a backend concept called:

Anomaly Ensemble

It should combine multiple independent anomaly signals.

Do NOT hard-code fake weights unless they are explicitly defined as part of the scientific methodology.

Weights must be configurable.

The system should expose:

Isolation Forest contribution
LOF contribution
Z-score contribution
PCA contribution


for each target.

19. SPATIAL CLUSTERING

Individual anomalous pixels must not automatically become targets.

Use spatial clustering.

Possible backend algorithm:

DBSCAN


or an equivalent spatial clustering method.

The purpose is to transform:

many anomalous pixels


into:

spatial anomaly zones


20. MULTI-SCALE ANALYSIS

This is a critical GeoAnomaly Pro capability.

Analyze anomalies at multiple spatial scales:

10 m
20 m
50 m
100 m
200 m
300 m
500 m


A target becomes stronger when an anomaly persists across appropriate scales.

The system should calculate:

scale persistence
scale agreement
local anomaly strength
regional anomaly strength


Do not interpret persistence as proof of an underground object.

21. TEMPORAL ANALYSIS

Use real historical satellite observations.

Analyze:

NDVI temporal behavior

NDMI temporal behavior

NDWI temporal behavior

NDBI temporal behavior

SAR temporal behavior

thermal temporal behavior

Calculate:

mean

variance

trend

stability

temporal persistence

A single-date anomaly should be distinguished from a persistent anomaly.

22. THERMAL ANALYSIS

Support:

thermal mean
thermal neighborhood
thermal annulus
thermal contrast
thermal temporal behavior


The system should distinguish:

absolute temperature
local thermal anomaly
thermal contrast
temporal thermal persistence


Do not fabricate thermal readings.

23. TARGET GENERATION

After anomaly detection and spatial clustering:

Generate investigation targets.

Required:

Top 1
Top 2
Top 3


Only generate targets when the backend has real evidence.

If fewer than three scientifically valid targets exist:

Display only the number actually supported by the analysis.

Do NOT fill missing targets with fake targets.

24. TARGET OBJECT

Each target should contain:

target_id

latitude
longitude

bounding_box

size

anomaly_score

statistical_score

geological_score

thermal_score

temporal_score

structural_score

intelligence_score

supporting_features

data_sources

analysis_timestamp

methodology

limitations


25. 10m × 10m TARGET BOX

The system must be able to display an automatic:

10 m × 10 m investigation box

around the target center.

The box must be generated geometrically from the real target coordinates.

Do not use an arbitrary visual rectangle.

Allow the user to:

view

hide

export

copy coordinates

26. TARGET RANKING

Targets should be ranked using evidence derived from actual analysis.

The ranking engine should consider:

anomaly strength
spatial coherence
multi-scale persistence
temporal persistence
geological evidence
structural evidence
thermal evidence
land-cover context
data quality


The UI must explain WHY a target ranked highly.

Example:

TARGET #1

Why it ranked highly:

✓ Persistent anomaly
✓ Strong local spectral deviation
✓ Structural alignment
✓ Geological spectral indicators
✓ Multi-scale agreement

Limitations:

• Moderate cloud-free temporal coverage
• No direct subsurface measurement


27. LAND-COVER FILTERING

Integrate land-cover classification.

Use it to distinguish:

vegetation
urban/buildings
bare soil
water
rock
agricultural land


Anthropogenic anomalies must be explicitly identified as a possible explanation.

The system must not confuse:

building
road
field boundary
irrigation
construction


with geological anomalies.

28. ANTHROPOGENIC VS NATURAL

Create an interpretation layer:

Natural / Geological
Anthropogenic
Mixed / Uncertain
Insufficient Evidence


The system must prefer:

Uncertain

when evidence is insufficient.

Do not force classification.

29. HEATMAP

The heatmap must visualize real anomaly values returned by the backend.

Support:

anomaly heatmap

geological heatmap

thermal heatmap

temporal stability heatmap

composite intelligence heatmap

The frontend must never generate random heatmap values.

30. CONTOURS

Contours must be generated from real raster/scientific data.

Allow:

show/hide

opacity

contour interval

layer selection

No decorative contours.

31. MAP LAYERS

Support:

Satellite
Terrain
NDVI
NDMI
SAR
Thermal
Iron Oxide
Clay
Hydrothermal
Lineaments
Anomaly
Heatmap
Contours
Targets
Target Boxes
Land Cover


Each layer should have:

visibility toggle

opacity

legend

metadata

32. TARGET DETAIL PANEL

When clicking a target, show:

TARGET #1

Coordinates

10m × 10m Investigation Box

Overall Evidence

Anomaly
Geology
Temporal
Thermal
Structural
Land Cover

Supporting Evidence

Data Sources

Analysis Date

Known Limitations


Include an evidence breakdown chart.

33. SCIENTIFIC TRANSPARENCY

Every result must be traceable.

For every target show:

Which datasets were used?
Which dates?
Which algorithms?
Which features?
Which anomaly methods?
Which geological indicators?
Which spatial scales?
Which temporal windows?


Create a:

Methodology / Provenance

section.

34. DATA QUALITY

Every analysis must report:

data coverage
cloud percentage
missing pixels
spatial resolution
temporal coverage
processing status
quality flags


A target derived from poor data should receive a corresponding quality warning.

35. ERROR HANDLING

Never hide scientific failures.

If:

Earth Engine fails

dataset unavailable

authentication fails

AOI invalid

insufficient pixels

insufficient samples

ML algorithm cannot run

cloud coverage too high

show the real error or a scientifically meaningful explanation.

Example:

Analysis cannot be completed.

Reason:
Insufficient valid observations for LOF.

No target has been generated.


Never generate fallback fake results.

36. LOF SAFETY

The previous GeoAnomaly Pro implementation encountered problems when:

n_neighbors > n_samples


Therefore the backend must dynamically validate sample size before running LOF.

Never allow invalid LOF configuration to crash the entire analysis.

The UI should report:

LOF skipped:
insufficient samples


when appropriate.

37. BACKEND STATUS

Create a backend health indicator:

● Backend Connected
● Earth Engine Connected
● Analysis Ready


If unavailable:

● Backend Offline


The frontend must not pretend the system is operational.

38. REPORTING

Create a scientific report view.

Report sections:

Project

AOI

Acquisition

Datasets

Processing

Feature Extraction

Anomaly Detection

Geological Analysis

Temporal Analysis

Thermal Analysis

Structural Analysis

Targets

Evidence

Limitations

Methodology

Allow export to:

PDF

JSON

CSV

GeoJSON

39. EXPORTS

Export real results only.

Target CSV fields:

target_id
latitude
longitude
anomaly_score
geology_score
temporal_score
thermal_score
structural_score
intelligence_score
classification


GeoJSON must contain actual target geometries.

40. DATABASE

Use Supabase or Lovable Cloud only for application persistence if needed.

Potential tables:

projects
aois
analyses
analysis_runs
datasets
features
targets
target_evidence
analysis_layers
reports


Do not store fake scientific observations.

Use Row Level Security for user-owned projects and analysis records.

41. SECURITY

Never expose:

Earth Engine credentials
private API keys
service account private keys
backend secrets
database service-role keys


in frontend code.

Use environment variables / secure backend secrets.

Authenticated external APIs should be accessed through secure server-side functions where appropriate. Lovable supports authenticated external APIs through secrets and Edge Functions.

42. UI DESIGN

Visual language:

Scientific GIS / Remote Sensing Intelligence

Avoid:

generic startup landing-page style

excessive gradients

fake AI branding

cartoon graphics

meaningless dashboard charts

Prefer:

dark GIS interface

precise typography

map-first design

technical panels

restrained colors

clear legends

scientific terminology

high information density

professional cartography                    GEOANOMALY PRO — VISUAL DESIGN SYSTEM

The visual design is a core part of the product.

Do NOT use a generic SaaS dashboard template.

GeoAnomaly Pro must visually communicate:

Earth observation

satellite intelligence

geological analysis

remote sensing

scientific computing

GIS

terrain intelligence

anomaly detection

The interface must feel like a professional scientific geospatial intelligence workstation.

1. OVERALL VISUAL STYLE

Use a sophisticated:

Dark Earth / Satellite Intelligence / Scientific GIS

design language.

The interface should combine:

dark satellite-imagery inspired backgrounds

deep navy / charcoal panels

cyan and electric-blue scientific accents

geological amber / orange accents

controlled green for valid vegetation/environmental indicators

red/orange only for anomaly warnings

subtle gradients

glass-like panels where appropriate

thin technical borders

soft shadows

restrained glow effects

Avoid excessive neon.

The interface must remain professional and scientific.

2. PRIMARY COLOR PALETTE

Use a carefully designed color system.

Background

Primary:

#07111F


Secondary:

#0B1726


Panels:

#101D2E


Elevated panels:

#14243A


Scientific Blue

Primary accent:

#19B5FE


Secondary:

#3B82F6


Use for:

active controls

map tools

satellite data

information

analysis progress

selected features

Cyan

#22D3EE


Use for:

Earth observation

active layers

analytical highlights

live data indicators

Geological Amber

#F59E0B


Use for:

geological analysis

mineral indicators

structural interpretation

important evidence

Geological Orange

#F97316


Use for:

strong geological signatures

thermal anomalies

attention areas

Vegetation Green

#22C55E


Use for:

NDVI

vegetation

environmental stability

successful validation

Warning

#FBBF24


Use for:

data-quality warnings

insufficient observations

uncertain interpretation

Anomaly Red

#EF4444


Use sparingly for:

strong anomaly visualization

critical warnings

failed processing

Text

Primary:

#F8FAFC


Secondary:

#CBD5E1


Muted:

#64748B


3. GRADIENT SYSTEM

Use subtle scientific gradients.

Example:

deep navy → blue → cyan


for analysis and satellite-related components.

Example:

deep brown → amber → orange


for geological components.

Example:

deep green → emerald


for vegetation/environmental layers.

Do not apply gradients to every component.

Gradients should emphasize important areas only.

4. APPLICATION BACKGROUND

The main application background should not be a flat color everywhere.

Create subtle visual depth using:

dark radial gradients

faint topographic contour patterns

very subtle satellite-grid patterns

extremely low-opacity coordinate/grid lines

subtle noise texture if technically appropriate

The background must remain dark enough for map and data visualization.

Do NOT use distracting photographs behind the entire interface.

5. HERO / DASHBOARD BACKGROUND

For the main dashboard/home state, create a sophisticated Earth-observation visual.

Preferred concept:

A dark satellite-style Earth / terrain surface with subtle:

topographic contours

satellite grid

coordinate lines

glowing analysis points

geological structures

The background should be subtle and partially blurred/darkened so text remains highly readable.

Do not use a generic stock image of Earth.

If a background image is required, use a realistic satellite / terrain / remote-sensing visual.

6. MAP AREA

The map is the visual center of GeoAnomaly Pro.

It should occupy the largest area of the interface.

Use a dark basemap or satellite basemap depending on the active analysis.

The map must support:

zoom controls

scale bar

coordinate display

layer switcher

fullscreen

measurement

target selection

AOI drawing

Map controls should visually match the dashboard.

7. MAP VISUAL HIERARCHY

The map should visually distinguish:

AOI

Use:

cyan outline

subtle cyan transparent fill

Target

Use:

bright amber/orange marker

subtle glow

numbered label

Example:

01
02
03


10m × 10m target box

Use:

thin bright cyan/amber outline

transparent interior

Anomaly zones

Use a controlled heatmap:

low → blue
moderate → cyan
high → yellow
very high → orange/red


Do not use excessive red across the map.

8. TARGET MARKERS

Create custom professional GIS target icons.

Target marker design:

circular or diamond-shaped technical marker

central point

outer ring

subtle glow

target number

Example:

      ◉
     01


The marker should look like an intelligence-analysis target indicator, not a generic Google Maps pin.

Differentiate:

Target #1
Target #2
Target #3


with visual hierarchy.

Target #1 should be slightly more prominent.

9. ICON SYSTEM

Use a consistent professional icon library such as:

Lucide Icons

or another high-quality SVG icon library.

Do NOT mix random icon styles.

Icons should be:

thin/medium stroke

geometric

clean

consistent

readable at small sizes

Recommended icons:

Project

Folder / Layers

AOI

Crosshair / Scan

Satellite

Satellite

Terrain

Mountain

Geological

Pickaxe / Layers / Gem where appropriate, but keep the style scientific.

Thermal

Thermometer

SAR

Radar

Temporal

Clock / History

Anomaly

Activity / ScanLine / Target

Target

Crosshair

Analysis

Brain / Workflow / Activity

Data

Database

Reports

FileText

Settings

Settings

Export

Download

Location

MapPin

Coordinate

LocateFixed

Warning

TriangleAlert

Error

CircleX

Success

CircleCheck

10. SIDEBAR

Create a premium collapsible sidebar.

Default width:

approximately 260–300px.

Collapsed width:

approximately 64–72px.

Each menu item should contain:

icon

label

optional status indicator

Active item:

subtle cyan background

cyan icon

white text

left accent indicator

Do not use huge colorful menu icons.

11. TOP NAVIGATION

Create a compact technical top bar.

Include:

Left

GeoAnomaly Pro logo + status.

Center

Current project / AOI.

Right

Backend status

Earth Engine status

Notifications

Settings

User profile

Status indicators should be small and professional.

Example:

● API Connected
● Earth Engine Ready


Use green only when the connection has actually been verified.

12. GEOANOMALY PRO LOGO

Create a distinctive technical logo.

Concept:

Combine:

satellite orbit

geographic coordinates

target/crosshair

terrain contour

Possible symbol:

A circular orbital/grid structure surrounding a small target point with subtle terrain-line geometry.

The logo should work in:

full sidebar

compact sidebar

favicon

loading screen

report header

Text:

GeoAnomaly Pro

Optional subtitle:

Geospatial Intelligence

Do not use a generic AI brain logo.

13. TYPOGRAPHY

Use a modern technical sans-serif.

Recommended:

Inter

Manrope

IBM Plex Sans

Use a separate monospace font for:

coordinates

IDs

technical values

API status

timestamps

Recommended monospace:

JetBrains Mono

IBM Plex Mono

Coordinates should visually look technical:

35.367481° N
7.755425° E


14. CARDS

Cards should have:

10–16px border radius

subtle border

very soft shadow

dark translucent background

clear hierarchy

Avoid oversized rounded cards.

These are scientific information panels, not marketing cards.

15. ANALYSIS CARDS

Each analysis engine should have a recognizable icon and accent.

Example:

┌────────────────────────────┐
│  ◈  GEOLOGICAL INTELLIGENCE│
│                            │
│  Iron Oxide       Active   │
│  Clay             Active   │
│  Lineaments       Active   │
│                            │
│  View Details →            │
└────────────────────────────┘


Use the appropriate semantic color.

16. TARGET SCORE VISUALIZATION

Do not use giant meaningless percentages.

Prefer:

radial gauge

segmented evidence bar

horizontal evidence bars

compact score indicators

Example:

Anomaly       █████████░  High
Geology       ████████░░  Strong
Temporal      ███████░░░  Moderate
Thermal       █████░░░░░  Moderate
Structural    ████████░░  Strong


The UI must distinguish:

score

from:

confidence

from:

data quality

They are not the same thing.

17. TARGET RANKING VISUAL DESIGN

Create a premium target-ranking panel.

Example hierarchy:

01  TARGET #1
    Strongest candidate

02  TARGET #2
    Moderate evidence

03  TARGET #3
    Secondary candidate


Target #1:

slightly larger

amber highlight

prominent target icon

Target #2:

cyan/blue

Target #3:

muted cyan/blue

Do not imply certainty.

18. SCIENTIFIC LEGENDS

Every visualization must have a clear legend.

Examples:

ANOMALY STRENGTH

Low
────
Moderate
────
High
────
Very High


For geological layers:

IRON OXIDE
Low → High


For thermal:

Thermal Contrast
Low → High


Legends must never be ambiguous.

19. DATA SOURCE ICONS

Give every dataset a recognizable icon/badge.

Example:

Sentinel-1    SAR
Sentinel-2    Optical
ASTER         Thermal / Mineral
DEM           Terrain
Landsat       Optical / Thermal


Use small technical badges.

20. LOADING EXPERIENCE

Create a sophisticated scientific loading animation.

Do not use a generic spinning circle only.

Preferred:

scanning radar ring

satellite scan line

grid scanning animation

pulsing coordinate point

sequential pipeline stages

Example:

INITIALIZING ANALYSIS

✓ AOI validated
✓ Data sources located
● Processing Sentinel-2
○ Geological analysis
○ Anomaly detection
○ Target ranking


The animation must reflect actual backend progress when available.

Do not fake progress percentages.

21. EMPTY STATES

Empty states should be visually polished.

Example:

      ◌
No analysis yet

Define an AOI and start a scientific analysis.


Use a relevant GIS icon.

Do not display fake example targets by default.

22. ERROR STATES

Use a professional scientific error panel.

Example:

ANALYSIS UNAVAILABLE

Earth Engine returned an error.

No scientific target has been generated.

[View Details]
[Retry]


Use red sparingly.

23. SUCCESS STATES

Use subtle green indicators.

Example:

✓ Analysis completed

3 scientifically supported target zones identified.


If zero valid targets are found:

✓ Analysis completed

No statistically significant target zones identified.


This is a valid scientific result.

24. MICRO-INTERACTIONS

Use subtle animations:

panel transitions

map layer fade

target marker pulse

hover elevation

tooltip fade

sidebar collapse

loading scan

Animation duration:

approximately 150–300ms for UI interactions.

Avoid excessive animation.

25. GLASS / TRANSPARENCY

Use glassmorphism selectively.

Suitable for:

floating map controls

target detail panel

top navigation

map legends

Avoid making every element transparent.

Scientific readability takes priority over visual effects.

26. BACKGROUND TOPOGRAPHY

Use extremely subtle contour-line graphics in:

login screen

dashboard background

empty states

report cover

The contour lines should resemble real terrain contours.

They are decorative only.

Important:

Decorative contours MUST be visually distinguishable from scientific contour layers.

Never confuse decorative graphics with analysis results.

27. GEOLOGICAL VISUAL LANGUAGE

Use geological visual cues:

contour lines

stratigraphic-inspired patterns

mineral colors

terrain gradients

structural lines

geological map textures

But maintain a modern digital interface.

Do not make the application look like an old geological paper map.

28. SATELLITE / SPACE VISUAL LANGUAGE

Use subtle:

orbital lines

coordinate grids

satellite symbols

Earth-observation motifs

remote-sensing scan effects

Do not use science-fiction aesthetics.

GeoAnomaly Pro should look like a real scientific instrument.

29. MAP OVERLAY PANEL

Floating map panels should have:

background: dark translucent
border: subtle cyan/blue
backdrop blur: moderate
shadow: soft


Controls should be compact.

Example:

┌───────────────┐
│ Layers    ☷   │
├───────────────┤
│ Satellite  ✓  │
│ Terrain    ✓  │
│ Anomaly    ✓  │
│ Targets    ✓  │
└───────────────┘


30. RESPONSIVE VISUAL BEHAVIOR

Desktop:

Full professional GIS workstation.

Tablet:

Collapsible side panels.

Mobile:

Map occupies most of the screen.

Controls become floating buttons.

Target information appears in a bottom sheet.

31. ACCESSIBILITY

Maintain:

strong text contrast

readable font sizes

keyboard navigation

visible focus states

semantic buttons

ARIA labels for icon-only buttons

Do not rely exclusively on color to communicate meaning.

32. FINAL VISUAL QUALITY STANDARD

Before considering the UI complete, verify:

No default browser styling

No generic SaaS appearance

No random icon styles

No excessive rounded cards

No excessive gradients

No fake charts

No fake scientific values

No decorative graphics mistaken for scientific results

Consistent spacing

Consistent iconography

Consistent colors

Professional GIS map

Strong visual hierarchy

Excellent dark-mode readability

The final impression should be:

A professional satellite/geospatial intelligence workstation used by a remote-sensing or geological analysis team.

Not:

A generic AI dashboard.      

43. COLOR SYSTEM

Use semantic colors only.

Examples:

Anomaly
Geological
Thermal
Temporal
Structural
Target
Warning
Error
Success


Do not use colors merely for decoration.

44. RESPONSIVE DESIGN

Desktop:

Full GIS workstation.

Tablet:

Collapsible panels.

Mobile:

Map-first interface with bottom sheets.

The scientific data and controls must remain usable.

45. FRONTEND STATE

Use a centralized analysis state.

Example conceptual state:

aoi
analysisId
analysisStatus
datasets
layers
features
targets
selectedTarget
mapState
errors


Do not duplicate analysis state across unrelated components.

46. MOCK DATA POLICY

During development, the UI may use explicitly labeled development fixtures only.

If mock data is used for interface development:

Every fixture must contain:

is_mock: true


and the interface must visibly display:

DEMO DATA — NOT SCIENTIFIC ANALYSIS

However, the production analysis path must never use mock data.

Never silently replace missing backend results with fixtures.

47. IMPLEMENTATION STRATEGY

Build the application incrementally.

Do NOT attempt to create hundreds of unrelated files at once.

First build:

1. Application shell
2. Map
3. AOI tools
4. API service layer
5. Backend health
6. Analysis state
7. Target panel
8. Layer system


Then implement the remaining modules.

48. BACKEND-FIRST CONTRACT

The frontend must be compatible with an external Python FastAPI scientific backend.

Do not make scientific computations dependent on Supabase Edge Functions.

Supabase/Lovable Cloud may handle:

authentication

project persistence

user data

metadata

reports

application state

Python/FastAPI handles:

Earth Engine

raster processing

remote sensing

GIS processing

PCA

anomaly detection

clustering

geological analysis

temporal analysis

thermal analysis

target generation

49. EXISTING GEOANOMALY PRO ARCHITECTURE TO PRESERVE

The project already has conceptual modules that must be preserved in the new architecture:

analysis_registry.py

target_model.py

target_builder.py

full_analysis_engine.py

full_analysis_engine_v2.py

thermal_pipeline.py

geology_pipeline.py

temporal_pipeline.py

ai_pipeline.py


The frontend should treat these as backend analysis modules exposed through API endpoints.

Do not redesign the scientific methodology unnecessarily.

50. EXISTING ANALYSIS MODULES

The established GeoAnomaly Pro architecture includes:

Earth Engine Integration
Grid Sampling
Landcover Filtering
Evidence Engine
Geology Engine
Temporal Sampler
Temporal Features
Temporal Stability Engine
Thermal Sampler
Thermal Features
Thermal Neighborhood
Thermal Annulus
Thermal Contrast Engine
Thermal Score Engine
ASTER Sampler
ASTER Features
ASTER Thermal Features
Structural Anomaly Engine
Intelligence Engine


The UI should expose these capabilities through logical analysis categories rather than exposing internal Python implementation details to ordinary users.

51. INTELLIGENCE ENGINE

The final intelligence layer must combine evidence from:

Geology
Thermal
Temporal
Structural
AI / Statistical anomaly detection


The resulting score must be traceable.

Never present a number such as:

92%
confidence


unless that number has a formally defined statistical meaning.

Prefer terminology such as:

Evidence Score
Anomaly Score
Data Quality
Model Agreement


52. SCIENTIFIC DISCLAIMER

Every target/report must contain:

GeoAnomaly Pro identifies statistically unusual geospatial signatures from remote-sensing and terrain datasets. It does not directly detect underground objects. Target interpretations require independent field verification and appropriate geophysical measurements.

53. FIELD VERIFICATION

Design the architecture for future integration with:

GPR
Magnetometer
EM
Electrical Resistivity
GPS


These should be future data sources, not simulated today.

Future workflow:

Satellite Analysis
        ↓
Target
        ↓
Field Survey
        ↓
GPR / Magnetometer / EM
        ↓
Validation
        ↓
Updated Evidence


54. FUTURE EMIT INTEGRATION

Prepare the architecture for hyperspectral EMIT data.

Do not implement fake EMIT data.

The UI may show:

EMIT
Coming Soon


until real integration exists.

55. NO FAKE SCIENCE RULE

This is the highest-priority rule.

Never create:

fake coordinates
fake anomalies
fake satellite values
fake geological signatures
fake thermal signatures
fake SAR values
fake confidence
fake targets
fake contours
fake heatmaps


When data is unavailable, say:

No valid data available.


When analysis cannot be completed, say:

Analysis incomplete.


When evidence is insufficient, say:

Insufficient evidence.


56. CURRENT DEVELOPMENT PHASE

The project is currently being rebuilt from scratch with a Python backend.

Therefore:

Do not pretend that all backend functionality already exists.

Build the frontend in a way that can progressively connect to the real FastAPI backend.

Create clear TODO/integration boundaries.

57. DEVELOPMENT PRIORITY

Implement in this order:

Phase 1

Application shell
Map
AOI
API layer
Backend health


Phase 2

Analysis creation
Analysis status
Layer loading
Target loading


Phase 3

Geological Intelligence
Temporal Analysis
Thermal Analysis
Structural Analysis


Phase 4

Anomaly Ensemble
Multi-scale Consensus
Target Ranking
Top 1 / Top 2 / Top 3


Phase 5

Heatmaps
Contours
Reports
Exports


Phase 6

Advanced field-validation integration
GPR
Magnetometer
EM
EMIT


58. FIRST TASK

Do NOT generate fake scientific results.

Start by building the complete GeoAnomaly Pro frontend shell with:

professional GIS dashboard

Leaflet map

AOI creation

latitude/longitude input

radius selector

layer control

analysis control panel

backend connection indicator

analysis status

target panel

target ranking panel

empty scientific states

error states

API abstraction

configuration for external FastAPI backend

Use clean modular TypeScript.

Prepare the application so that the Python FastAPI backend can be connected without rewriting the frontend architecture.

After implementing Phase 1, stop and show the working application structure before inventing or implementing scientific data.

59. FINAL PRODUCT PRINCIPLE

GeoAnomaly Pro is not a visualization toy.

It is a scientific geospatial intelligence platform.

The priority hierarchy is:

REAL DATA
    ↓
CORRECT PROCESSING
    ↓
TRACEABLE FEATURES
    ↓
STATISTICAL ANOMALY DETECTION
    ↓
SPATIAL CONSISTENCY
    ↓
TEMPORAL CONSISTENCY
    ↓
GEOLOGICAL CONTEXT
    ↓
TARGET RANKING
    ↓
FIELD INVESTIGATION


Never reverse this hierarchy.

Never start with a desired target and manufacture evidence for it.

The system must allow the data to determine whether an anomaly exists.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f2d44ff-96e2-409c-b628-cba79b615bd1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
