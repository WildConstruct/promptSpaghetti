# Wild Construct VFX Pipeline Integration Guide

## Quick Start Guide

This guide provides step-by-step instructions for integrating Wild Construct VFX exports into your production pipeline. Choose your workflow below:

### 5-Minute Integration

**For immediate testing and evaluation**

1. **Export from Wild Construct**

```bash
# Using CLI
wc export scene.json --format vfx --quality preview --output scene.vfx.json

# Using JavaScript API
const exporter = WildConstructVFXExporter.getInstance();
const exportData = await exporter.exportGraph(graph, results, { quality: 'preview' });
```

2. **Validate Export**

```bash
wc validate scene.vfx.json --basic
```

3. **Import to Your Tool**
   - **Maya**: Use provided Python script
   - **Houdini**: Import via HDA
   - **Nuke**: Load as metadata node
   - **Blender**: Use Wild Construct addon

### Production Integration

**For full production pipeline implementation**

## Pre-Integration Checklist

Before beginning integration, ensure you have:

- [ ] Wild Construct VFX Exporter v1.2.0 or later
- [ ] Target software versions (see compatibility matrix)
- [ ] Network access to shared storage
- [ ] Backup of existing pipeline configuration
- [ ] Test project for validation

## Integration Workflows

### Workflow 1: Maya + Arnold Pipeline

**Use Case**: Feature film and high-end episodic production
**Complexity**: Medium
**Timeline**: 2-3 days setup

#### Step 1: Environment Setup

```bash
# Install Wild Construct Maya integration
pip install wild-construct-maya
maya -batch -command "loadPlugin wildConstructImporter"

# Verify installation
maya -batch -command "wildConstructVersion"
```

#### Step 2: Pipeline Configuration

```python
# maya_pipeline_config.py
import maya.cmds as cmds
from wild_construct_maya import VFXImporter, PipelineConfig

# Configure paths
config = PipelineConfig()
config.export_path = "/studio/projects/exports/"
config.asset_path = "/studio/assets/"
config.render_path = "/studio/renders/"
config.backup_path = "/studio/backups/"

# Set naming conventions
config.naming_pattern = "{project}_{scene}_{shot}_{variant}_{version}"
config.version_padding = 3

# Configure Arnold settings
config.arnold_settings = {
    'samples': 128,
    'light_samples': 4,
    'diffuse_samples': 3,
    'specular_samples': 3,
    'transmission_samples': 2,
    'sss_samples': 2,
    'volume_samples': 2
}

# Save configuration
config.save("/studio/config/wildconstruct_maya.json")
```

#### Step 3: Create Import Template

```python
# maya_import_template.py
import maya.cmds as cmds
import json
from wild_construct_maya import VFXImporter

def import_wildstruct_scene(export_path, options=None):
    """
    Template function for importing Wild Construct exports
    """
    if options is None:
        options = {
            'create_namespace': True,
            'setup_camera': True,
            'setup_lighting': True,
            'create_locators': True,
            'add_metadata': True
        }

    # Load export data
    importer = VFXImporter()
    result = importer.import_export(export_path, options)

    if result.success:
        print(f"Import successful: {result.namespace}")
        print(f"Camera: {result.camera}")
        print(f"Lights: {result.lights}")
        print(f"Reproducibility seed: {result.seed}")

        # Setup render layers
        setup_render_layers(result)

        # Configure Arnold
        configure_arnold_from_export(result.export_data)

        return result
    else:
        raise Exception(f"Import failed: {result.error}")

def setup_render_layers(import_result):
    """Create render layers based on export data"""
    export_data = import_result.export_data
    variants = export_data['prompt']['variants']

    # Create render layer for each variant
    for i, variant in enumerate(variants):
        layer_name = f"variant_{i+1}_{variant['id']}"
        cmds.createRenderLayer(name=layer_name)

        # Set variant-specific overrides
        with cmds.editRenderLayerGlobals(currentRenderLayer=layer_name):
            # Set seed for procedural textures
            set_variant_seed(variant['seed'])

            # Apply variant-specific materials
            apply_variant_materials(variant, import_result.materials)

def configure_arnold_from_export(export_data):
    """Configure Arnold render settings from export data"""
    rendering = export_data['rendering']

    # Set resolution
    res = rendering['resolution']
    cmds.setAttr('defaultResolution.width', res['width'])
    cmds.setAttr('defaultResolution.height', res['height'])

    # Configure Arnold settings
    quality = rendering['quality']
    cmds.setAttr('defaultArnoldRenderOptions.AASamples', quality['samples'])
    cmds.setAttr('defaultArnoldRenderOptions.AASamples', quality.get('denoising', 0.7))

    # Set camera parameters
    camera = rendering['camera']
    if cmds.objExists('wildConstruct:hero_camera'):
        cmds.setAttr('wildConstruct:hero_cameraShape.focalLength', camera['focal'])
        cmds.setAttr('wildConstruct:hero_cameraShape.fStop', camera['aperture'])
```

