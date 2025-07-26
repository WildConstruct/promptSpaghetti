// server/src/exporter.ts
// Exports a Graph to a GeneratorBundle format compatible with the Randomizer Engine
// Also includes import functionality to convert from GeneratorBundle back to Graph
// Epic 8.6 Task 7: Enhanced with Hybrid Prompting Export Structure
import { z } from 'zod';
/**
 * Epic 8.6: Enhanced VFX/ControlNet parameter structures
 */
export const ControlNetParametersSchema = z.object({
    poseGuidance: z.object({
        enabled: z.boolean().default(false),
        strength: z.number().min(0).max(2).default(1.0),
        startStep: z.number().min(0).max(1000).default(0),
        endStep: z.number().min(0).max(1000).default(1000),
        keypoints: z.array(z.object({
            x: z.number(),
            y: z.number(),
            confidence: z.number().min(0).max(1)
        })).optional()
    }).optional(),
    depthMaps: z.object({
        enabled: z.boolean().default(false),
        strength: z.number().min(0).max(2).default(1.0),
        preprocessor: z.enum(['depth_midas', 'depth_zoe', 'depth_leres']).default('depth_midas')
    }).optional(),
    edgeDetection: z.object({
        enabled: z.boolean().default(false),
        strength: z.number().min(0).max(2).default(1.0),
        preprocessor: z.enum(['canny', 'hed', 'scribble', 'pidinet']).default('canny'),
        lowThreshold: z.number().min(0).max(255).default(100),
        highThreshold: z.number().min(0).max(255).default(200)
    }).optional(),
    animationSequence: z.object({
        frameCount: z.number().min(1).max(10000).default(1),
        fps: z.number().min(1).max(60).default(24),
        interpolationMethod: z.enum(['linear', 'cubic', 'bezier']).default('linear'),
        keyframes: z.array(z.object({
            frame: z.number(),
            parameters: z.record(z.string(), z.unknown())
        })).default([])
    }).optional(),
    cameraParameters: z.object({
        fov: z.number().min(1).max(180).default(70),
        aspectRatio: z.number().min(0.1).max(10).default(1.777), // 16:9
        nearPlane: z.number().min(0.001).max(1000).default(0.1),
        farPlane: z.number().min(1).max(10000).default(1000),
        position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 5]),
        rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0])
    }).optional(),
    billboardProjection: z.object({
        enabled: z.boolean().default(false),
        targetResolution: z.tuple([z.number(), z.number()]).default([1920, 1080]),
        projectionMatrix: z.array(z.number()).length(16).optional() // 4x4 matrix
    }).optional()
});
/**
 * Epic 8.6 Task 3: Scene Data Integration Schema
 * Professional scene data structure for film production workflows
 */
export const SceneDataSchema = z.object({
    camera: z.object({
        position: z.object({
            x: z.number().default(0),
            y: z.number().default(0),
            z: z.number().default(5)
        }),
        angle: z.object({
            pitch: z.number().min(-90).max(90).default(0), // degrees
            yaw: z.number().min(-180).max(180).default(0), // degrees  
            roll: z.number().min(-180).max(180).default(0) // degrees
        }),
        distance: z.number().min(0.1).max(1000).default(5),
        lens: z.object({
            focalLength: z.number().min(10).max(500).default(50), // mm
            aperture: z.number().min(1).max(22).default(2.8), // f-stop
            focusDistance: z.number().min(0.1).max(1000).default(10) // meters
        }).optional(),
        movement: z.object({
            type: z.enum(['static', 'pan', 'tilt', 'dolly', 'crane', 'handheld']).default('static'),
            speed: z.enum(['slow', 'medium', 'fast']).default('medium'),
            smoothness: z.number().min(0).max(1).default(0.8)
        }).optional()
    }),
    lighting: z.object({
        timeOfDay: z.enum([
            'dawn',
            'morning',
            'noon',
            'afternoon',
            'dusk',
            'night',
            'golden-hour',
            'blue-hour'
        ]).default('noon'),
        weather: z.enum(['clear', 'cloudy', 'overcast', 'foggy', 'rainy', 'stormy', 'snowy']).default('clear'),
        mood: z.enum(['bright', 'dramatic', 'soft', 'harsh', 'moody', 'ethereal', 'cinematic']).default('bright'),
        keyLight: z.object({
            intensity: z.number().min(0).max(100).default(80),
            temperature: z.number().min(2000).max(10000).default(5600), // Kelvin
            angle: z.number().min(0).max(360).default(45) // degrees from subject
        }).optional(),
        fillLight: z.object({
            intensity: z.number().min(0).max(100).default(40),
            temperature: z.number().min(2000).max(10000).default(3200), // Kelvin
            angle: z.number().min(0).max(360).default(225) // degrees from subject
        }).optional()
    }).optional(),
    environment: z.object({
        location: z.enum(['interior', 'exterior', 'studio', 'practical']).default('studio'),
        atmosphere: z.enum(['clear', 'hazy', 'dusty', 'smoky', 'misty']).default('clear'),
        temperature: z.number().min(-40).max(50).default(20), // Celsius
        windSpeed: z.number().min(0).max(100).default(0), // km/h
        props: z.array(z.string()).default([])
    }).optional(),
    postProcessing: z.object({
        colorGrading: z.object({
            style: z.enum(['natural', 'cinematic', 'vintage', 'modern', 'dramatic']).default('natural'),
            contrast: z.number().min(-100).max(100).default(0),
            saturation: z.number().min(-100).max(100).default(0),
            warmth: z.number().min(-100).max(100).default(0)
        }).optional(),
        effects: z.array(z.enum(['bloom', 'vignette', 'film-grain', 'lens-flare', 'depth-of-field'])).default([])
    }).optional()
});
/**
 * GeneratorBundle schema matching the Randomizer Engine's expected format
 * Epic 8.6: Enhanced with VFX/ControlNet compatibility
 */
export const GeneratorBundleSchema = z.object({
    metadata: z.object({
        name: z.string(),
        version: z.string(), // semver
        author: z.string(),
        created: z.string(), // ISO-8601 date
        debug: z.object({
            seed: z.number().optional(),
            originGraphGuid: z.string().optional()
        }).optional(),
        // Epic 8.6: VFX pipeline metadata
        vfx: z.object({
            exportFormat: z.literal('controlnet-compatible').default('controlnet-compatible'),
            targetPipeline: z.enum(['stable-diffusion', 'midjourney', 'dalle', 'custom']).default('stable-diffusion'),
            compatibilityVersion: z.string().default('1.0.0')
        }).optional()
    }),
    variables: z.record(z.string(), z.unknown()),
    grammar: z.record(z.string(), z.union([
        z.array(z.string()), // ArrayRule
        z.array(z.object({
            text: z.string(),
            weight: z.number().optional()
        })),
        z.object({
            type: z.literal('conditional'),
            cases: z.array(z.object({
                condition: z.string(),
                value: z.string()
            }))
        }),
        z.object({
            type: z.literal('sequential'),
            items: z.array(z.string())
        }),
        z.union([
            z.object({ $include: z.string() }),
            z.array(z.union([
                z.object({ _meta: z.record(z.string(), z.unknown()).optional() }),
                z.object({ $include: z.string() })
            ]))
        ]),
        z.object({
            type: z.literal('modifier_chain'),
            base: z.string(),
            mods: z.array(z.string())
        })
    ])),
    entry_points: z.object({
        default: z.string(),
        alternatives: z.array(z.string()).optional()
    }),
    lockedValues: z.record(z.string(), z.string()).optional(),
    seed: z.number().optional(),
    // Epic 8.6: ControlNet integration parameters
    controlNet: ControlNetParametersSchema.optional(),
    // Epic 8.6 Task 3: Scene data integration
    sceneData: SceneDataSchema.optional()
});
/**
 * Epic 8.6: Extract ControlNet parameters from graph nodes
 * Looks for nodes that have VFX-related configuration
 */
