// VFX-specific export functions extracted from exporter.ts
import { Graph } from '../../../packages/core/graphSchema';
import { ControlNetParameters, GeneratorBundle } from './schemas';

/**
 * Extract ControlNet parameters from graph metadata
 */
export function extractControlNetParameters(
  graph: Graph
): Partial<ControlNetParameters> {
  const params: Partial<ControlNetParameters> = {};

  // Look for VFX-specific metadata in graph
  if (graph.metadata?.vfx) {
    const vfx = graph.metadata.vfx;

    if (vfx.poseGuidance) {
      params.poseGuidance = {
        enabled: vfx.poseGuidance.enabled ?? false,
        strength: vfx.poseGuidance.strength ?? 1.0,
        startStep: vfx.poseGuidance.startStep ?? 0,
        endStep: vfx.poseGuidance.endStep ?? 1000,
        keypoints: vfx.poseGuidance.keypoints
      };
    }

    if (vfx.depthMaps) {
      params.depthMaps = {
        enabled: vfx.depthMaps.enabled ?? false,
        strength: vfx.depthMaps.strength ?? 1.0,
        preprocessor: vfx.depthMaps.preprocessor ?? 'depth_midas'
      };
    }

    if (vfx.edgeDetection) {
      params.edgeDetection = {
        enabled: vfx.edgeDetection.enabled ?? false,
        strength: vfx.edgeDetection.strength ?? 1.0,
        preprocessor: vfx.edgeDetection.preprocessor ?? 'canny',
        lowThreshold: vfx.edgeDetection.lowThreshold ?? 100,
        highThreshold: vfx.edgeDetection.highThreshold ?? 200
      };
    }

    if (vfx.animation) {
      params.animationSequence = {
        frameCount: vfx.animation.frameCount ?? 1,
        fps: vfx.animation.fps ?? 24,
        interpolationMethod: vfx.animation.interpolationMethod ?? 'linear',
        keyframes: vfx.animation.keyframes ?? []
      };
    }

    if (vfx.camera) {
      params.cameraParameters = {
        fov: vfx.camera.fov ?? 70,
        aspectRatio: vfx.camera.aspectRatio ?? 1.777,
        nearPlane: vfx.camera.nearPlane ?? 0.1,
        farPlane: vfx.camera.farPlane ?? 1000,
        position: vfx.camera.position ?? [0, 0, 5],
        rotation: vfx.camera.rotation ?? [0, 0, 0]
      };
    }

    if (vfx.billboard) {
      params.billboardProjection = {
        enabled: vfx.billboard.enabled ?? false,
        targetResolution: vfx.billboard.targetResolution ?? [1920, 1080],
        projectionMatrix: vfx.billboard.projectionMatrix
      };
    }
  }

  // Also check individual nodes for VFX parameters
  graph.nodes.forEach(node => {
    if (node.data?.vfxParams) {
      const nodeVfx = node.data.vfxParams;

      // Merge node-level VFX params with graph-level
      if (nodeVfx.poseGuidance && !params.poseGuidance) {
        params.poseGuidance = nodeVfx.poseGuidance;
      }

      if (nodeVfx.depthMaps && !params.depthMaps) {
        params.depthMaps = nodeVfx.depthMaps;
      }

      if (nodeVfx.edgeDetection && !params.edgeDetection) {
        params.edgeDetection = nodeVfx.edgeDetection;
      }
    }
  });

  return params;
}

/**
 * Convert graph to VFX-enhanced bundle
 */
export function graphToVFXBundle(
  graph: Graph,
  baseBundle: GeneratorBundle
): GeneratorBundle {
  const controlNetParams = extractControlNetParameters(graph);

  return {
    ...baseBundle,
    controlNet: {
      ...baseBundle.controlNet,
      ...controlNetParams
    },
    metadata: {
      ...baseBundle.metadata,
      tags: [...(baseBundle.metadata?.tags || []), 'vfx-enhanced', 'controlnet']
    }
  };
}

/**
 * Validate VFX compatibility of a graph
 */
export function validateVFXCompatibility(graph: Graph): {
  compatible: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for VFX metadata
  if (!graph.metadata?.vfx) {
    warnings.push(
      'No VFX metadata found in graph. VFX features will use defaults.'
    );
  }

  // Check for animation sequences
  if (graph.metadata?.vfx?.animation) {
    const anim = graph.metadata.vfx.animation;

    if (anim.frameCount > 10000) {
      errors.push('Animation frame count exceeds maximum of 10000');
    }

    if (anim.fps > 60) {
      warnings.push('FPS above 60 may cause performance issues');
    }

    if (anim.keyframes && anim.keyframes.length > 1000) {
      warnings.push('Large number of keyframes may impact performance');
    }
  }

  // Check for pose guidance
  if (graph.metadata?.vfx?.poseGuidance) {
    const pose = graph.metadata.vfx.poseGuidance;

    if (pose.enabled && !pose.keypoints) {
      errors.push('Pose guidance enabled but no keypoints provided');
    }

    if (pose.keypoints && pose.keypoints.length < 17) {
      warnings.push('Incomplete pose keypoints detected (less than 17 points)');
    }
  }

  // Check for depth maps
  if (graph.metadata?.vfx?.depthMaps?.enabled) {
    const validPreprocessors = ['depth_midas', 'depth_zoe', 'depth_leres'];
    const preprocessor = graph.metadata.vfx.depthMaps.preprocessor;

    if (preprocessor && !validPreprocessors.includes(preprocessor)) {
      errors.push(`Invalid depth map preprocessor: ${preprocessor}`);
    }
  }

  // Check for edge detection
  if (graph.metadata?.vfx?.edgeDetection?.enabled) {
    const edge = graph.metadata.vfx.edgeDetection;

    if (edge.lowThreshold >= edge.highThreshold) {
      errors.push(
        'Edge detection low threshold must be less than high threshold'
      );
    }
  }

  // Check for billboard projection
  if (graph.metadata?.vfx?.billboard?.enabled) {
    const billboard = graph.metadata.vfx.billboard;

    if (
      billboard.projectionMatrix &&
      billboard.projectionMatrix.length !== 16
    ) {
      errors.push(
        'Billboard projection matrix must be a 4x4 matrix (16 values)'
      );
    }

    const [width, height] = billboard.targetResolution || [1920, 1080];
    if (width > 8192 || height > 8192) {
      warnings.push(
        'Target resolution exceeds recommended maximum of 8192x8192'
      );
    }
  }

  return {
    compatible: errors.length === 0,
    warnings,
    errors
  };
}