#### Step 4: Batch Processing Script

```python
# batch_import.py
import os
import glob
from maya_import_template import import_wildstruct_scene

def process_export_batch(export_directory, output_directory):
    """Process multiple Wild Construct exports"""

    export_files = glob.glob(os.path.join(export_directory, "*.vfx.json"))
    results = []

    for export_file in export_files:
        try:
            print(f"Processing: {export_file}")

            # Import scene
            result = import_wildstruct_scene(export_file)

            # Save Maya file
            scene_name = os.path.splitext(os.path.basename(export_file))[0]
            maya_file = os.path.join(output_directory, f"{scene_name}.ma")
            cmds.file(rename=maya_file)
            cmds.file(save=True, type='mayaAscii')

            # Submit render job (optional)
            submit_render_job(maya_file, result.export_data)

            results.append({
                'export_file': export_file,
                'maya_file': maya_file,
                'success': True,
                'seed': result.seed
            })

        except Exception as e:
            print(f"Error processing {export_file}: {e}")
            results.append({
                'export_file': export_file,
                'success': False,
                'error': str(e)
            })

    return results

# Usage
if __name__ == "__main__":
    results = process_export_batch(
        "/studio/projects/wildstruct_exports/",
        "/studio/projects/maya_scenes/"
    )

    # Report results
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    print(f"Processed: {len(results)} files")
    print(f"Successful: {len(successful)}")
    print(f"Failed: {len(failed)}")
```

### Workflow 2: Houdini Procedural Pipeline

**Use Case**: VFX-heavy productions with procedural elements
**Complexity**: High
**Timeline**: 3-5 days setup

#### Step 1: HDA Creation