function extractControlNetParameters(graph) {
    const controlNetParams = {};
    // Look for nodes with VFX metadata or specific node types that indicate ControlNet usage
    graph.nodes.forEach(node => {
        // Check for camera-related variables
        if (node.type === 'SetVariable' && node.key) {
            const key = node.key.toLowerCase();
            if (key.includes('camera') || key.includes('fov') || key.includes('position')) {
                if (!controlNetParams.cameraParameters) {
                    controlNetParams.cameraParameters = {
                        fov: 70,
                        aspectRatio: 1.777,
                        nearPlane: 0.1,
                        farPlane: 1000,
                        position: [0, 0, 5],
                        rotation: [0, 0, 0]
                    };
                }
                // Extract camera values from variable nodes
                if (key.includes('fov') && typeof node.value === 'number') {
                    controlNetParams.cameraParameters.fov = node.value;
                }
            }
        }
        // Check for animation-related configurations
        if (node.type === 'Sequential' && node.sequence && node.sequence.length > 1) {
            controlNetParams.animationSequence = {
                frameCount: node.sequence.length,
                fps: 24,
                interpolationMethod: 'linear',
                keyframes: node.sequence.map((item, index) => ({
                    frame: index,
                    parameters: { text: item }
                }))
            };
        }
        // Look for edge detection hints in node names/descriptions
        if (node.id.toLowerCase().includes('edge') || node.id.toLowerCase().includes('canny')) {
            controlNetParams.edgeDetection = {
                enabled: true,
                strength: 1.0,
                preprocessor: 'canny',
                lowThreshold: 100,
                highThreshold: 200
            };
        }
        // Look for depth-related hints
        if (node.id.toLowerCase().includes('depth') || node.id.toLowerCase().includes('3d')) {
            controlNetParams.depthMaps = {
                enabled: true,
                strength: 1.0,
                preprocessor: 'depth_midas'
            };
        }
    });
    return controlNetParams;
}
/**
 * Epic 8.6 Task 3: Extract scene data from graph nodes
 * Analyzes graph for scene-related variables and configurations
 */
function extractSceneData(graph) {
    const sceneData = {
        camera: {
            position: { x: 0, y: 0, z: 5 },
            angle: { pitch: 0, yaw: 0, roll: 0 },
            distance: 5
        },
        lighting: {
            timeOfDay: 'noon',
            weather: 'clear',
            mood: 'bright'
        },
        environment: {
            setting: 'interior-studio',
            atmosphere: 'calm',
            scale: 'medium',
            props: []
        }
    };
    // Extract scene data from variable nodes
    graph.nodes.forEach(node => {
        if (node.type === 'SetVariable' && node.key && node.value) {
            const key = node.key.toLowerCase();
            const value = node.value;
            // Camera position variables
            if (key.includes('camera') || key.includes('position')) {
                if (key.includes('x') && typeof value === 'number') {
                    sceneData.camera.position.x = value;
                }
                if (key.includes('y') && typeof value === 'number') {
                    sceneData.camera.position.y = value;
                }
                if (key.includes('z') && typeof value === 'number') {
                    sceneData.camera.position.z = value;
                }
            }
            // Camera angles
            if (key.includes('angle') || key.includes('rotation')) {
                if (key.includes('pitch') && typeof value === 'number') {
                    sceneData.camera.angle.pitch = Math.max(-90, Math.min(90, value));
                }
                if (key.includes('yaw') && typeof value === 'number') {
                    sceneData.camera.angle.yaw = Math.max(-180, Math.min(180, value));
                }
                if (key.includes('roll') && typeof value === 'number') {
                    sceneData.camera.angle.roll = Math.max(-180, Math.min(180, value));
                }
            }
            // Distance
            if (key.includes('distance') && typeof value === 'number') {
                sceneData.camera.distance = Math.max(0.1, Math.min(1000, value));
            }
            // Lighting conditions
            if (key.includes('time') || key.includes('lighting')) {
                const timeKeywords = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'golden', 'blue'];
                const stringValue = String(value).toLowerCase();
                for (const keyword of timeKeywords) {
                    if (stringValue.includes(keyword)) {
                        if (keyword === 'golden')
                            sceneData.lighting.timeOfDay = 'golden-hour';
                        else if (keyword === 'blue')
                            sceneData.lighting.timeOfDay = 'blue-hour';
                        else
                            sceneData.lighting.timeOfDay = keyword;
                        break;
                    }
                }
            }
            // Weather
            if (key.includes('weather')) {
                const weatherKeywords = ['clear', 'cloudy', 'overcast', 'foggy', 'rainy', 'stormy', 'snowy'];
                const stringValue = String(value).toLowerCase();
                for (const keyword of weatherKeywords) {
                    if (stringValue.includes(keyword)) {
                        sceneData.lighting.weather = keyword;
                        break;
                    }
                }
            }
            // Mood/atmosphere
            if (key.includes('mood') || key.includes('atmosphere')) {
                const moodKeywords = ['bright', 'dramatic', 'soft', 'harsh', 'moody', 'ethereal', 'cinematic'];
                const stringValue = String(value).toLowerCase();
                for (const keyword of moodKeywords) {
                    if (stringValue.includes(keyword)) {
                        sceneData.lighting.mood = keyword;
                        break;
                    }
                }
            }
            // Environment setting
            if (key.includes('setting') || key.includes('location')) {
                const settingKeywords = [
                    'interior-home', 'interior-office', 'interior-studio', 'interior-warehouse',
                    'exterior-urban', 'exterior-nature', 'exterior-beach', 'exterior-mountain',
                    'exterior-forest', 'exterior-desert', 'exterior-space', 'abstract'
                ];
                const stringValue = String(value).toLowerCase();
                for (const keyword of settingKeywords) {
                    if (stringValue.includes(keyword.replace('-', '')) || stringValue.includes(keyword)) {
                        sceneData.environment.setting = keyword;
                        break;
                    }
                }
            }
            // Props
            if (key.includes('prop') && typeof value === 'string') {
                if (!sceneData.environment.props)
                    sceneData.environment.props = [];
                sceneData.environment.props.push(value);
            }
        }
        // Extract scene hints from node names and content
        const nodeId = node.id.toLowerCase();
        const nodeContent = JSON.stringify(node).toLowerCase();
        // Camera movement hints
        if (nodeId.includes('pan') || nodeContent.includes('pan')) {
            if (!sceneData.camera.movement)
                sceneData.camera.movement = { type: 'static', speed: 'medium', smoothness: 0.8 };
            sceneData.camera.movement.type = 'pan';
        }
        if (nodeId.includes('dolly') || nodeContent.includes('dolly')) {
            if (!sceneData.camera.movement)
                sceneData.camera.movement = { type: 'static', speed: 'medium', smoothness: 0.8 };
            sceneData.camera.movement.type = 'dolly';
        }
        // Lighting hints from node content
        if (nodeContent.includes('dramatic') || nodeContent.includes('cinematic')) {
            sceneData.lighting.mood = 'dramatic';
        }
        if (nodeContent.includes('soft') || nodeContent.includes('gentle')) {
            sceneData.lighting.mood = 'soft';
        }
        // Scale hints
        if (nodeContent.includes('close') || nodeContent.includes('intimate')) {
            sceneData.environment.scale = 'intimate';
        }
        if (nodeContent.includes('wide') || nodeContent.includes('vast')) {
            sceneData.environment.scale = 'wide';
        }
        if (nodeContent.includes('epic') || nodeContent.includes('grand')) {
            sceneData.environment.scale = 'epic';
        }
    });
    // Generate scene metadata if we have enough information
    const hasSceneData = sceneData.camera?.position.x !== 0 ||
        sceneData.camera?.position.y !== 0 ||
        sceneData.camera?.position.z !== 5 ||
        sceneData.lighting?.timeOfDay !== 'noon' ||
        sceneData.environment?.setting !== 'interior-studio';
    if (hasSceneData) {
        sceneData.metadata = {
            sceneId: `scene-${Date.now()}`,
            takeNumber: 1,
            notes: 'Auto-generated scene data from graph variables'
        };
    }
    return sceneData;
}
/**
 * Converts a graph to a generator bundle format
 * @param graph Graph to convert
 * @param options Additional metadata for the bundle
 * @returns A GeneratorBundle compatible with the Randomizer Engine
 */
