// Extracted schema definitions from exporter.ts
import { z } from 'zod';

/**
 * Epic 8.6: Enhanced VFX/ControlNet parameter structures
 */
export const ControlNetParametersSchema = z.object({
  poseGuidance: z
    .object({
      enabled: z.boolean().default(false),
      strength: z.number().min(0).max(2).default(1.0),
      startStep: z.number().min(0).max(1000).default(0),
      endStep: z.number().min(0).max(1000).default(1000),
      keypoints: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
            confidence: z.number().min(0).max(1)
          })
        )
        .optional()
    })
    .optional(),
  depthMaps: z
    .object({
      enabled: z.boolean().default(false),
      strength: z.number().min(0).max(2).default(1.0),
      preprocessor: z
        .enum(['depth_midas', 'depth_zoe', 'depth_leres'])
        .default('depth_midas')
    })
    .optional(),
  edgeDetection: z
    .object({
      enabled: z.boolean().default(false),
      strength: z.number().min(0).max(2).default(1.0),
      preprocessor: z
        .enum(['canny', 'hed', 'scribble', 'pidinet'])
        .default('canny'),
      lowThreshold: z.number().min(0).max(255).default(100),
      highThreshold: z.number().min(0).max(255).default(200)
    })
    .optional(),
  animationSequence: z
    .object({
      frameCount: z.number().min(1).max(10000).default(1),
      fps: z.number().min(1).max(60).default(24),
      interpolationMethod: z
        .enum(['linear', 'cubic', 'bezier'])
        .default('linear'),
      keyframes: z
        .array(
          z.object({
            frame: z.number(),
            parameters: z.record(z.string(), z.unknown())
          })
        )
        .default([])
    })
    .optional(),
  cameraParameters: z
    .object({
      fov: z.number().min(1).max(180).default(70),
      aspectRatio: z.number().min(0.1).max(10).default(1.777), // 16:9
      nearPlane: z.number().min(0.001).max(1000).default(0.1),
      farPlane: z.number().min(1).max(10000).default(1000),
      position: z
        .tuple([z.number(), z.number(), z.number()])
        .default([0, 0, 5]),
      rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0])
    })
    .optional(),
  billboardProjection: z
    .object({
      enabled: z.boolean().default(false),
      targetResolution: z.tuple([z.number(), z.number()]).default([1920, 1080]),
      projectionMatrix: z.array(z.number()).length(16).optional() // 4x4 matrix
    })
    .optional()
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
    lens: z
      .object({
        focalLength: z.number().min(10).max(500).default(50), // mm
        aperture: z.number().min(1).max(22).default(2.8), // f-stop
        focusDistance: z.number().min(0.1).max(1000).default(10) // meters
      })
      .optional(),
    movement: z
      .object({
        type: z
          .enum(['static', 'pan', 'tilt', 'dolly', 'crane', 'handheld'])
          .default('static'),
        speed: z.enum(['slow', 'medium', 'fast']).default('medium'),
        smoothness: z.number().min(0).max(1).default(0.8)
      })
      .optional()
  }),
  lighting: z.object({
    timeOfDay: z
      .enum([
        'dawn',
        'morning',
        'noon',
        'afternoon',
        'dusk',
        'night',
        'golden-hour',
        'blue-hour'
      ])
      .default('noon'),
    weather: z
      .enum([
        'clear',
        'cloudy',
        'overcast',
        'foggy',
        'rainy',
        'stormy',
        'snowy'
      ])
      .default('clear'),
    mood: z
      .enum([
        'bright',
        'dramatic',
        'soft',
        'harsh',
        'moody',
        'ethereal',
        'cinematic'
      ])
      .default('bright'),
    keyLight: z
      .object({
        intensity: z.number().min(0).max(2).default(1.0),
        color: z.string().default('#FFFFFF'),
        angle: z.number().min(0).max(360).default(45)
      })
      .optional(),
    fillLight: z
      .object({
        intensity: z.number().min(0).max(1).default(0.5),
        color: z.string().default('#FFFFFF')
      })
      .optional(),
    rimLight: z
      .object({
        intensity: z.number().min(0).max(1).default(0.3),
        color: z.string().default('#FFFFFF')
      })
      .optional()
  }),
  atmosphere: z
    .object({
      fogDensity: z.number().min(0).max(1).default(0),
      fogColor: z.string().default('#FFFFFF'),
      particleEffects: z
        .enum(['none', 'dust', 'rain', 'snow', 'smoke'])
        .default('none'),
      windStrength: z.number().min(0).max(1).default(0),
      windDirection: z.number().min(0).max(360).default(0)
    })
    .optional(),
  postProcessing: z
    .object({
      colorGrading: z
        .enum(['none', 'warm', 'cool', 'vintage', 'noir', 'bleach-bypass'])
        .default('none'),
      vignette: z.number().min(0).max(1).default(0),
      chromatic: z.number().min(0).max(1).default(0),
      grain: z.number().min(0).max(1).default(0),
      blur: z.number().min(0).max(1).default(0)
    })
    .optional()
});

/**
 * Generator Bundle Schema - Core export format
 */
export const GeneratorBundleSchema = z.object({
  version: z.string(),
  metadata: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      author: z.string().optional(),
      created: z.string().optional(),
      modified: z.string().optional(),
      tags: z.array(z.string()).optional(),
      category: z.string().optional()
    })
    .optional(),
  entryPoint: z.string(),
  rules: z.record(z.string(), z.record(z.string(), z.unknown())),
  controlNet: ControlNetParametersSchema.optional(),
  sceneData: SceneDataSchema.optional()
});

export type GeneratorBundle = z.infer<typeof GeneratorBundleSchema>;
export type ControlNetParameters = z.infer<typeof ControlNetParametersSchema>;
export type SceneData = z.infer<typeof SceneDataSchema>;