```python
# houdini_wildstruct_hda.py
import hou
import json
import os

def create_wildstruct_hda():
    """Create Houdini Digital Asset for Wild Construct imports"""

    # Create base subnet
    obj = hou.node('/obj')
    subnet = obj.createNode('subnet', 'wildConstruct_importer')

    # Create input parameters
    parm_group = subnet.parmTemplateGroup()

    # Export file path
    file_parm = hou.StringParmTemplate(
        'export_file',
        'Export File',
        1,
        string_type=hou.stringParmType.FileReference,
        file_type=hou.fileType.Any,
        default_value=['']
    )
    parm_group.append(file_parm)

    # Quality settings
    quality_parm = hou.MenuParmTemplate(
        'quality_level',
        'Quality Level',
        ['production', 'preview', 'debug'],
        default_value=0
    )
    parm_group.append(quality_parm)

    # Reproducibility seed
    seed_parm = hou.IntParmTemplate(
        'repro_seed',
        'Reproduction Seed',
        1,
        default_value=[0],
        min=0,
        max=1000000
    )
    parm_group.append(seed_parm)

    # Enable/disable features
    setup_camera_parm = hou.ToggleParmTemplate('setup_camera', 'Setup Camera', True)
    setup_lights_parm = hou.ToggleParmTemplate('setup_lights', 'Setup Lighting', True)
    create_geometry_parm = hou.ToggleParmTemplate('create_geo', 'Create Geometry', True)

    parm_group.append(setup_camera_parm)
    parm_group.append(setup_lights_parm)
    parm_group.append(create_geometry_parm)

    subnet.setParmTemplateGroup(parm_group)

    # Add processing nodes inside subnet
    create_processing_network(subnet)

    # Create HDA definition
    hda_def = subnet.createDigitalAsset(
        name='wildConstruct_importer',
        hda_file_name='/studio/hda/wildConstruct_importer.hda',
        description='Wild Construct VFX Export Importer'
    )

    # Add callback scripts
    add_hda_callbacks(hda_def)

    return hda_def

def create_processing_network(parent):
    """Create internal node network for processing exports"""

    # Python node for import logic
    python_import = parent.createNode('python', 'import_processor')
    python_import.parm('python').set("""
import json
import hou

# Get parameters
export_file = hou.pwd().parm('export_file').eval()
if not export_file:
    raise Exception("No export file specified")

# Load export data
with open(export_file, 'r') as f:
    export_data = json.load(f)

# Store data in detail attributes
geo = hou.pwd().geometry()
geo.addAttrib(hou.attribType.Global, 'export_data', export_data)

# Process variants
variants = export_data.get('prompt', {}).get('variants', [])
for i, variant in enumerate(variants):
    geo.addAttrib(hou.attribType.Global, f'variant_{i}_prompt', variant['prompt'])
    geo.addAttrib(hou.attribType.Global, f'variant_{i}_seed', variant['seed'])

print(f"Loaded export: {export_data['metadata']['exportId']}")
print(f"Variants: {len(variants)}")
""")

    # Camera setup node
    cam_setup = parent.createNode('python', 'camera_setup')
    cam_setup.parm('python').set("""
import hou
import json

# Get export data from previous node
geo = hou.pwd().inputs()[0].geometry()
export_data = geo.attribValue('export_data')

if export_data and hou.pwd().parent().parm('setup_camera').eval():
    camera_data = export_data.get('rendering', {}).get('camera', {})

    # Create camera in /obj context
    obj = hou.node('/obj')
    cam_name = f"wildConstruct_{export_data['metadata']['exportId']}_cam"

    if not obj.node(cam_name):
        cam = obj.createNode('cam', cam_name)

        # Set camera parameters
        if 'position' in camera_data:
            pos = camera_data['position']
            cam.parm('tx').set(pos[0])
            cam.parm('ty').set(pos[1])
            cam.parm('tz').set(pos[2])

        if 'rotation' in camera_data:
            rot = camera_data['rotation']
            cam.parm('rx').set(rot[0])
            cam.parm('ry').set(rot[1])
            cam.parm('rz').set(rot[2])

        if 'focal' in camera_data:
            cam.parm('focal').set(camera_data['focal'])

        if 'aperture' in camera_data:
            cam.parm('fstop').set(camera_data['aperture'])

        print(f"Created camera: {cam_name}")
""")

    cam_setup.setInput(0, python_import)

    # Lighting setup node
    light_setup = parent.createNode('python', 'lighting_setup')
    light_setup.parm('python').set("""
import hou
import math

geo = hou.pwd().inputs()[0].geometry()
export_data = geo.attribValue('export_data')

if export_data and hou.pwd().parent().parm('setup_lights').eval():
    lighting_data = export_data.get('rendering', {}).get('lighting', {})
    obj = hou.node('/obj')

    # Create key light
    key_light = obj.createNode('hlight', f"wildConstruct_key_light")
    key_light.parm('light_type').set(2)  # Distant light

    # Set color temperature
    temp = lighting_data.get('temperature', 5500)
    color = temperature_to_rgb(temp)
    key_light.parm('colorr').set(color[0])
    key_light.parm('colorg').set(color[1])
    key_light.parm('colorb').set(color[2])

    # Set intensity based on time of day
    time_multipliers = {
        'dawn': 0.3,
        'morning': 0.8,
        'noon': 1.0,
        'afternoon': 0.9,
        'dusk': 0.4,
        'night': 0.1
    }

    time_of_day = lighting_data.get('timeOfDay', 'noon')
    intensity = time_multipliers.get(time_of_day, 1.0)
    key_light.parm('light_intensity').set(intensity)

    print(f"Created lighting for {time_of_day}")

def temperature_to_rgb(temp_kelvin):
    # Color temperature conversion
    temp = temp_kelvin / 100.0

    if temp <= 66:
        red = 255
        green = temp
        green = 99.4708025861 * math.log(green) - 161.1195681661
        if temp >= 19:
            blue = temp - 10
            blue = 138.5177312231 * math.log(blue) - 305.0447927307
        else:
            blue = 0
    else:
        red = temp - 60
        red = 329.698727446 * (red ** -0.1332047592)
        green = temp - 60
        green = 288.1221695283 * (green ** -0.0755148492)
        blue = 255

    return [max(0, min(255, red))/255.0,
            max(0, min(255, green))/255.0,
            max(0, min(255, blue))/255.0]
""")

    light_setup.setInput(0, cam_setup)

    # Output null
    output = parent.createNode('null', 'OUTPUT')
    output.setInput(0, light_setup)
    output.setDisplayFlag(True)
    output.setRenderFlag(True)

def add_hda_callbacks(hda_def):
    """Add callback scripts to HDA"""

    # OnLoaded callback
    on_loaded = """
import hou
print("Wild Construct Importer loaded")

# Auto-load export if file parameter is set
export_file = hou.pwd().parm('export_file').eval()
if export_file and os.path.exists(export_file):
    hou.pwd().parm('reload').pressButton()
"""

    hda_def.addSection('OnLoaded', on_loaded)

    # Parameter change callback
    param_callback = """
import hou

# Reload when export file changes
if parm.name() == 'export_file':
    hou.pwd().node('import_processor').parm('python').pressButton()
    hou.pwd().node('camera_setup').parm('python').pressButton()
    hou.pwd().node('lighting_setup').parm('python').pressButton()
"""

    hda_def.addSection('ParmCallback', param_callback)
```