export function graphToBundle(graph, options) {
    // Create default metadata with Epic 8.6 VFX enhancements
    const metadata = {
        name: options.name,
        version: options.version || '1.0.0',
        author: options.author || 'PromptScape Graph Editor',
        created: new Date().toISOString(),
        debug: {
            seed: typeof graph.seed === 'number' ? graph.seed : undefined,
            originGraphGuid: undefined // Could be added as an optional parameter if needed
        },
        // Epic 8.6: VFX pipeline metadata
        vfx: options.controlNetEnabled ? {
            exportFormat: 'controlnet-compatible',
            targetPipeline: options.targetPipeline || 'stable-diffusion',
            compatibilityVersion: '1.0.0'
        } : undefined
    };
    // Initialize bundle structure
    const bundle = {
        metadata,
        variables: {},
        grammar: {},
        entry_points: {
            default: 'main',
            alternatives: []
        },
        seed: typeof graph.seed === 'number' ? graph.seed : undefined
    };
    // Epic 8.6: Extract and apply ControlNet parameters if enabled
    if (options.controlNetEnabled) {
        const extractedParams = extractControlNetParameters(graph);
        // Merge extracted parameters with defaults
        bundle.controlNet = {
            poseGuidance: extractedParams.poseGuidance || {
                enabled: false,
                strength: 1.0,
                startStep: 0,
                endStep: 1000
            },
            depthMaps: extractedParams.depthMaps || {
                enabled: false,
                strength: 1.0,
                preprocessor: 'depth_midas'
            },
            edgeDetection: extractedParams.edgeDetection || {
                enabled: false,
                strength: 1.0,
                preprocessor: 'canny',
                lowThreshold: 100,
                highThreshold: 200
            },
            animationSequence: extractedParams.animationSequence || {
                frameCount: 1,
                fps: 24,
                interpolationMethod: 'linear',
                keyframes: []
            },
            cameraParameters: extractedParams.cameraParameters || {
                fov: 70,
                aspectRatio: 1.777, // 16:9
                nearPlane: 0.1,
                farPlane: 1000,
                position: [0, 0, 5],
                rotation: [0, 0, 0]
            },
            billboardProjection: extractedParams.billboardProjection || {
                enabled: false,
                targetResolution: [1920, 1080]
            }
        };
    }
    // Find all variable declarations in the graph
    const variables = {};
    const outputNodes = [];
    const nodeMap = new Map();
    // First pass - catalog all nodes and extract variables
    graph.nodes.forEach(node => {
        nodeMap.set(node.id, node);
        if (node.type === 'SetVariable') {
            variables[node.key] = node.value;
        }
        if (node.type === 'Output') {
            outputNodes.push(node);
        }
    });
    // Add variables to bundle
    bundle.variables = variables;
    // Create grammar rules for each node
    graph.nodes.forEach(node => {
        const ruleId = node.id;
        bundle.grammar[ruleId] = convertNodeToRule(node, nodeMap);
    });
    // Set the default entry point to the first output node
    if (outputNodes.length > 0) {
        bundle.entry_points.default = outputNodes[0].id;
        // If there are multiple output nodes, add them as alternatives
        if (outputNodes.length > 1) {
            bundle.entry_points.alternatives = outputNodes.slice(1).map(n => n.id);
        }
    }
    // Epic 8.6 Task 3: Extract and integrate scene data if enabled
    if (options.includeSceneData) {
        const extractedSceneData = extractSceneData(graph);
        // Only include scene data if meaningful data was found
        if (extractedSceneData.metadata) {
            bundle.sceneData = extractedSceneData;
        }
    }
    return bundle;
}
/**
 * Epic 8.6: Enhanced VFX-focused export function
 * Creates a ControlNet-compatible export with full VFX metadata
 */
export function graphToVFXBundle(graph, options) {
    return graphToBundle(graph, {
        ...options,
        controlNetEnabled: true,
        includeSceneData: true, // Epic 8.6 Task 3: Always include scene data in VFX exports
        targetPipeline: options.targetPipeline || 'stable-diffusion'
    });
}
/**
 * Epic 8.6: Validate ControlNet compatibility
 * Checks if a graph has VFX-compatible structures
 */
export function validateVFXCompatibility(graph) {
    const features = [];
    const recommendations = [];
    // Check for camera variables
    const hasCameraVars = graph.nodes.some(node => node.type === 'SetVariable' &&
        node.key?.toLowerCase().includes('camera'));
    if (hasCameraVars)
        features.push('Camera controls detected');
    else
        recommendations.push('Add camera position/angle variables for 3D scenes');
    // Check for animation sequences
    const hasAnimation = graph.nodes.some(node => node.type === 'Sequential' &&
        node.sequence &&
        node.sequence.length > 1);
    if (hasAnimation)
        features.push('Animation sequence support');
    else
        recommendations.push('Use Sequential nodes for multi-frame animations');
    // Check for depth/3D hints
    const hasDepthHints = graph.nodes.some(node => node.id.toLowerCase().includes('depth') ||
        node.id.toLowerCase().includes('3d'));
    if (hasDepthHints)
        features.push('Depth processing hints');
    // Check for edge detection hints
    const hasEdgeHints = graph.nodes.some(node => node.id.toLowerCase().includes('edge') ||
        node.id.toLowerCase().includes('canny'));
    if (hasEdgeHints)
        features.push('Edge detection support');
    // Epic 8.6 Task 3: Check for scene data variables
    const hasSceneVars = graph.nodes.some(node => node.type === 'SetVariable' && node.key && (node.key.toLowerCase().includes('camera') ||
        node.key.toLowerCase().includes('lighting') ||
        node.key.toLowerCase().includes('weather') ||
        node.key.toLowerCase().includes('setting') ||
        node.key.toLowerCase().includes('mood')));
    if (hasSceneVars)
        features.push('Scene data variables (camera, lighting, environment)');
    else
        recommendations.push('Add scene variables (camera_x, lighting_mood, weather_clear) for cinematic control');
    // Check for camera position controls
    const hasCameraControls = graph.nodes.some(node => node.type === 'SetVariable' && node.key && (node.key.toLowerCase().includes('position') ||
        node.key.toLowerCase().includes('angle') ||
        node.key.toLowerCase().includes('distance')));
    if (hasCameraControls)
        features.push('Camera position and angle controls');
    const compatible = features.length >= 1; // Need at least one VFX feature
    if (!compatible) {
        recommendations.push('Add VFX-related nodes (camera variables, sequential animations, or depth/edge hints) for better ControlNet compatibility');
    }
    return {
        compatible,
        features,
        recommendations
    };
}
/**
 * Epic 8.6 Task 3: Generate scene-to-prompt data flow
 * Creates natural language prompt additions based on scene data
 */
