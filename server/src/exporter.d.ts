import { z } from 'zod';
import { Graph } from '../../packages/core/graphSchema';
/**
 * Epic 8.6: Enhanced VFX/ControlNet parameter structures
 */
export declare const ControlNetParametersSchema: z.ZodObject<{
    poseGuidance: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        strength: z.ZodDefault<z.ZodNumber>;
        startStep: z.ZodDefault<z.ZodNumber>;
        endStep: z.ZodDefault<z.ZodNumber>;
        keypoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            confidence: number;
        }, {
            x: number;
            y: number;
            confidence: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        strength: number;
        startStep: number;
        endStep: number;
        keypoints?: {
            x: number;
            y: number;
            confidence: number;
        }[] | undefined;
    }, {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        startStep?: number | undefined;
        endStep?: number | undefined;
        keypoints?: {
            x: number;
            y: number;
            confidence: number;
        }[] | undefined;
    }>>;
    depthMaps: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        strength: z.ZodDefault<z.ZodNumber>;
        preprocessor: z.ZodDefault<z.ZodEnum<["depth_midas", "depth_zoe", "depth_leres"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        strength: number;
        preprocessor: "depth_midas" | "depth_zoe" | "depth_leres";
    }, {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        preprocessor?: "depth_midas" | "depth_zoe" | "depth_leres" | undefined;
    }>>;
    edgeDetection: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        strength: z.ZodDefault<z.ZodNumber>;
        preprocessor: z.ZodDefault<z.ZodEnum<["canny", "hed", "scribble", "pidinet"]>>;
        lowThreshold: z.ZodDefault<z.ZodNumber>;
        highThreshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        strength: number;
        preprocessor: "canny" | "hed" | "scribble" | "pidinet";
        lowThreshold: number;
        highThreshold: number;
    }, {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        preprocessor?: "canny" | "hed" | "scribble" | "pidinet" | undefined;
        lowThreshold?: number | undefined;
        highThreshold?: number | undefined;
    }>>;
    animationSequence: z.ZodOptional<z.ZodObject<{
        frameCount: z.ZodDefault<z.ZodNumber>;
        fps: z.ZodDefault<z.ZodNumber>;
        interpolationMethod: z.ZodDefault<z.ZodEnum<["linear", "cubic", "bezier"]>>;
        keyframes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            frame: z.ZodNumber;
            parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            parameters: Record<string, unknown>;
            frame: number;
        }, {
            parameters: Record<string, unknown>;
            frame: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        frameCount: number;
        fps: number;
        interpolationMethod: "linear" | "cubic" | "bezier";
        keyframes: {
            parameters: Record<string, unknown>;
            frame: number;
        }[];
    }, {
        frameCount?: number | undefined;
        fps?: number | undefined;
        interpolationMethod?: "linear" | "cubic" | "bezier" | undefined;
        keyframes?: {
            parameters: Record<string, unknown>;
            frame: number;
        }[] | undefined;
    }>>;
    cameraParameters: z.ZodOptional<z.ZodObject<{
        fov: z.ZodDefault<z.ZodNumber>;
        aspectRatio: z.ZodDefault<z.ZodNumber>;
        nearPlane: z.ZodDefault<z.ZodNumber>;
        farPlane: z.ZodDefault<z.ZodNumber>;
        position: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        rotation: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
    }, "strip", z.ZodTypeAny, {
        position: [number, number, number];
        fov: number;
        aspectRatio: number;
        nearPlane: number;
        farPlane: number;
        rotation: [number, number, number];
    }, {
        position?: [number, number, number] | undefined;
        fov?: number | undefined;
        aspectRatio?: number | undefined;
        nearPlane?: number | undefined;
        farPlane?: number | undefined;
        rotation?: [number, number, number] | undefined;
    }>>;
    billboardProjection: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        targetResolution: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        projectionMatrix: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        targetResolution: [number, number];
        projectionMatrix?: number[] | undefined;
    }, {
        enabled?: boolean | undefined;
        targetResolution?: [number, number] | undefined;
        projectionMatrix?: number[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    poseGuidance?: {
        enabled: boolean;
        strength: number;
        startStep: number;
        endStep: number;
        keypoints?: {
            x: number;
            y: number;
            confidence: number;
        }[] | undefined;
    } | undefined;
    depthMaps?: {
        enabled: boolean;
        strength: number;
        preprocessor: "depth_midas" | "depth_zoe" | "depth_leres";
    } | undefined;
    edgeDetection?: {
        enabled: boolean;
        strength: number;
        preprocessor: "canny" | "hed" | "scribble" | "pidinet";
        lowThreshold: number;
        highThreshold: number;
    } | undefined;
    animationSequence?: {
        frameCount: number;
        fps: number;
        interpolationMethod: "linear" | "cubic" | "bezier";
        keyframes: {
            parameters: Record<string, unknown>;
            frame: number;
        }[];
    } | undefined;
    cameraParameters?: {
        position: [number, number, number];
        fov: number;
        aspectRatio: number;
        nearPlane: number;
        farPlane: number;
        rotation: [number, number, number];
    } | undefined;
    billboardProjection?: {
        enabled: boolean;
        targetResolution: [number, number];
        projectionMatrix?: number[] | undefined;
    } | undefined;
}, {
    poseGuidance?: {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        startStep?: number | undefined;
        endStep?: number | undefined;
        keypoints?: {
            x: number;
            y: number;
            confidence: number;
        }[] | undefined;
    } | undefined;
    depthMaps?: {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        preprocessor?: "depth_midas" | "depth_zoe" | "depth_leres" | undefined;
    } | undefined;
    edgeDetection?: {
        enabled?: boolean | undefined;
        strength?: number | undefined;
        preprocessor?: "canny" | "hed" | "scribble" | "pidinet" | undefined;
        lowThreshold?: number | undefined;
        highThreshold?: number | undefined;
    } | undefined;
    animationSequence?: {
        frameCount?: number | undefined;
        fps?: number | undefined;
        interpolationMethod?: "linear" | "cubic" | "bezier" | undefined;
        keyframes?: {
            parameters: Record<string, unknown>;
            frame: number;
        }[] | undefined;
    } | undefined;
    cameraParameters?: {
        position?: [number, number, number] | undefined;
        fov?: number | undefined;
        aspectRatio?: number | undefined;
        nearPlane?: number | undefined;
        farPlane?: number | undefined;
        rotation?: [number, number, number] | undefined;
    } | undefined;
    billboardProjection?: {
        enabled?: boolean | undefined;
        targetResolution?: [number, number] | undefined;
        projectionMatrix?: number[] | undefined;
    } | undefined;
}>;
/**
 * Epic 8.6 Task 3: Scene Data Integration Schema
 * Professional scene data structure for film production workflows
 */
export declare const SceneDataSchema: z.ZodObject<{
    camera: z.ZodObject<{
        position: z.ZodObject<{
            x: z.ZodDefault<z.ZodNumber>;
            y: z.ZodDefault<z.ZodNumber>;
            z: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            z?: number | undefined;
        }>;
        angle: z.ZodObject<{
            pitch: z.ZodDefault<z.ZodNumber>;
            yaw: z.ZodDefault<z.ZodNumber>;
            roll: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            pitch: number;
            yaw: number;
            roll: number;
        }, {
            pitch?: number | undefined;
            yaw?: number | undefined;
            roll?: number | undefined;
        }>;
        distance: z.ZodDefault<z.ZodNumber>;
        lens: z.ZodOptional<z.ZodObject<{
            focalLength: z.ZodDefault<z.ZodNumber>;
            aperture: z.ZodDefault<z.ZodNumber>;
            focusDistance: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            focalLength: number;
            aperture: number;
            focusDistance: number;
        }, {
            focalLength?: number | undefined;
            aperture?: number | undefined;
            focusDistance?: number | undefined;
        }>>;
        movement: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["static", "pan", "tilt", "dolly", "crane", "handheld"]>>;
            speed: z.ZodDefault<z.ZodEnum<["slow", "medium", "fast"]>>;
            smoothness: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
            speed: "medium" | "fast" | "slow";
            smoothness: number;
        }, {
            type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
            speed?: "medium" | "fast" | "slow" | undefined;
            smoothness?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        angle: {
            pitch: number;
            yaw: number;
            roll: number;
        };
        distance: number;
        movement?: {
            type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
            speed: "medium" | "fast" | "slow";
            smoothness: number;
        } | undefined;
        lens?: {
            focalLength: number;
            aperture: number;
            focusDistance: number;
        } | undefined;
    }, {
        position: {
            x?: number | undefined;
            y?: number | undefined;
            z?: number | undefined;
        };
        angle: {
            pitch?: number | undefined;
            yaw?: number | undefined;
            roll?: number | undefined;
        };
        movement?: {
            type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
            speed?: "medium" | "fast" | "slow" | undefined;
            smoothness?: number | undefined;
        } | undefined;
        distance?: number | undefined;
        lens?: {
            focalLength?: number | undefined;
            aperture?: number | undefined;
            focusDistance?: number | undefined;
        } | undefined;
    }>;
    lighting: z.ZodOptional<z.ZodObject<{
        timeOfDay: z.ZodDefault<z.ZodEnum<["dawn", "morning", "noon", "afternoon", "dusk", "night", "golden-hour", "blue-hour"]>>;
        weather: z.ZodDefault<z.ZodEnum<["clear", "cloudy", "overcast", "foggy", "rainy", "stormy", "snowy"]>>;
        mood: z.ZodDefault<z.ZodEnum<["bright", "dramatic", "soft", "harsh", "moody", "ethereal", "cinematic"]>>;
        keyLight: z.ZodOptional<z.ZodObject<{
            intensity: z.ZodDefault<z.ZodNumber>;
            temperature: z.ZodDefault<z.ZodNumber>;
            angle: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            intensity: number;
            angle: number;
            temperature: number;
        }, {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        }>>;
        fillLight: z.ZodOptional<z.ZodObject<{
            intensity: z.ZodDefault<z.ZodNumber>;
            temperature: z.ZodDefault<z.ZodNumber>;
            angle: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            intensity: number;
            angle: number;
            temperature: number;
        }, {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        mood: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal";
        weather: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy";
        timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour";
        keyLight?: {
            intensity: number;
            angle: number;
            temperature: number;
        } | undefined;
        fillLight?: {
            intensity: number;
            angle: number;
            temperature: number;
        } | undefined;
    }, {
        mood?: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal" | undefined;
        weather?: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy" | undefined;
        timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour" | undefined;
        keyLight?: {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        fillLight?: {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
    }>>;
    environment: z.ZodOptional<z.ZodObject<{
        location: z.ZodDefault<z.ZodEnum<["interior", "exterior", "studio", "practical"]>>;
        atmosphere: z.ZodDefault<z.ZodEnum<["clear", "hazy", "dusty", "smoky", "misty"]>>;
        temperature: z.ZodDefault<z.ZodNumber>;
        windSpeed: z.ZodDefault<z.ZodNumber>;
        props: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        location: "interior" | "exterior" | "studio" | "practical";
        atmosphere: "clear" | "hazy" | "dusty" | "smoky" | "misty";
        props: string[];
        temperature: number;
        windSpeed: number;
    }, {
        location?: "interior" | "exterior" | "studio" | "practical" | undefined;
        atmosphere?: "clear" | "hazy" | "dusty" | "smoky" | "misty" | undefined;
        props?: string[] | undefined;
        temperature?: number | undefined;
        windSpeed?: number | undefined;
    }>>;
    postProcessing: z.ZodOptional<z.ZodObject<{
        colorGrading: z.ZodOptional<z.ZodObject<{
            style: z.ZodDefault<z.ZodEnum<["natural", "cinematic", "vintage", "modern", "dramatic"]>>;
            contrast: z.ZodDefault<z.ZodNumber>;
            saturation: z.ZodDefault<z.ZodNumber>;
            warmth: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
            saturation: number;
            contrast: number;
            warmth: number;
        }, {
            style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
            saturation?: number | undefined;
            contrast?: number | undefined;
            warmth?: number | undefined;
        }>>;
        effects: z.ZodDefault<z.ZodArray<z.ZodEnum<["bloom", "vignette", "film-grain", "lens-flare", "depth-of-field"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        effects: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[];
        colorGrading?: {
            style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
            saturation: number;
            contrast: number;
            warmth: number;
        } | undefined;
    }, {
        colorGrading?: {
            style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
            saturation?: number | undefined;
            contrast?: number | undefined;
            warmth?: number | undefined;
        } | undefined;
        effects?: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    camera: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        angle: {
            pitch: number;
            yaw: number;
            roll: number;
        };
        distance: number;
        movement?: {
            type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
            speed: "medium" | "fast" | "slow";
            smoothness: number;
        } | undefined;
        lens?: {
            focalLength: number;
            aperture: number;
            focusDistance: number;
        } | undefined;
    };
    environment?: {
        location: "interior" | "exterior" | "studio" | "practical";
        atmosphere: "clear" | "hazy" | "dusty" | "smoky" | "misty";
        props: string[];
        temperature: number;
        windSpeed: number;
    } | undefined;
    lighting?: {
        mood: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal";
        weather: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy";
        timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour";
        keyLight?: {
            intensity: number;
            angle: number;
            temperature: number;
        } | undefined;
        fillLight?: {
            intensity: number;
            angle: number;
            temperature: number;
        } | undefined;
    } | undefined;
    postProcessing?: {
        effects: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[];
        colorGrading?: {
            style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
            saturation: number;
            contrast: number;
            warmth: number;
        } | undefined;
    } | undefined;
}, {
    camera: {
        position: {
            x?: number | undefined;
            y?: number | undefined;
            z?: number | undefined;
        };
        angle: {
            pitch?: number | undefined;
            yaw?: number | undefined;
            roll?: number | undefined;
        };
        movement?: {
            type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
            speed?: "medium" | "fast" | "slow" | undefined;
            smoothness?: number | undefined;
        } | undefined;
        distance?: number | undefined;
        lens?: {
            focalLength?: number | undefined;
            aperture?: number | undefined;
            focusDistance?: number | undefined;
        } | undefined;
    };
    environment?: {
        location?: "interior" | "exterior" | "studio" | "practical" | undefined;
        atmosphere?: "clear" | "hazy" | "dusty" | "smoky" | "misty" | undefined;
        props?: string[] | undefined;
        temperature?: number | undefined;
        windSpeed?: number | undefined;
    } | undefined;
    lighting?: {
        mood?: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal" | undefined;
        weather?: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy" | undefined;
        timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour" | undefined;
        keyLight?: {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        fillLight?: {
            intensity?: number | undefined;
            angle?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
    } | undefined;
    postProcessing?: {
        colorGrading?: {
            style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
            saturation?: number | undefined;
            contrast?: number | undefined;
            warmth?: number | undefined;
        } | undefined;
        effects?: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[] | undefined;
    } | undefined;
}>;
/**
 * GeneratorBundle schema matching the Randomizer Engine's expected format
 * Epic 8.6: Enhanced with VFX/ControlNet compatibility
 */
export declare const GeneratorBundleSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        author: z.ZodString;
        created: z.ZodString;
        debug: z.ZodOptional<z.ZodObject<{
            seed: z.ZodOptional<z.ZodNumber>;
            originGraphGuid: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        }, {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        }>>;
        vfx: z.ZodOptional<z.ZodObject<{
            exportFormat: z.ZodDefault<z.ZodLiteral<"controlnet-compatible">>;
            targetPipeline: z.ZodDefault<z.ZodEnum<["stable-diffusion", "midjourney", "dalle", "custom"]>>;
            compatibilityVersion: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            exportFormat: "controlnet-compatible";
            targetPipeline: "custom" | "stable-diffusion" | "midjourney" | "dalle";
            compatibilityVersion: string;
        }, {
            exportFormat?: "controlnet-compatible" | undefined;
            targetPipeline?: "custom" | "stable-diffusion" | "midjourney" | "dalle" | undefined;
            compatibilityVersion?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        author: string;
        created: string;
        vfx?: {
            exportFormat: "controlnet-compatible";
            targetPipeline: "custom" | "stable-diffusion" | "midjourney" | "dalle";
            compatibilityVersion: string;
        } | undefined;
        debug?: {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        } | undefined;
    }, {
        name: string;
        version: string;
        author: string;
        created: string;
        vfx?: {
            exportFormat?: "controlnet-compatible" | undefined;
            targetPipeline?: "custom" | "stable-diffusion" | "midjourney" | "dalle" | undefined;
            compatibilityVersion?: string | undefined;
        } | undefined;
        debug?: {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        } | undefined;
    }>;
    variables: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    grammar: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        weight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        weight?: number | undefined;
    }, {
        text: string;
        weight?: number | undefined;
    }>, "many">, z.ZodObject<{
        type: z.ZodLiteral<"conditional">;
        cases: z.ZodArray<z.ZodObject<{
            condition: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            condition: string;
        }, {
            value: string;
            condition: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "conditional";
        cases: {
            value: string;
            condition: string;
        }[];
    }, {
        type: "conditional";
        cases: {
            value: string;
            condition: string;
        }[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sequential">;
        items: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "sequential";
        items: string[];
    }, {
        type: "sequential";
        items: string[];
    }>, z.ZodUnion<[z.ZodObject<{
        $include: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        $include: string;
    }, {
        $include: string;
    }>, z.ZodArray<z.ZodUnion<[z.ZodObject<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        _meta?: Record<string, unknown> | undefined;
    }, {
        _meta?: Record<string, unknown> | undefined;
    }>, z.ZodObject<{
        $include: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        $include: string;
    }, {
        $include: string;
    }>]>, "many">]>, z.ZodObject<{
        type: z.ZodLiteral<"modifier_chain">;
        base: z.ZodString;
        mods: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "modifier_chain";
        base: string;
        mods: string[];
    }, {
        type: "modifier_chain";
        base: string;
        mods: string[];
    }>]>>;
    entry_points: z.ZodObject<{
        default: z.ZodString;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        default: string;
        alternatives?: string[] | undefined;
    }, {
        default: string;
        alternatives?: string[] | undefined;
    }>;
    lockedValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    seed: z.ZodOptional<z.ZodNumber>;
    controlNet: z.ZodOptional<z.ZodObject<{
        poseGuidance: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            strength: z.ZodDefault<z.ZodNumber>;
            startStep: z.ZodDefault<z.ZodNumber>;
            endStep: z.ZodDefault<z.ZodNumber>;
            keypoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                confidence: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                confidence: number;
            }, {
                x: number;
                y: number;
                confidence: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            strength: number;
            startStep: number;
            endStep: number;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        }, {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            startStep?: number | undefined;
            endStep?: number | undefined;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        }>>;
        depthMaps: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            strength: z.ZodDefault<z.ZodNumber>;
            preprocessor: z.ZodDefault<z.ZodEnum<["depth_midas", "depth_zoe", "depth_leres"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            strength: number;
            preprocessor: "depth_midas" | "depth_zoe" | "depth_leres";
        }, {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "depth_midas" | "depth_zoe" | "depth_leres" | undefined;
        }>>;
        edgeDetection: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            strength: z.ZodDefault<z.ZodNumber>;
            preprocessor: z.ZodDefault<z.ZodEnum<["canny", "hed", "scribble", "pidinet"]>>;
            lowThreshold: z.ZodDefault<z.ZodNumber>;
            highThreshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            strength: number;
            preprocessor: "canny" | "hed" | "scribble" | "pidinet";
            lowThreshold: number;
            highThreshold: number;
        }, {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "canny" | "hed" | "scribble" | "pidinet" | undefined;
            lowThreshold?: number | undefined;
            highThreshold?: number | undefined;
        }>>;
        animationSequence: z.ZodOptional<z.ZodObject<{
            frameCount: z.ZodDefault<z.ZodNumber>;
            fps: z.ZodDefault<z.ZodNumber>;
            interpolationMethod: z.ZodDefault<z.ZodEnum<["linear", "cubic", "bezier"]>>;
            keyframes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                frame: z.ZodNumber;
                parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, "strip", z.ZodTypeAny, {
                parameters: Record<string, unknown>;
                frame: number;
            }, {
                parameters: Record<string, unknown>;
                frame: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            frameCount: number;
            fps: number;
            interpolationMethod: "linear" | "cubic" | "bezier";
            keyframes: {
                parameters: Record<string, unknown>;
                frame: number;
            }[];
        }, {
            frameCount?: number | undefined;
            fps?: number | undefined;
            interpolationMethod?: "linear" | "cubic" | "bezier" | undefined;
            keyframes?: {
                parameters: Record<string, unknown>;
                frame: number;
            }[] | undefined;
        }>>;
        cameraParameters: z.ZodOptional<z.ZodObject<{
            fov: z.ZodDefault<z.ZodNumber>;
            aspectRatio: z.ZodDefault<z.ZodNumber>;
            nearPlane: z.ZodDefault<z.ZodNumber>;
            farPlane: z.ZodDefault<z.ZodNumber>;
            position: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            rotation: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        }, "strip", z.ZodTypeAny, {
            position: [number, number, number];
            fov: number;
            aspectRatio: number;
            nearPlane: number;
            farPlane: number;
            rotation: [number, number, number];
        }, {
            position?: [number, number, number] | undefined;
            fov?: number | undefined;
            aspectRatio?: number | undefined;
            nearPlane?: number | undefined;
            farPlane?: number | undefined;
            rotation?: [number, number, number] | undefined;
        }>>;
        billboardProjection: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            targetResolution: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
            projectionMatrix: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            targetResolution: [number, number];
            projectionMatrix?: number[] | undefined;
        }, {
            enabled?: boolean | undefined;
            targetResolution?: [number, number] | undefined;
            projectionMatrix?: number[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        poseGuidance?: {
            enabled: boolean;
            strength: number;
            startStep: number;
            endStep: number;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        } | undefined;
        depthMaps?: {
            enabled: boolean;
            strength: number;
            preprocessor: "depth_midas" | "depth_zoe" | "depth_leres";
        } | undefined;
        edgeDetection?: {
            enabled: boolean;
            strength: number;
            preprocessor: "canny" | "hed" | "scribble" | "pidinet";
            lowThreshold: number;
            highThreshold: number;
        } | undefined;
        animationSequence?: {
            frameCount: number;
            fps: number;
            interpolationMethod: "linear" | "cubic" | "bezier";
            keyframes: {
                parameters: Record<string, unknown>;
                frame: number;
            }[];
        } | undefined;
        cameraParameters?: {
            position: [number, number, number];
            fov: number;
            aspectRatio: number;
            nearPlane: number;
            farPlane: number;
            rotation: [number, number, number];
        } | undefined;
        billboardProjection?: {
            enabled: boolean;
            targetResolution: [number, number];
            projectionMatrix?: number[] | undefined;
        } | undefined;
    }, {
        poseGuidance?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            startStep?: number | undefined;
            endStep?: number | undefined;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        } | undefined;
        depthMaps?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "depth_midas" | "depth_zoe" | "depth_leres" | undefined;
        } | undefined;
        edgeDetection?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "canny" | "hed" | "scribble" | "pidinet" | undefined;
            lowThreshold?: number | undefined;
            highThreshold?: number | undefined;
        } | undefined;
        animationSequence?: {
            frameCount?: number | undefined;
            fps?: number | undefined;
            interpolationMethod?: "linear" | "cubic" | "bezier" | undefined;
            keyframes?: {
                parameters: Record<string, unknown>;
                frame: number;
            }[] | undefined;
        } | undefined;
        cameraParameters?: {
            position?: [number, number, number] | undefined;
            fov?: number | undefined;
            aspectRatio?: number | undefined;
            nearPlane?: number | undefined;
            farPlane?: number | undefined;
            rotation?: [number, number, number] | undefined;
        } | undefined;
        billboardProjection?: {
            enabled?: boolean | undefined;
            targetResolution?: [number, number] | undefined;
            projectionMatrix?: number[] | undefined;
        } | undefined;
    }>>;
    sceneData: z.ZodOptional<z.ZodObject<{
        camera: z.ZodObject<{
            position: z.ZodObject<{
                x: z.ZodDefault<z.ZodNumber>;
                y: z.ZodDefault<z.ZodNumber>;
                z: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
                z: number;
            }, {
                x?: number | undefined;
                y?: number | undefined;
                z?: number | undefined;
            }>;
            angle: z.ZodObject<{
                pitch: z.ZodDefault<z.ZodNumber>;
                yaw: z.ZodDefault<z.ZodNumber>;
                roll: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                pitch: number;
                yaw: number;
                roll: number;
            }, {
                pitch?: number | undefined;
                yaw?: number | undefined;
                roll?: number | undefined;
            }>;
            distance: z.ZodDefault<z.ZodNumber>;
            lens: z.ZodOptional<z.ZodObject<{
                focalLength: z.ZodDefault<z.ZodNumber>;
                aperture: z.ZodDefault<z.ZodNumber>;
                focusDistance: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                focalLength: number;
                aperture: number;
                focusDistance: number;
            }, {
                focalLength?: number | undefined;
                aperture?: number | undefined;
                focusDistance?: number | undefined;
            }>>;
            movement: z.ZodOptional<z.ZodObject<{
                type: z.ZodDefault<z.ZodEnum<["static", "pan", "tilt", "dolly", "crane", "handheld"]>>;
                speed: z.ZodDefault<z.ZodEnum<["slow", "medium", "fast"]>>;
                smoothness: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
                speed: "medium" | "fast" | "slow";
                smoothness: number;
            }, {
                type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
                speed?: "medium" | "fast" | "slow" | undefined;
                smoothness?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            position: {
                x: number;
                y: number;
                z: number;
            };
            angle: {
                pitch: number;
                yaw: number;
                roll: number;
            };
            distance: number;
            movement?: {
                type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
                speed: "medium" | "fast" | "slow";
                smoothness: number;
            } | undefined;
            lens?: {
                focalLength: number;
                aperture: number;
                focusDistance: number;
            } | undefined;
        }, {
            position: {
                x?: number | undefined;
                y?: number | undefined;
                z?: number | undefined;
            };
            angle: {
                pitch?: number | undefined;
                yaw?: number | undefined;
                roll?: number | undefined;
            };
            movement?: {
                type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
                speed?: "medium" | "fast" | "slow" | undefined;
                smoothness?: number | undefined;
            } | undefined;
            distance?: number | undefined;
            lens?: {
                focalLength?: number | undefined;
                aperture?: number | undefined;
                focusDistance?: number | undefined;
            } | undefined;
        }>;
        lighting: z.ZodOptional<z.ZodObject<{
            timeOfDay: z.ZodDefault<z.ZodEnum<["dawn", "morning", "noon", "afternoon", "dusk", "night", "golden-hour", "blue-hour"]>>;
            weather: z.ZodDefault<z.ZodEnum<["clear", "cloudy", "overcast", "foggy", "rainy", "stormy", "snowy"]>>;
            mood: z.ZodDefault<z.ZodEnum<["bright", "dramatic", "soft", "harsh", "moody", "ethereal", "cinematic"]>>;
            keyLight: z.ZodOptional<z.ZodObject<{
                intensity: z.ZodDefault<z.ZodNumber>;
                temperature: z.ZodDefault<z.ZodNumber>;
                angle: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                intensity: number;
                angle: number;
                temperature: number;
            }, {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            }>>;
            fillLight: z.ZodOptional<z.ZodObject<{
                intensity: z.ZodDefault<z.ZodNumber>;
                temperature: z.ZodDefault<z.ZodNumber>;
                angle: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                intensity: number;
                angle: number;
                temperature: number;
            }, {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            mood: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal";
            weather: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy";
            timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour";
            keyLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
            fillLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
        }, {
            mood?: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal" | undefined;
            weather?: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy" | undefined;
            timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour" | undefined;
            keyLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
            fillLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
        }>>;
        environment: z.ZodOptional<z.ZodObject<{
            location: z.ZodDefault<z.ZodEnum<["interior", "exterior", "studio", "practical"]>>;
            atmosphere: z.ZodDefault<z.ZodEnum<["clear", "hazy", "dusty", "smoky", "misty"]>>;
            temperature: z.ZodDefault<z.ZodNumber>;
            windSpeed: z.ZodDefault<z.ZodNumber>;
            props: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            location: "interior" | "exterior" | "studio" | "practical";
            atmosphere: "clear" | "hazy" | "dusty" | "smoky" | "misty";
            props: string[];
            temperature: number;
            windSpeed: number;
        }, {
            location?: "interior" | "exterior" | "studio" | "practical" | undefined;
            atmosphere?: "clear" | "hazy" | "dusty" | "smoky" | "misty" | undefined;
            props?: string[] | undefined;
            temperature?: number | undefined;
            windSpeed?: number | undefined;
        }>>;
        postProcessing: z.ZodOptional<z.ZodObject<{
            colorGrading: z.ZodOptional<z.ZodObject<{
                style: z.ZodDefault<z.ZodEnum<["natural", "cinematic", "vintage", "modern", "dramatic"]>>;
                contrast: z.ZodDefault<z.ZodNumber>;
                saturation: z.ZodDefault<z.ZodNumber>;
                warmth: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
                saturation: number;
                contrast: number;
                warmth: number;
            }, {
                style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
                saturation?: number | undefined;
                contrast?: number | undefined;
                warmth?: number | undefined;
            }>>;
            effects: z.ZodDefault<z.ZodArray<z.ZodEnum<["bloom", "vignette", "film-grain", "lens-flare", "depth-of-field"]>, "many">>;
        }, "strip", z.ZodTypeAny, {
            effects: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[];
            colorGrading?: {
                style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
                saturation: number;
                contrast: number;
                warmth: number;
            } | undefined;
        }, {
            colorGrading?: {
                style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
                saturation?: number | undefined;
                contrast?: number | undefined;
                warmth?: number | undefined;
            } | undefined;
            effects?: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        camera: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            angle: {
                pitch: number;
                yaw: number;
                roll: number;
            };
            distance: number;
            movement?: {
                type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
                speed: "medium" | "fast" | "slow";
                smoothness: number;
            } | undefined;
            lens?: {
                focalLength: number;
                aperture: number;
                focusDistance: number;
            } | undefined;
        };
        environment?: {
            location: "interior" | "exterior" | "studio" | "practical";
            atmosphere: "clear" | "hazy" | "dusty" | "smoky" | "misty";
            props: string[];
            temperature: number;
            windSpeed: number;
        } | undefined;
        lighting?: {
            mood: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal";
            weather: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy";
            timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour";
            keyLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
            fillLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
        } | undefined;
        postProcessing?: {
            effects: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[];
            colorGrading?: {
                style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
                saturation: number;
                contrast: number;
                warmth: number;
            } | undefined;
        } | undefined;
    }, {
        camera: {
            position: {
                x?: number | undefined;
                y?: number | undefined;
                z?: number | undefined;
            };
            angle: {
                pitch?: number | undefined;
                yaw?: number | undefined;
                roll?: number | undefined;
            };
            movement?: {
                type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
                speed?: "medium" | "fast" | "slow" | undefined;
                smoothness?: number | undefined;
            } | undefined;
            distance?: number | undefined;
            lens?: {
                focalLength?: number | undefined;
                aperture?: number | undefined;
                focusDistance?: number | undefined;
            } | undefined;
        };
        environment?: {
            location?: "interior" | "exterior" | "studio" | "practical" | undefined;
            atmosphere?: "clear" | "hazy" | "dusty" | "smoky" | "misty" | undefined;
            props?: string[] | undefined;
            temperature?: number | undefined;
            windSpeed?: number | undefined;
        } | undefined;
        lighting?: {
            mood?: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal" | undefined;
            weather?: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy" | undefined;
            timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour" | undefined;
            keyLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
            fillLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
        } | undefined;
        postProcessing?: {
            colorGrading?: {
                style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
                saturation?: number | undefined;
                contrast?: number | undefined;
                warmth?: number | undefined;
            } | undefined;
            effects?: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[] | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    metadata: {
        name: string;
        version: string;
        author: string;
        created: string;
        vfx?: {
            exportFormat: "controlnet-compatible";
            targetPipeline: "custom" | "stable-diffusion" | "midjourney" | "dalle";
            compatibilityVersion: string;
        } | undefined;
        debug?: {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        } | undefined;
    };
    variables: Record<string, unknown>;
    grammar: Record<string, string[] | {
        text: string;
        weight?: number | undefined;
    }[] | {
        type: "conditional";
        cases: {
            value: string;
            condition: string;
        }[];
    } | {
        type: "sequential";
        items: string[];
    } | {
        $include: string;
    } | ({
        _meta?: Record<string, unknown> | undefined;
    } | {
        $include: string;
    })[] | {
        type: "modifier_chain";
        base: string;
        mods: string[];
    }>;
    entry_points: {
        default: string;
        alternatives?: string[] | undefined;
    };
    seed?: number | undefined;
    lockedValues?: Record<string, string> | undefined;
    controlNet?: {
        poseGuidance?: {
            enabled: boolean;
            strength: number;
            startStep: number;
            endStep: number;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        } | undefined;
        depthMaps?: {
            enabled: boolean;
            strength: number;
            preprocessor: "depth_midas" | "depth_zoe" | "depth_leres";
        } | undefined;
        edgeDetection?: {
            enabled: boolean;
            strength: number;
            preprocessor: "canny" | "hed" | "scribble" | "pidinet";
            lowThreshold: number;
            highThreshold: number;
        } | undefined;
        animationSequence?: {
            frameCount: number;
            fps: number;
            interpolationMethod: "linear" | "cubic" | "bezier";
            keyframes: {
                parameters: Record<string, unknown>;
                frame: number;
            }[];
        } | undefined;
        cameraParameters?: {
            position: [number, number, number];
            fov: number;
            aspectRatio: number;
            nearPlane: number;
            farPlane: number;
            rotation: [number, number, number];
        } | undefined;
        billboardProjection?: {
            enabled: boolean;
            targetResolution: [number, number];
            projectionMatrix?: number[] | undefined;
        } | undefined;
    } | undefined;
    sceneData?: {
        camera: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            angle: {
                pitch: number;
                yaw: number;
                roll: number;
            };
            distance: number;
            movement?: {
                type: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld";
                speed: "medium" | "fast" | "slow";
                smoothness: number;
            } | undefined;
            lens?: {
                focalLength: number;
                aperture: number;
                focusDistance: number;
            } | undefined;
        };
        environment?: {
            location: "interior" | "exterior" | "studio" | "practical";
            atmosphere: "clear" | "hazy" | "dusty" | "smoky" | "misty";
            props: string[];
            temperature: number;
            windSpeed: number;
        } | undefined;
        lighting?: {
            mood: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal";
            weather: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy";
            timeOfDay: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour";
            keyLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
            fillLight?: {
                intensity: number;
                angle: number;
                temperature: number;
            } | undefined;
        } | undefined;
        postProcessing?: {
            effects: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[];
            colorGrading?: {
                style: "modern" | "cinematic" | "dramatic" | "natural" | "vintage";
                saturation: number;
                contrast: number;
                warmth: number;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    metadata: {
        name: string;
        version: string;
        author: string;
        created: string;
        vfx?: {
            exportFormat?: "controlnet-compatible" | undefined;
            targetPipeline?: "custom" | "stable-diffusion" | "midjourney" | "dalle" | undefined;
            compatibilityVersion?: string | undefined;
        } | undefined;
        debug?: {
            seed?: number | undefined;
            originGraphGuid?: string | undefined;
        } | undefined;
    };
    variables: Record<string, unknown>;
    grammar: Record<string, string[] | {
        text: string;
        weight?: number | undefined;
    }[] | {
        type: "conditional";
        cases: {
            value: string;
            condition: string;
        }[];
    } | {
        type: "sequential";
        items: string[];
    } | {
        $include: string;
    } | ({
        _meta?: Record<string, unknown> | undefined;
    } | {
        $include: string;
    })[] | {
        type: "modifier_chain";
        base: string;
        mods: string[];
    }>;
    entry_points: {
        default: string;
        alternatives?: string[] | undefined;
    };
    seed?: number | undefined;
    lockedValues?: Record<string, string> | undefined;
    controlNet?: {
        poseGuidance?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            startStep?: number | undefined;
            endStep?: number | undefined;
            keypoints?: {
                x: number;
                y: number;
                confidence: number;
            }[] | undefined;
        } | undefined;
        depthMaps?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "depth_midas" | "depth_zoe" | "depth_leres" | undefined;
        } | undefined;
        edgeDetection?: {
            enabled?: boolean | undefined;
            strength?: number | undefined;
            preprocessor?: "canny" | "hed" | "scribble" | "pidinet" | undefined;
            lowThreshold?: number | undefined;
            highThreshold?: number | undefined;
        } | undefined;
        animationSequence?: {
            frameCount?: number | undefined;
            fps?: number | undefined;
            interpolationMethod?: "linear" | "cubic" | "bezier" | undefined;
            keyframes?: {
                parameters: Record<string, unknown>;
                frame: number;
            }[] | undefined;
        } | undefined;
        cameraParameters?: {
            position?: [number, number, number] | undefined;
            fov?: number | undefined;
            aspectRatio?: number | undefined;
            nearPlane?: number | undefined;
            farPlane?: number | undefined;
            rotation?: [number, number, number] | undefined;
        } | undefined;
        billboardProjection?: {
            enabled?: boolean | undefined;
            targetResolution?: [number, number] | undefined;
            projectionMatrix?: number[] | undefined;
        } | undefined;
    } | undefined;
    sceneData?: {
        camera: {
            position: {
                x?: number | undefined;
                y?: number | undefined;
                z?: number | undefined;
            };
            angle: {
                pitch?: number | undefined;
                yaw?: number | undefined;
                roll?: number | undefined;
            };
            movement?: {
                type?: "static" | "pan" | "tilt" | "dolly" | "crane" | "handheld" | undefined;
                speed?: "medium" | "fast" | "slow" | undefined;
                smoothness?: number | undefined;
            } | undefined;
            distance?: number | undefined;
            lens?: {
                focalLength?: number | undefined;
                aperture?: number | undefined;
                focusDistance?: number | undefined;
            } | undefined;
        };
        environment?: {
            location?: "interior" | "exterior" | "studio" | "practical" | undefined;
            atmosphere?: "clear" | "hazy" | "dusty" | "smoky" | "misty" | undefined;
            props?: string[] | undefined;
            temperature?: number | undefined;
            windSpeed?: number | undefined;
        } | undefined;
        lighting?: {
            mood?: "cinematic" | "dramatic" | "bright" | "soft" | "harsh" | "moody" | "ethereal" | undefined;
            weather?: "clear" | "cloudy" | "overcast" | "foggy" | "rainy" | "stormy" | "snowy" | undefined;
            timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | "golden-hour" | "blue-hour" | undefined;
            keyLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
            fillLight?: {
                intensity?: number | undefined;
                angle?: number | undefined;
                temperature?: number | undefined;
            } | undefined;
        } | undefined;
        postProcessing?: {
            colorGrading?: {
                style?: "modern" | "cinematic" | "dramatic" | "natural" | "vintage" | undefined;
                saturation?: number | undefined;
                contrast?: number | undefined;
                warmth?: number | undefined;
            } | undefined;
            effects?: ("bloom" | "vignette" | "film-grain" | "lens-flare" | "depth-of-field")[] | undefined;
        } | undefined;
    } | undefined;
}>;
export type GeneratorBundle = z.infer<typeof GeneratorBundleSchema>;
export type ControlNetParameters = z.infer<typeof ControlNetParametersSchema>;
/**
 * Epic 8.6 Task 3: Scene Data Integration Schema (DUPLICATE - COMMENTED OUT)
 * Professional scene data structure for film production workflows
 */
export type SceneData = z.infer<typeof SceneDataSchema>;
/**
 * Converts a graph to a generator bundle format
 * @param graph Graph to convert
 * @param options Additional metadata for the bundle
 * @returns A GeneratorBundle compatible with the Randomizer Engine
 */
export declare function graphToBundle(graph: Graph, options: {
    name: string;
    version?: string;
    author?: string;
    controlNetEnabled?: boolean;
    targetPipeline?: 'stable-diffusion' | 'midjourney' | 'dalle' | 'custom';
    includeSceneData?: boolean;
}): GeneratorBundle;
/**
 * Epic 8.6: Enhanced VFX-focused export function
 * Creates a ControlNet-compatible export with full VFX metadata
 */
export declare function graphToVFXBundle(graph: Graph, options: {
    name: string;
    targetPipeline?: 'stable-diffusion' | 'midjourney' | 'dalle' | 'custom';
    version?: string;
    author?: string;
}): GeneratorBundle;
/**
 * Epic 8.6: Validate ControlNet compatibility
 * Checks if a graph has VFX-compatible structures
 */
export declare function validateVFXCompatibility(graph: Graph): {
    compatible: boolean;
    features: string[];
    recommendations: string[];
};
/**
 * Epic 8.6 Task 3: Generate scene-to-prompt data flow
 * Creates natural language prompt additions based on scene data
 */
export declare function generateScenePromptFlow(sceneData: SceneData): {
    cameraPrompt: string;
    lightingPrompt: string;
    environmentPrompt: string;
    fullPrompt: string;
};
/**
 * Epic 8.6 Task 3: Create a complete scene-aware export
 * Combines VFX export with scene data and prompt flow
 */
export declare function graphToSceneAwareBundle(graph: Graph, options: {
    name: string;
    targetPipeline?: 'stable-diffusion' | 'midjourney' | 'dalle' | 'custom';
    version?: string;
    author?: string;
    includePromptFlow?: boolean;
}): GeneratorBundle & {
    scenePromptFlow?: ReturnType<typeof generateScenePromptFlow>;
};
/**
 * Validates a GeneratorBundle against the schema
 * @param bundle The bundle to validate
 * @returns True if valid, false otherwise
 */
export declare function validateGeneratorBundle(bundle: Record<string, unknown>): boolean;
/**
 * Converts a GeneratorBundle back to a Graph format
 * @param bundle GeneratorBundle to convert
 * @returns Graph compatible with the editor
 */
export declare function bundleToGraph(bundle: GeneratorBundle): Graph;
/**
 * Epic 8.5: Export Results for Film Industry
 * Professional export system with VFX-ready formats
 */
}
export interface ExportRequest {
    format: string;
    data: Record<string, unknown>;
    options: Record<string, unknown>;
    filename: string;
}
}
}
export interface ExportResult {
    type: 'text' | 'binary';
    data: Record<string, unknown>;
    mimeType: string;
    shouldDownload?: boolean;
}
}
export declare function exportResults(request: ExportRequest): Promise<ExportResult>;
//# sourceMappingURL=exporter.d.ts.map