#### Step 2: Procedural Asset Generation

```python
# houdini_procedural_assets.py
import hou
import json

def create_procedural_environment(export_data):
    """Create procedural environment based on export data"""

    prompt_data = export_data.get('prompt', {})
    components = prompt_data.get('components', {})

    # Analyze prompt for environment type
    setting = components.get('setting', [])
    environment_type = determine_environment_type(setting)

    # Create appropriate procedural system
    if environment_type == 'castle':
        return create_castle_environment(export_data)
    elif environment_type == 'forest':
        return create_forest_environment(export_data)
    elif environment_type == 'space':
        return create_space_environment(export_data)
    else:
        return create_generic_environment(export_data)

def create_castle_environment(export_data):
    """Create procedural medieval castle"""
    obj = hou.node('/obj')
    castle_geo = obj.createNode('geo', 'procedural_castle')

    # Get reproducibility seed
    seed = export_data['execution']['randomization']['masterSeed']

    # Create castle base
    castle_base = castle_geo.createNode('box', 'castle_base')
    castle_base.parm('sizex').set(50)
    castle_base.parm('sizey').set(10)
    castle_base.parm('sizez').set(50)

    # Add noise for terrain
    terrain_noise = castle_geo.createNode('mountain', 'terrain')
    terrain_noise.setInput(0, castle_base)
    terrain_noise.parm('height').set(5)
    terrain_noise.parm('offset').set(seed)

    # Create towers procedurally
    tower_count = 4  # Extract from prompt analysis
    for i in range(tower_count):
        tower = create_castle_tower(castle_geo, i, seed + i * 100)

    # Add walls
    walls = create_castle_walls(castle_geo, seed + 1000)

    # Apply materials based on historical period
    apply_historical_materials(castle_geo, export_data)

    return castle_geo

def create_castle_tower(parent, tower_index, seed):
    """Create individual castle tower"""
    # Tower geometry
    tower = parent.createNode('tube', f'tower_{tower_index}')
    tower.parm('height').set(20)
    tower.parm('rad1').set(3)
    tower.parm('rad2').set(3)

    # Position towers at corners
    positions = [[-20, 0, -20], [20, 0, -20], [20, 0, 20], [-20, 0, 20]]
    pos = positions[tower_index % 4]

    transform = parent.createNode('xform', f'tower_{tower_index}_xform')
    transform.setInput(0, tower)
    transform.parm('tx').set(pos[0])
    transform.parm('ty').set(pos[1])
    transform.parm('tz').set(pos[2])

    # Add detail with noise
    detail = parent.createNode('mountain', f'tower_{tower_index}_detail')
    detail.setInput(0, transform)
    detail.parm('height').set(0.5)
    detail.parm('offset').set(seed)

    return detail
```

### Workflow 3: Nuke Compositing Pipeline

**Use Case**: Post-production facilities and finishing houses
**Complexity**: Low-Medium
**Timeline**: 1-2 days setup

#### Step 1: Nuke Import Script