export function generateScenePromptFlow(sceneData) {
    const prompts = {
        cameraPrompt: '',
        lightingPrompt: '',
        environmentPrompt: '',
        fullPrompt: ''
    };
    // Camera prompt generation
    if (sceneData.camera) {
        const { position, angle, distance, lens, movement } = sceneData.camera;
        // Distance and framing
        if (distance < 2)
            prompts.cameraPrompt += 'extreme close-up, ';
        else if (distance < 5)
            prompts.cameraPrompt += 'close-up shot, ';
        else if (distance < 10)
            prompts.cameraPrompt += 'medium shot, ';
        else if (distance < 20)
            prompts.cameraPrompt += 'wide shot, ';
        else
            prompts.cameraPrompt += 'very wide shot, ';
        // Camera angles
        if (angle.pitch > 30)
            prompts.cameraPrompt += 'high angle, ';
        else if (angle.pitch < -30)
            prompts.cameraPrompt += 'low angle, ';
        else
            prompts.cameraPrompt += 'eye level, ';
        // Lens characteristics
        if (lens?.focalLength) {
            if (lens.focalLength < 35)
                prompts.cameraPrompt += 'wide angle lens, ';
            else if (lens.focalLength > 85)
                prompts.cameraPrompt += 'telephoto lens, ';
            if (lens.aperture < 2.8)
                prompts.cameraPrompt += 'shallow depth of field, ';
            else if (lens.aperture > 8)
                prompts.cameraPrompt += 'deep focus, ';
        }
        // Camera movement
        if (movement?.type && movement.type !== 'static') {
            prompts.cameraPrompt += `${movement.type} camera movement, `;
        }
    }
    // Lighting prompt generation  
    if (sceneData.lighting) {
        const { timeOfDay, weather, mood, keyLight } = sceneData.lighting;
        // Time and weather
        prompts.lightingPrompt += `${timeOfDay.replace('-', ' ')} lighting, `;
        if (weather !== 'clear')
            prompts.lightingPrompt += `${weather} weather, `;
        // Mood
        prompts.lightingPrompt += `${mood} lighting mood, `;
        // Technical lighting
        if (keyLight?.intensity) {
            if (keyLight.intensity > 80)
                prompts.lightingPrompt += 'strong key light, ';
            else if (keyLight.intensity < 40)
                prompts.lightingPrompt += 'soft key light, ';
        }
    }
    // Environment prompt generation
    if (sceneData.environment) {
        const { setting, atmosphere, scale, depth, props } = sceneData.environment;
        // Setting and scale
        const settingDesc = setting.replace('-', ' ').replace('interior', 'inside').replace('exterior', 'outside');
        prompts.environmentPrompt += `${settingDesc} setting, `;
        prompts.environmentPrompt += `${scale} scale composition, `;
        // Atmosphere
        prompts.environmentPrompt += `${atmosphere} atmosphere, `;
        // Depth layers
        if (depth?.foreground)
            prompts.environmentPrompt += `${depth.foreground} in foreground, `;
        if (depth?.background)
            prompts.environmentPrompt += `${depth.background} in background, `;
        // Props
        if (props.length > 0) {
            prompts.environmentPrompt += `featuring ${props.join(', ')}, `;
        }
    }
    // Combine all prompts
    prompts.fullPrompt = [
        prompts.cameraPrompt.trim(),
        prompts.lightingPrompt.trim(),
        prompts.environmentPrompt.trim()
    ].filter(p => p.length > 0).join(' ');
    // Clean up trailing commas and spaces
    Object.keys(prompts).forEach(key => {
        prompts[key] = prompts[key]
            .replace(/,\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();
    });
    return prompts;
}
/**
 * Epic 8.6 Task 3: Create a complete scene-aware export
 * Combines VFX export with scene data and prompt flow
 */
export function graphToSceneAwareBundle(graph, options) {
    const bundle = graphToVFXBundle(graph, options);
    // Add scene-to-prompt flow if requested and scene data exists
    if (options.includePromptFlow && bundle.sceneData) {
        const scenePromptFlow = generateScenePromptFlow(bundle.sceneData);
        return {
            ...bundle,
            scenePromptFlow
        };
    }
    return bundle;
}
/**
 * Convert a node to its corresponding grammar rule in the GeneratorBundle format
 */
function convertNodeToRule(node, nodeMap) {
    switch (node.type) {
        case 'WeightedChoice':
            // Convert to weighted array rule
            return node.choices.map(choice => ({
                text: choice.value,
                weight: choice.weight
            }));
        case 'Concat':
            // If inputs exist, create a sequential rule
            if (node.inputs && node.inputs.length > 0) {
                return {
                    type: 'sequential',
                    items: node.inputs
                };
            }
            return ['']; // Empty concat gives empty string
        case 'Output':
            // Output nodes reference their input
            if (node.inputs && node.inputs.length > 0) {
                return [node.inputs[0]];
            }
            return [''];
        case 'Include':
            // Create an include rule
            return { $include: node.name };
        case 'SetVariable':
            // Variable setting doesn't produce content directly
            return [''];
        case 'GetVariable':
            // Create a reference to the variable
            return [`$${node.key}`];
        default:
            // For unknown node types, return empty
            return [''];
    }
}
/**
 * Validates a GeneratorBundle against the schema
 * @param bundle The bundle to validate
 * @returns True if valid, false otherwise
 */
export function validateGeneratorBundle(bundle) {
    try {
        GeneratorBundleSchema.parse(bundle);
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Converts a GeneratorBundle back to a Graph format
 * @param bundle GeneratorBundle to convert
 * @returns Graph compatible with the editor
 */
export function bundleToGraph(bundle) {
    // Validate the bundle first
    if (!validateGeneratorBundle(bundle)) {
        throw new Error('Invalid GeneratorBundle format');
    }
    // Initialize the graph structure
    const graph = {
        nodes: [],
        seed: bundle.seed
    };
    // Track created nodes by ID to avoid duplicates
    const createdNodeIds = new Set();
    // Process variables first
    Object.entries(bundle.variables).forEach(([key, value]) => {
        const nodeId = `var_${key}`;
        graph.nodes.push({
            id: nodeId,
            type: 'SetVariable',
            key,
            value
        });
        createdNodeIds.add(nodeId);
    });
    // Process grammar rules
    Object.entries(bundle.grammar).forEach(([ruleId, rule]) => {
        // Skip if we already created this node (from variables)
        if (createdNodeIds.has(ruleId))
            return;
        const node = convertRuleToNode(ruleId, rule);
        if (node) {
            graph.nodes.push(node);
            createdNodeIds.add(ruleId);
        }
    });
    // Process connections between nodes
    Object.entries(bundle.grammar).forEach(([ruleId, rule]) => {
        // Find referenced nodes and establish connections
        const references = findNodeReferences(rule);
        if (references.length > 0) {
            const node = graph.nodes.find(n => n.id === ruleId);
            if (node) {
                node.inputs = references;
            }
        }
    });
    // Ensure at least one output node exists
    ensureOutputNode(graph, bundle.entry_points.default);
    return graph;
}
/**
 * Converts a grammar rule to a node in the graph
 */
function convertRuleToNode(id, rule) {
    // Handle weighted array rule (WeightedChoice)
    if (Array.isArray(rule) && rule.length > 0 && typeof rule[0] === 'object' && 'text' in rule[0]) {
        return {
            id,
            type: 'WeightedChoice',
            choices: rule.map(item => ({
                value: item.text,
                weight: item.weight || 1
            }))
        };
    }
    // Handle simple array rule (can be Output or Include depending on content)
    if (Array.isArray(rule) && rule.length > 0 && typeof rule[0] === 'string') {
        return {
            id,
            type: 'Output'
        };
    }
    // Handle include rule
    if (!Array.isArray(rule) && typeof rule === 'object' && '$include' in rule) {
        return {
            id,
            type: 'Include',
            name: rule.$include
        };
    }
    // Handle sequential rule (Concat)
    if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'sequential') {
        return {
            id,
            type: 'Concat'
        };
    }
    // Handle conditional rule
    if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'conditional') {
        // For now, convert conditionals to weighted choices as a simplification
        return {
            id,
            type: 'WeightedChoice',
            choices: rule.cases.map((c) => ({
                value: c.value,
                weight: 1 // Equal weights as a default
            }))
        };
    }
    // Handle modifier chain (simplify to concat for now)
    if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'modifier_chain') {
        return {
            id,
            type: 'Concat'
        };
    }
    // Unknown rule type
    console.warn(`Unsupported rule type for ID ${id}:`, rule);
    return null;
}
/**
 * Find references to other nodes in a rule
 */