```python
# nuke_wildstruct_import.py
import nuke
import json
import os

def import_wildstruct_export(export_path):
    """Import Wild Construct export into Nuke composition"""

    with open(export_path, 'r') as f:
        export_data = json.load(f)

    # Create input nodes for each variant
    variant_nodes = []
    variants = export_data['prompt']['variants']

    for i, variant in enumerate(variants):
        # Create Read node (placeholder - would connect to rendered images)
        read_node = nuke.createNode('Read')
        read_node.setName(f'wildConstruct_variant_{i+1}')
        read_node['label'].setValue(f"Seed: {variant['seed']}\\n{variant['prompt'][:40]}...")

        # Add custom knobs for metadata
        read_node.addKnob(nuke.String_Knob('wc_variant_id', 'Variant ID', variant['id']))
        read_node.addKnob(nuke.Int_Knob('wc_seed', 'Seed', variant['seed']))
        read_node.addKnob(nuke.Float_Knob('wc_confidence', 'Confidence', variant['confidence']))
        read_node.addKnob(nuke.String_Knob('wc_prompt', 'Full Prompt', variant['prompt']))

        variant_nodes.append(read_node)

    # Create switch node for variant selection
    if len(variant_nodes) > 1:
        switch_node = nuke.createNode('Switch')
        switch_node.setName('wildConstruct_variantSwitch')
        switch_node['label'].setValue('Wild Construct Variant Selector')

        for i, node in enumerate(variant_nodes):
            switch_node.setInput(i, node)

        # Add custom variant selector knob
        variant_names = [f"Variant {i+1} (Seed: {v['seed']})" for i, v in enumerate(variants)]
        variant_enum = nuke.Enumeration_Knob('variant_selector', 'Select Variant', variant_names)
        switch_node.addKnob(variant_enum)

        # Link variant selector to switch
        switch_node['which'].setExpression('variant_selector')

        current_node = switch_node
    else:
        current_node = variant_nodes[0] if variant_nodes else None

    if current_node:
        # Apply color correction based on lighting data
        current_node = apply_lighting_correction(current_node, export_data)

        # Add metadata display
        current_node = add_metadata_display(current_node, export_data)

    return current_node

def apply_lighting_correction(input_node, export_data):
    """Apply color correction based on export lighting data"""
    lighting = export_data.get('rendering', {}).get('lighting', {})

    # ColorCorrect node
    cc_node = nuke.createNode('ColorCorrect')
    cc_node.setInput(0, input_node)
    cc_node.setName('wildConstruct_lightingCorrect')
    cc_node['label'].setValue('Wild Construct Lighting Correction')

    # Apply temperature correction
    temperature = lighting.get('temperature', 5500)
    if temperature < 5500:  # Warmer
        warmth_factor = (5500 - temperature) / 2000.0
        cc_node['shadows']['r'].setValue(1.0 + warmth_factor * 0.1)
        cc_node['shadows']['b'].setValue(1.0 - warmth_factor * 0.05)
    elif temperature > 5500:  # Cooler
        cool_factor = (temperature - 5500) / 2000.0
        cc_node['shadows']['b'].setValue(1.0 + cool_factor * 0.1)
        cc_node['shadows']['r'].setValue(1.0 - cool_factor * 0.05)

    # Apply exposure adjustment based on time of day
    time_exposures = {
        'dawn': -0.3,
        'morning': 0.0,
        'noon': 0.2,
        'afternoon': 0.0,
        'dusk': -0.5,
        'night': -1.0
    }

    time_of_day = lighting.get('timeOfDay', 'noon')
    exposure = time_exposures.get(time_of_day, 0.0)
    cc_node['gain'].setValue(2 ** exposure)

    # Add mood adjustments
    mood = lighting.get('mood', 'neutral')
    if mood == 'dramatic':
        cc_node['gamma'].setValue(0.9)  # Increase contrast
        cc_node['shadows']['r'].setValue(cc_node['shadows']['r'].value() + 0.05)
    elif mood == 'soft':
        cc_node['gamma'].setValue(1.1)  # Decrease contrast
        cc_node['highlights']['g'].setValue(1.05)

    return cc_node

def add_metadata_display(input_node, export_data):
    """Add text overlay with export metadata"""
    text_node = nuke.createNode('Text2')
    text_node.setInput(0, input_node)
    text_node.setName('wildConstruct_metadata')

    # Build metadata text
    metadata = export_data['metadata']
    prompt = export_data['prompt']

    text_content = f"""Project: {metadata['project']['name']}
Scene: {metadata['project']['scene']}
Shot: {metadata['project']['shot']}
Export ID: {metadata['exportId']}
Master Seed: {export_data['execution']['randomization']['masterSeed']}
Variants: {len(prompt['variants'])}"""

    text_node['message'].setValue(text_content)
    text_node['size'].setValue(24)
    text_node['xjustify'].setValue('left')
    text_node['yjustify'].setValue('top')
    text_node['box'].setValue([50, 50, 400, 250])
    text_node['color'].setValue([1, 1, 1, 0.8])

    # Make it toggleable
    text_node.addKnob(nuke.Boolean_Knob('show_metadata', 'Show Metadata', True))
    text_node['enable'].setExpression('show_metadata')

    return text_node

# Nuke menu integration
def add_wildstruct_menu():
    """Add Wild Construct menu to Nuke"""
    menubar = nuke.menu('Nuke')
    wildstruct_menu = menubar.addMenu('Wild Construct')

    wildstruct_menu.addCommand('Import Export...', 'import_wildstruct_export_dialog()')
    wildstruct_menu.addCommand('Validate Export...', 'validate_wildstruct_export_dialog()')
    wildstruct_menu.addSeparator()
    wildstruct_menu.addCommand('About', 'show_wildstruct_about()')

def import_wildstruct_export_dialog():
    """File dialog for importing exports"""
    export_path = nuke.getFilename('Select Wild Construct Export', '*.vfx.json')
    if export_path:
        try:
            imported_node = import_wildstruct_export(export_path)
            if imported_node:
                nuke.message(f'Successfully imported Wild Construct export')
        except Exception as e:
            nuke.message(f'Import failed: {str(e)}')

# Add menu on Nuke startup
add_wildstruct_menu()
```

## Troubleshooting Common Issues

### Issue 1: Export Validation Failures

**Symptoms**: Export fails validation with schema errors
**Causes**:

- Outdated export format version
- Missing required fields
- Corrupted export data

**Solutions**:

```bash
# Check export format version
wc validate export.vfx.json --version-check

# Repair common issues
wc repair export.vfx.json --auto-fix

# Validate with detailed output
wc validate export.vfx.json --verbose --strict
```

### Issue 2: Reproducibility Problems

**Symptoms**: Same seed produces different results
**Causes**:

- Different software versions
- Missing RNG state data
- Modified node configurations

**Solutions**:

```javascript
// Check reproducibility status
const validator = ReproducibilityValidator.getInstance();
const report = validator.validateReproducibility(exportData);

if (!report.exactReproducible) {
  console.log('Reproducibility issues:');
  report.errors.forEach(error => console.log(`- ${error.message}`));

  // Apply suggested fixes
  report.suggestions.forEach(suggestion => {
    if (suggestion.priority === 'high') {
      console.log(`Fix: ${suggestion.message}`);
    }
  });
}
```

### Issue 3: Performance Issues

**Symptoms**: Slow import/export operations
**Causes**:

- Large export files
- Complex graph structures
- Network storage latency

**Solutions**:

```javascript
// Enable caching
const exporter = WildConstructVFXExporter.getInstance();
exporter.enableCache({
  memoryLimit: 100 * 1024 * 1024, // 100MB
  diskCache: '/tmp/wc-cache',
  ttl: 3600, // 1 hour
});

// Use streaming for large files
const stream = exporter.createExportStream(graph, options);
stream.pipe(fs.createWriteStream('large-export.vfx.json'));
```

### Issue 4: Software Compatibility

**Symptoms**: Import fails in target software
**Causes**:

- Unsupported software version
- Missing plugins/extensions
- Platform differences

**Solutions**:

```python
# Check compatibility
def check_software_compatibility(export_data):
    compatibility = export_data['metadata']['compatibility']

    # Check Maya version
    if maya.cmds.about(version=True) < compatibility['vfxSoftware']['maya']['minVersion']:
        raise Exception("Maya version too old")

    # Check required plugins
    required_plugins = ['wildConstructImporter', 'mtoa']  # Arnold plugin
    for plugin in required_plugins:
        if not maya.cmds.pluginInfo(plugin, query=True, loaded=True):
            maya.cmds.loadPlugin(plugin)
```

## Performance Optimization

### Optimization 1: Parallel Processing

```python
# Parallel export processing
import concurrent.futures
import threading

class ParallelExportProcessor:
    def __init__(self, max_workers=4):
        self.max_workers = max_workers
        self.thread_local = threading.local()

    def process_multiple_exports(self, export_tasks):
        """Process multiple exports in parallel"""
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_task = {
                executor.submit(self.process_single_export, task): task
                for task in export_tasks
            }

            results = []
            for future in concurrent.futures.as_completed(future_to_task):
                task = future_to_task[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as exc:
                    print(f'Export {task["id"]} generated an exception: {exc}')
                    results.append({'id': task['id'], 'error': str(exc)})

            return results

    def process_single_export(self, task):
        """Process single export with thread-local resources"""
        if not hasattr(self.thread_local, 'exporter'):
            self.thread_local.exporter = WildConstructVFXExporter.getInstance()

        return self.thread_local.exporter.exportGraph(
            task['graph'],
            task.get('execution_data'),
            task.get('options', {'quality': 'production'})
        )
```