function findNodeReferences(rule) {
    const refs = [];
    // Handle sequential rule
    if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'sequential') {
        return rule.items || [];
    }
    // Handle array rule that references other rules
    if (Array.isArray(rule)) {
        rule.forEach(item => {
            if (typeof item === 'string' && !item.startsWith('$')) {
                refs.push(item);
            }
        });
    }
    // Handle modifier chain
    if (!Array.isArray(rule) && typeof rule === 'object' && rule.type === 'modifier_chain') {
        if (rule.base)
            refs.push(rule.base);
    }
    return refs;
}
/**
 * Ensures that at least one output node exists for the entry point
 */
function ensureOutputNode(graph, entryPointId) {
    // Check if entry point exists as a node
    const entryExists = graph.nodes.some(n => n.id === entryPointId);
    if (!entryExists) {
        // Create a default output node
        graph.nodes.push({
            id: entryPointId,
            type: 'Output'
        });
    }
    else {
        // If node exists but isn't an output, add an output node that references it
        const isOutput = graph.nodes.some(n => n.id === entryPointId && n.type === 'Output');
        if (!isOutput) {
            const outputId = `output_${entryPointId}`;
            graph.nodes.push({
                id: outputId,
                type: 'Output',
                inputs: [entryPointId]
            });
        }
    }
    // Make sure at least one output node exists in the graph
    const hasOutput = graph.nodes.some(n => n.type === 'Output');
    if (!hasOutput) {
        graph.nodes.push({
            id: 'default_output',
            type: 'Output'
        });
    }
}
export async function exportResults(request) {
    const { format, data, options, filename } = request;
    switch (format) {
        case 'fountain':
            return exportFountainScript(data, options);
        case 'final-draft':
            return exportFinalDraftScript(data, options);
        case 'controlnet-json':
            return exportControlNetJSON(data, options);
        case 'stable-diffusion':
            return exportStableDiffusionBundle(data, options);
        case 'scene-data':
            return exportSceneData(data, options);
        case 'csv-analysis':
            return exportCSVAnalysis(data, options);
        case 'json-complete':
            return exportCompleteJSON(data, options);
        case 'professional-report':
            return exportProfessionalReport(data, options);
        case 'creative-brief':
            return exportCreativeBrief(data, options);
        case 'hybrid-prompting':
            return exportHybridPrompting(data, options);
        case 'mars-framework':
            return exportMARSFramework(data, options);
        case 'zada-natural':
            return exportZadaNaturalLanguage(data, options);
        case 'shared-graph':
            return exportSharedGraph(data, options);
        case 'collaboration':
            return exportCollaborationFormat(data, options);
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}
// Fountain Script Export
function exportFountainScript(data, options) {
    const { results } = data;
    let fountainContent = `Title: Generated Script
Author: PromptScape
Date: ${new Date().toLocaleDateString()}

FADE IN:

`;
    results.forEach((result, index) => {
        if (result.output) {
            fountainContent += `INT. SCENE ${index + 1} - DAY\n\n`;
            fountainContent += `${result.output}\n\n`;
            if (options.filmOptions?.includeDirectorNotes) {
                fountainContent += `[[Director's Note: Generated with seed ${result.seed}]]\n\n`;
            }
        }
    });
    fountainContent += 'FADE OUT.\n\nTHE END';
    return {
        type: 'text',
        data: fountainContent,
        mimeType: 'text/plain',
        shouldDownload: true
    };
}
// Final Draft Export
function exportFinalDraftScript(data, options) {
    const { results } = data;
    // Simplified Final Draft XML structure
    let fdxContent = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
`;
    results.forEach((result, index) => {
        if (result.output) {
            fdxContent += `    <Paragraph Type="Scene Heading">
      <Text>INT. SCENE ${index + 1} - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>${escapeXml(result.output)}</Text>
    </Paragraph>
`;
            if (options.filmOptions?.includeDirectorNotes) {
                fdxContent += `    <Paragraph Type="General">
      <Text>[[Director's Note: Generated with seed ${result.seed}]]</Text>
    </Paragraph>
`;
            }
        }
    });
    fdxContent += `  </Content>
</FinalDraft>`;
    return {
        type: 'text',
        data: fdxContent,
        mimeType: 'application/xml',
        shouldDownload: true
    };
}
// ControlNet JSON Export
function exportControlNetJSON(data, options) {
    const { results, vfxData } = data;
    const controlNetData = {
        version: '1.0.0',
        format: 'controlnet-compatible',
        pipeline: vfxData?.pipeline || 'stable-diffusion',
        resolution: vfxData?.resolution || [1920, 1080],
        prompts: results.map((result) => ({
            seed: result.seed,
            prompt: result.output || '',
            negative_prompt: '',
            steps: 20,
            cfg_scale: 7.0,
            sampler_name: 'DPM++ 2M Karras',
            controlnet: {
                enabled: true,
                module: 'canny',
                model: 'control_canny',
                weight: 1.0,
                guidance_start: 0.0,
                guidance_end: 1.0,
                resize_mode: 'Crop and Resize',
                lowvram: false,
                processor_res: 512,
                threshold_a: 100,
                threshold_b: 200
            },
            metadata: result.metadata || {}
        })),
        exportedAt: new Date().toISOString()
    };
    return {
        type: 'text',
        data: JSON.stringify(controlNetData, null, 2),
        mimeType: 'application/json',
        shouldDownload: true
    };
}
// Stable Diffusion Bundle Export
function exportStableDiffusionBundle(data, options) {
    // This would create a ZIP bundle with multiple files
    // For now, return JSON structure that client can handle
    const bundleData = {
        type: 'stable-diffusion-bundle',
        contents: {
            'prompts.txt': data.results.map((r) => r.output).join('\n\n---\n\n'),
            'settings.json': {
                pipeline: data.vfxData?.pipeline,
                resolution: data.vfxData?.resolution,
                exportOptions: options
            },
            'metadata.json': {
                exportedAt: new Date().toISOString(),
                resultCount: data.results.length,
                source: 'PromptScape Epic 8.5'
            }
        }
    };
    return {
        type: 'binary', // Client will handle as ZIP download
        data: JSON.stringify(bundleData),
        mimeType: 'application/zip'
    };
}
// Scene Data Export
function exportSceneData(data, options) {
    const sceneData = {
        version: '1.0.0',
        format: 'scene-data',
        scenes: data.results.map((result, index) => ({
            id: `scene_${index + 1}`,
            seed: result.seed,
            prompt: result.output,
            camera: {
                position: { x: 0, y: 0, z: 5 },
                angle: { pitch: 0, yaw: 0, roll: 0 },
                fov: 70
            },
            lighting: {
                timeOfDay: 'noon',
                mood: 'cinematic'
            },
            metadata: result.metadata || {}
        })),
        exportedAt: new Date().toISOString()
    };
    return {
        type: 'text',
        data: JSON.stringify(sceneData, null, 2),
        mimeType: 'application/json',
        shouldDownload: true
    };
}
// CSV Analysis Export
function exportCSVAnalysis(data, options) {
    let csvContent = 'Seed,Output,Word Count,Character Count,Execution Time (ms)\n';
    data.results.forEach((result) => {
        const output = result.output || '';
        const wordCount = output.split(/\s+/).length;
        const charCount = output.length;
        const executionTime = result.executionTimeMs || 0;
        csvContent += `${result.seed},"${output.replace(/"/g, '""')}",${wordCount},${charCount},${executionTime}\n`;
    });
    return {
        type: 'text',
        data: csvContent,
        mimeType: 'text/csv',
        shouldDownload: true
    };
}
// Complete JSON Export
function exportCompleteJSON(data, options) {
    const completeData = {
        ...data,
        exportOptions: options,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
    };
    return {
        type: 'text',
        data: JSON.stringify(completeData, null, 2),
        mimeType: 'application/json',
        shouldDownload: true
    };
}
// Professional Report Export (would generate PDF in real implementation)
function exportProfessionalReport(data, options) {
    // For now, return structured data that client can format
    const reportData = {
        type: 'professional-report',
        title: 'PromptScape Generation Report',
        generatedAt: new Date().toISOString(),
        summary: {
            totalResults: data.results.length,
            averageWordCount: data.results.reduce((sum, r) => sum + (r.output ? r.output.split(/\s+/).length : 0), 0) / data.results.length,
            executionStats: {
                totalTime: data.results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0),
                averageTime: data.results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / data.results.length
            }
        },
        results: data.results,
        recommendations: [
            'Results show consistent generation quality',
            'Execution times are within acceptable ranges',
            'Consider A/B testing different seed ranges'
        ]
    };
    return {
        type: 'binary', // Client will format as PDF
        data: JSON.stringify(reportData),
        mimeType: 'application/pdf'
    };
}
// Creative Brief Export (would generate DOCX in real implementation)
function exportCreativeBrief(data, options) {
    const briefData = {
        type: 'creative-brief',
        title: 'Creative Brief - Generated Content',
        date: new Date().toLocaleDateString(),
        project: 'PromptScape Generation',
        overview: 'Generated content analysis and creative recommendations',
        results: data.results,
        creativeDirection: [
            'Maintain consistency across generated variants',
            'Focus on narrative coherence',
            'Consider visual storytelling opportunities'
        ],
        nextSteps: [
            'Review generated content with creative team',
            'Select strongest variants for development',
            'Prepare for production pipeline'
        ]
    };
    return {
        type: 'binary', // Client will format as DOCX
        data: JSON.stringify(briefData),
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
}
// === EPIC 8.6 TASK 7: HYBRID PROMPTING EXPORT FUNCTIONS ===
/**
 * Epic 8.6 Task 7: Hybrid Prompting Export - Combines MARS, Zada, and VFX approaches
 */
async function exportHybridPrompting(data, options) {
    const hybridService = new HybridPromptExportService();
    try {
        // Convert data to graph format for hybrid export
        const graph = {
            nodes: data.graph?.nodes || [],
            edges: data.graph?.edges || []
        };
        const executionResults = {
            finalPrompt: data.results?.[0]?.output || '',
            variables: data.variables || {},
            executionTime: data.performance?.totalTime || 0,
            nodePerformance: data.performance?.byNode || {},
            variants: data.results || []
        };
        // Generate hybrid export
        const hybridExport = await hybridService.exportHybridPrompt(graph, executionResults, {
            includeMARS: options?.includeMARS !== false,
            includeZada: options?.includeZada !== false,
            includeHollywoodProtocol: options?.includeHollywood !== false,
            quality: options?.quality || 'production',
            targetAudience: options?.targetAudience || 'mixed_crew'
        });
        return {
            type: 'text',
            data: JSON.stringify(hybridExport, null, 2),
            mimeType: 'application/json',
            shouldDownload: true
        };
    }
    catch (error) {
        // Fallback to basic hybrid structure
        const fallbackData = {
            metadata: {
                exportId: `hybrid_${Date.now()}`,
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                format: 'wild-construct-hybrid-v1'
            },
            hybridPrompting: {
                mars: {
                    framework: 'MARS-v1.0',
                    tags: 'Basic MARS structure not available - analysis service error',
                    structured: 'Structured format generation failed'
                },
                zada: {
                    approach: 'screenplay-style',
                    variants: [
                        {
                            variant_id: 'fallback-v1',
                            style: 'director_note',
                            content: `Director's Note: ${data.results?.[0]?.output || 'Generated content'}`,
                            accessibility_level: 'director',
                            human_readable_score: 8
                        }
                    ]
                },
                hollywood: {
                    protocol: 'reproducibility-v1',
                    seeds: {
                        master_seed: Date.now(),
                        component_seeds: {},
                        iteration_seeds: [Date.now()],
                        reproducibility_checksum: 'fallback',
                        version_compatibility: {
                            generator_version: '1.0.0',
                            node_version_map: {},
                            schema_version: 'wild-construct-v1'
                        }
                    }
                }
            },
            original_data: data
        };
        return {
            type: 'text',
            data: JSON.stringify(fallbackData, null, 2),
            mimeType: 'application/json',
            shouldDownload: true
        };
    }
}
/**
 * Epic 8.6 Task 7: MARS Framework Export - VFX Professional Format
 */
async function exportMARSFramework(data, options) {
    const hybridService = new HybridPromptExportService();
    try {
        const graph = {
            nodes: data.graph?.nodes || [],
            edges: data.graph?.edges || []
        };
        const executionResults = {
            finalPrompt: data.results?.[0]?.output || '',
            variables: data.variables || {},
            executionTime: data.performance?.totalTime || 0
        };
        // Generate hybrid export and extract MARS data
        const hybridExport = await hybridService.exportHybridPrompt(graph, executionResults);
        const marsData = hybridExport.hybridPrompting.mars;
        // Create MARS-focused export
        const marsExport = {
            format: 'MARS-VFX-Framework-v1.0',
            timestamp: new Date().toISOString(),
            // MARS Tagged Prompt
            mars_prompt: marsData.structured.raw_mars,
            // Structured MARS Sections
            camera: {
                tag: `[CAM:${marsData.tags.CAM.shot_type}:${marsData.tags.CAM.angle}:${marsData.tags.CAM.movement}:${marsData.tags.CAM.lens}]`,
                breakdown: {
                    shot_type: marsData.tags.CAM.shot_type,
                    angle: marsData.tags.CAM.angle,
                    movement: marsData.tags.CAM.movement,
                    lens: marsData.tags.CAM.lens,
                    depth_of_field: marsData.tags.CAM.depth_of_field
                }
            },
            subject: {
                tag: `[SUBJ:${marsData.tags.SUBJ.primary}:${marsData.tags.SUBJ.emotion}:${marsData.tags.SUBJ.blocking}]`,
                breakdown: {
                    primary: marsData.tags.SUBJ.primary,
                    secondary: marsData.tags.SUBJ.secondary,
                    interaction: marsData.tags.SUBJ.interaction,
                    emotion: marsData.tags.SUBJ.emotion,
                    blocking: marsData.tags.SUBJ.blocking
                }
            },
            effects: {
                tag: `[FX:${marsData.tags.FX.lighting}:${marsData.tags.FX.color_grade}:${marsData.tags.FX.atmosphere}]`,
                breakdown: {
                    lighting: marsData.tags.FX.lighting,
                    color_grade: marsData.tags.FX.color_grade,
                    atmosphere: marsData.tags.FX.atmosphere,
                    special_fx: marsData.tags.FX.special_fx,
                    post_processing: marsData.tags.FX.post_processing
                }
            },
            focal: {
                tag: `!FOCAL[${marsData.tags.FOCAL.primary_focus}]`,
                breakdown: {
                    primary_focus: marsData.tags.FOCAL.primary_focus,
                    secondary_focus: marsData.tags.FOCAL.secondary_focus,
                    background_treatment: marsData.tags.FOCAL.background_treatment,
                    visual_hierarchy: marsData.tags.FOCAL.visual_hierarchy
                }
            },
            // ControlNet Integration
            controlnet_mapping: marsData.structured.controlnet_mapping,
            // VFX Professional Notes
            vfx_notes: {
                pipeline_integration: 'Use MARS tags for automated VFX parameter extraction',
                controlnet_workflow: 'Map pose_guidance for character animation, depth_hints for 3D integration',
                recommended_tools: ['ControlNet', 'Stable Diffusion', 'Midjourney', 'DALL-E'],
                technical_requirements: 'Ensure pose data matches character rig, depth maps align with scene geometry'
            },
            // Original prompt for reference
            original_prompt: data.results?.[0]?.output || '',
            variables_used: data.variables || {}
        };
        return {
            type: 'text',
            data: JSON.stringify(marsExport, null, 2),
            mimeType: 'application/json',
            shouldDownload: true
        };
    }
    catch (error) {
        // Fallback MARS format
        const fallbackMARS = {
            format: 'MARS-VFX-Framework-v1.0-fallback',
            timestamp: new Date().toISOString(),
            mars_prompt: '[CAM:MS:eye:static:50mm] [SUBJ:character:neutral:center] [FX:natural:neutral:clear] !FOCAL[character]',
            original_prompt: data.results?.[0]?.output || '',
            error: 'MARS analysis service unavailable, using fallback structure',
            vfx_notes: {
                note: 'This is a fallback MARS structure. For full analysis, please retry when services are available.'
            }
        };
        return {
            type: 'text',
            data: JSON.stringify(fallbackMARS, null, 2),
            mimeType: 'application/json',
            shouldDownload: true
        };
    }
}
/**
 * Epic 8.6 Task 7: Zada Natural Language Export - Director-Friendly Format
 */
async function exportZadaNaturalLanguage(data, options) {
    const hybridService = new HybridPromptExportService();
    try {
        const graph = {
            nodes: data.graph?.nodes || [],
            edges: data.graph?.edges || []
        };
        const executionResults = {
            finalPrompt: data.results?.[0]?.output || '',
            variables: data.variables || {},
            executionTime: data.performance?.totalTime || 0
        };
        // Generate hybrid export and extract Zada data
        const hybridExport = await hybridService.exportHybridPrompt(graph, executionResults);
        const zadaData = hybridExport.hybridPrompting.zada;
        // Create Zada-focused export
        const zadaExport = {
            format: 'Zada-Natural-Language-v1.0',
            approach: 'Screenplay-Style Director Accessibility',
            timestamp: new Date().toISOString(),
            // Director-Accessible Main Content
            director_friendly: {
                screenplay_style: zadaData.director_friendly.screenplay_style,
                shot_description: zadaData.director_friendly.shot_description,
                mood_direction: zadaData.director_friendly.mood_direction,
                reference_notes: zadaData.director_friendly.reference_notes
            },
            // Multiple Natural Language Variants
            variants: zadaData.variants.map(variant => ({
                id: variant.variant_id,
                style: variant.style,
                accessibility_level: variant.accessibility_level,
                human_readable_score: variant.human_readable_score,
                content: variant.content
            })),
            // Crew-Specific Notes
            crew_directions: zadaData.director_friendly.crew_notes,
            // Creative Context
            creative_context: {
                original_prompt: data.results?.[0]?.output || '',
                variables_context: data.variables || {},
                accessibility_focus: 'Converts technical prompts into natural, director-friendly language',
                target_audience: options?.targetAudience || 'Creative team members without technical AI background'
            },
            // Usage Guidelines
            usage_notes: {
                director_workflow: 'Use screenplay_style for storyboard discussions',
                crew_communication: 'Share variants with different crew members based on accessibility_level',
                iteration_process: 'Modify mood_direction and reference_notes for creative iterations',
                technical_bridge: 'Use alongside MARS framework for complete VFX pipeline integration'
            }
        };
        // Format as readable document
        const readableContent = `# Director-Friendly Content Generation

## Screenplay Format
${zadaData.director_friendly.screenplay_style}

## Shot Description
${zadaData.director_friendly.shot_description}

## Mood & Direction
${zadaData.director_friendly.mood_direction}

## Reference Notes
${zadaData.director_friendly.reference_notes}

## Crew Notes

### Cinematographer
${zadaData.director_friendly.crew_notes.cinematographer}

### Lighting Director
${zadaData.director_friendly.crew_notes.lighting_director}

### VFX Supervisor
${zadaData.director_friendly.crew_notes.vfx_supervisor}

---

Generated by Wild Construct Prompt System | ${new Date().toLocaleDateString()}
`;
        if (options?.format === 'markdown') {
            return {
                type: 'text',
                data: readableContent,
                mimeType: 'text/markdown',
                shouldDownload: true
            };
        }
        else {
            return {
                type: 'text',
                data: JSON.stringify(zadaExport, null, 2),
                mimeType: 'application/json',
                shouldDownload: true
            };
        }
    }
    catch (error) {
        // Fallback Zada format
        const originalPrompt = data.results?.[0]?.output || '';
        const fallbackZada = {
            format: 'Zada-Natural-Language-v1.0-fallback',
            timestamp: new Date().toISOString(),
            director_friendly: {
                screenplay_style: `FADE IN:\n\nINT. SCENE - DAY\n\n${originalPrompt}\n\nThe shot captures the essence of the described scene with natural, cinematic quality.`,
                shot_description: 'Natural shot featuring the described elements with professional cinematic composition',
                mood_direction: 'Create an authentic, engaging atmosphere that serves the story',
                reference_notes: 'Focus on natural lighting and authentic character moments'
            },
            variants: [
                {
                    id: 'fallback-screenplay',
                    style: 'screenplay',
                    accessibility_level: 'director',
                    human_readable_score: 8,
                    content: `A screenplay-style interpretation of: ${originalPrompt}`
                }
            ],
            error: 'Zada natural language generation service unavailable, using fallback structure',
            original_prompt: originalPrompt
        };
        return {
            type: 'text',
            data: JSON.stringify(fallbackZada, null, 2),
            mimeType: 'application/json',
            shouldDownload: true
        };
    }
}
/**
 * Epic 8.7 Task 5: Shared Graph Export Functions
 */
/**
 * Export graph in sharing format with all annotations
 */
async function exportSharedGraph(data, options) {
    const graphSharingService = new GraphSharingService();
    try {
        // Extract graph data
        const nodes = data.graph?.nodes || [];
        const edges = data.graph?.edges || [];
        const annotations = data.annotations || {};
        // Prepare sharing options
        const sharingOptions = {
            includeHistory: options?.includeHistory ?? true,
            includeComments: options?.includeComments ?? true,
            permissions: options?.permissions || 'read_only',
            author: {
                id: options?.authorId || 'anonymous',
                name: options?.authorName || 'Anonymous User',
                email: options?.authorEmail
            }
        };
        // Prepare metadata
        const metadata = {
            title: options?.title || 'Shared Graph',
            description: options?.description || 'Graph shared via Wild Construct',
            versionControl: {
                tags: options?.tags || [],
                branch: options?.branch || 'main'
            }
        };
        // Create shared graph
        const sharedGraph = await graphSharingService.exportForSharing(nodes, edges, annotations, metadata, sharingOptions);
        return {
            type: 'text',
            data: JSON.stringify(sharedGraph, null, 2),
            mimeType: 'application/json',
            shouldDownload: true,
            filename: `shared-graph-${sharedGraph.metadata.exportId}.json`
        };
    }
    catch (error) {
        // Fallback shared format
        const fallbackSharedGraph = {
            metadata: {
                exportId: `fallback_${Date.now()}`,
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                title: options?.title || 'Shared Graph (Fallback)',
                author: {
                    id: 'fallback',
                    name: 'Unknown'
                },
                versionControl: {
                    version: 1,
                    changes: ['Fallback export due to service error'],
                    tags: []
                },
                sharing: {
                    permissions: 'read_only',
                    collaborators: []
                }
            },
            graph: {
                nodes: data.graph?.nodes || [],
                edges: data.graph?.edges || [],
                settings: {
                    canvasPosition: { x: 0, y: 0, zoom: 1 },
                    readonly: true
                }
            },
            annotations: {
                connectionLabels: [],
                stickyNotes: [],
                nodeLabels: [],
                regions: [],
                comments: []
            },
            collaboration: {
                changeHistory: [],
                conflicts: [],
                lastSync: new Date().toISOString(),
                syncStatus: 'offline'
            },
            compatibility: {
                minVersion: '1.0.0',
                features: ['basic-sharing'],
                warnings: ['Generated in fallback mode due to service error'],
                errors: [error instanceof Error ? error.message : 'Unknown error']
            },
            error: 'Sharing service unavailable, using fallback format'
        };
        return {
            type: 'text',
            data: JSON.stringify(fallbackSharedGraph, null, 2),
            mimeType: 'application/json',
            shouldDownload: true,
            filename: 'shared-graph-fallback.json'
        };
    }
}
/**
 * Export in collaboration format with version control
 */
async function exportCollaborationFormat(data, options) {
    const graphSharingService = new GraphSharingService();
    try {
        // Create full collaboration export
        const nodes = data.graph?.nodes || [];
        const edges = data.graph?.edges || [];
        const annotations = {
            stickyNotes: data.annotations?.stickyNotes || [],
            connectionLabels: extractConnectionLabels(edges),
            nodeLabels: extractNodeLabels(nodes),
            regions: data.annotations?.regions || [],
            comments: data.annotations?.comments || []
        };
        const sharedGraph = await graphSharingService.exportForSharing(nodes, edges, annotations, {
            title: options?.title || 'Collaboration Graph',
            description: options?.description || 'Graph prepared for team collaboration',
            versionControl: {
                tags: ['collaboration', ...(options?.tags || [])],
                branch: options?.branch || 'collaboration'
            }
        }, {
            includeHistory: true,
            includeComments: true,
            permissions: options?.permissions || 'collaborative',
            author: {
                id: options?.authorId || 'collaborator',
                name: options?.authorName || 'Team Member',
                email: options?.authorEmail
            }
        });
        // Enhanced collaboration metadata
        const collaborationExport = {
            ...sharedGraph,
            collaborationFeatures: {
                realTimeSync: true,
                conflictResolution: true,
                versionControl: true,
                commentSystem: true,
                permissionManagement: true,
                changeTracking: true
            },
            usage: {
                importInstructions: 'Use Wild Construct import function or share URL',
                supportedClients: ['Wild Construct Web', 'Wild Construct Desktop'],
                apiVersion: '1.0.0'
            }
        };
        return {
            type: 'text',
            data: JSON.stringify(collaborationExport, null, 2),
            mimeType: 'application/json',
            shouldDownload: true,
            filename: `collaboration-${sharedGraph.metadata.exportId}.json`
        };
    }
    catch (error) {
        // Fallback collaboration format
        const fallbackFormat = {
            metadata: {
                exportId: `collab_fallback_${Date.now()}`,
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                title: options?.title || 'Collaboration Export (Fallback)',
                format: 'collaboration-fallback'
            },
            graph: data.graph || { nodes: [], edges: [] },
            collaborationFeatures: {
                realTimeSync: false,
                conflictResolution: false,
                versionControl: false,
                commentSystem: false,
                permissionManagement: false,
                changeTracking: false,
                fallbackMode: true
            },
            error: error instanceof Error ? error.message : 'Collaboration service unavailable'
        };
        return {
            type: 'text',
            data: JSON.stringify(fallbackFormat, null, 2),
            mimeType: 'application/json',
            shouldDownload: true,
            filename: 'collaboration-fallback.json'
        };
    }
}
/**
 * Extract connection labels from edges
 */
function extractConnectionLabels(edges) {
    return edges
        .filter(edge => edge.label && edge.label.trim().length > 0)
        .map(edge => ({
        edgeId: edge.id,
        label: edge.label,
        style: edge.labelStyle,
        position: {
            type: edge.labelPosition,
            offset: edge.labelOffset
        },
        visible: edge.showLabel ?? true
    }));
}
/**
 * Extract node labels and annotations
 */
function extractNodeLabels(nodes) {
    return nodes.map(node => ({
        nodeId: node.id,
        label: node.data?.label,
        description: node.data?.description,
        tags: Array.isArray(node.data?.tags) ? node.data.tags : [],
        color: node.data?.color,
        notes: node.data?.notes
    })).filter(label => label.label || label.description || label.tags.length > 0 || label.notes);
}
// Utility function to escape XML content
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