### Optimization 2: Streaming Large Exports

```javascript
// Streaming export for large data sets
class StreamingExporter {
  constructor() {
    this.chunkSize = 1024 * 1024; // 1MB chunks
  }

  async *exportStream(graph, executionResults, options) {
    // Export in chunks to manage memory
    const metadata = await this.buildMetadata(options);
    yield JSON.stringify({ metadata }) + '\n';

    const prompt = await this.buildPromptData(graph, executionResults);
    yield JSON.stringify({ prompt }) + '\n';

    // Stream graph nodes in batches
    const nodeBatches = this.chunkArray(graph.nodes, 10);
    for (const batch of nodeBatches) {
      const processedBatch = await this.processNodeBatch(batch);
      yield JSON.stringify({ nodes: processedBatch }) + '\n';
    }

    const execution = await this.buildExecutionData(executionResults, options);
    yield JSON.stringify({ execution }) + '\n';
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Usage
const streamingExporter = new StreamingExporter();
const stream = streamingExporter.exportStream(graph, results, options);

const writableStream = fs.createWriteStream('large-export.vfx.json');
for await (const chunk of stream) {
  writableStream.write(chunk);
}
writableStream.end();
```

## Production Deployment

### Deployment Checklist

- [ ] **Infrastructure**
  - Shared storage accessible to all pipeline tools
  - Network bandwidth sufficient for export file sizes
  - Backup systems for export data
  - Version control for export configurations

- [ ] **Software Installation**
  - Wild Construct VFX Exporter on all workstations
  - Pipeline integration plugins installed
  - Software versions meet compatibility requirements
  - License compliance verified

- [ ] **Testing**
  - End-to-end pipeline test with sample data
  - Performance benchmarking completed
  - Reproducibility validation passed
  - User acceptance testing completed

- [ ] **Documentation**
  - User guides distributed to artists
  - Technical documentation for pipeline TDs
  - Troubleshooting guides accessible
  - Emergency contact procedures established

- [ ] **Training**
  - Pipeline TD training completed
  - Artist workflow training scheduled
  - Supervisor overview sessions conducted
  - Support escalation procedures established

### Monitoring and Maintenance

```python
# Pipeline monitoring system
import logging
import time
import psutil
from datetime import datetime

class PipelineMonitor:
    def __init__(self):
        self.logger = logging.getLogger('wildstruct_pipeline')
        self.metrics = {
            'exports_processed': 0,
            'imports_successful': 0,
            'errors_encountered': 0,
            'average_processing_time': 0
        }

    def monitor_export_operation(self, operation_func, *args, **kwargs):
        """Monitor an export operation"""
        start_time = time.time()
        start_memory = psutil.virtual_memory().used

        try:
            result = operation_func(*args, **kwargs)

            # Record success metrics
            end_time = time.time()
            processing_time = end_time - start_time

            self.metrics['exports_processed'] += 1
            self.update_average_processing_time(processing_time)

            self.logger.info(f"Export completed in {processing_time:.2f}s")

            return result

        except Exception as e:
            self.metrics['errors_encountered'] += 1
            self.logger.error(f"Export failed: {str(e)}")
            raise

    def generate_daily_report(self):
        """Generate daily pipeline report"""
        report = f"""
Wild Construct Pipeline Daily Report - {datetime.now().strftime('%Y-%m-%d')}

Metrics:
- Exports Processed: {self.metrics['exports_processed']}
- Successful Imports: {self.metrics['imports_successful']}
- Errors Encountered: {self.metrics['errors_encountered']}
- Average Processing Time: {self.metrics['average_processing_time']:.2f}s

System Health:
- Memory Usage: {psutil.virtual_memory().percent}%
- Disk Usage: {psutil.disk_usage('/').percent}%
- CPU Usage: {psutil.cpu_percent()}%
"""

        self.logger.info(report)
        return report
```

This comprehensive integration guide provides the foundation for successful Wild Construct VFX export integration across different production pipelines and scales, from small studios to large-scale productions.
