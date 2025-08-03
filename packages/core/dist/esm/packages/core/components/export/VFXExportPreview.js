import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiSettings, FiFile, FiClock, FiTarget } from 'react-icons/fi';
export const VFXExportPreview = ({ exportData, onValidationComplete }) => {
    const [previewData, setPreviewData] = useState(null);
    const [validation, setValidation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');
    useEffect(() => {
        generatePreview();
    }, [exportData]);
    const generatePreview = async () => {
        setLoading(true);
        try {
            // Simulate VFX export preview generation with hybrid prompting
            const mockPreview = {};
            metadata: {
                ;
                exportId: `preview-${Date.now()}`;
                version: exportData.export_options?.format_version || '1.2.0';
                timestamp: new Date().toISOString();
                generator: {
                    name: 'Wild Construct Prompt Generator';
                    version: '1.0.0';
                    build: 'preview-mode';
                }
                project: {
                    name: 'Preview Project';
                    scene: 'Preview Scene';
                }
            }
        }
        finally {
        }
    };
};
{
    format: 'vfx-pipeline-v1';
    quality: exportData.export_options?.quality || 'production';
    includeDebugInfo: exportData.export_options?.include_debug_info || false;
    includeHistoricalData: exportData.export_options?.include_historical_data || true;
}
compatibility: {
    controlNet: exportData.export_options?.enable_controlnet_support || true;
    diffusionModels: ['stable-diffusion-xl', 'midjourney-v6'];
    animationFramework: exportData.export_options?.enable_animation_framework || true;
    billboardProjection: true;
}
prompt: {
    finalPrompt: 'A majestic ancient red dragon with weathered scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, mist swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering';
    components: {
        subject: ['ancient red dragon', 'weathered scales', 'majestic'];
        action: ['perched majestically'];
        setting: ['crumbling stone ruins', 'ancient temple'];
        mood: ['dramatic', 'golden hour lighting', 'mist swirling'];
        technical: ['cinematic composition', 'depth of field', '8K resolution'];
        style: ['photorealistic rendering'];
    }
    variables: { }
    variants: [];
    weights: {
        overall: 1.0;
        subject: 1.2;
        composition: 1.0;
        style: 0.8;
    }
    // === HYBRID PROMPTING EXTENSIONS ===
    mars: {
        metadata: {
            camera: {
                shotType: 'wide';
                movement: 'static';
                angle: 'low-angle';
                lens: {
                    focalLength: 35;
                    aperture: 2.8;
                    focusType: 'deep-focus';
                }
                framing: {
                    composition: 'rule-of-thirds';
                    aspectRatio: '16:9';
                    headroom: 'standard';
                }
                // ControlNet metadata tags
                marsMetadataTags: {
                    '[CAM]';
                    {
                        tag: '[CAM:WIDE_LOW_ANGLE]';
                        description: 'Wide shot with low angle for dramatic perspective';
                        controlNetParameters: { }
                        depth: {
                            enabled: true, strength;
                            0.8, preprocessor;
                            'midas';
                        }
                        pose: {
                            enabled: false;
                        }
                        canny: {
                            enabled: false;
                        }
                        renderingHints: {
                            cameraDistance: 15.0;
                            verticalAngle: -20.0;
                            fieldOfView: 35.0;
                        }
                        scene: {
                            location: 'exterior';
                            timeOfDay: 'golden-hour';
                            season: 'autumn';
                            weather: 'clear';
                            atmosphere: 'dramatic';
                        }
                        technical: {
                            filmStock: 'digital';
                            colorSpace: 'rec709';
                            resolution: '4k';
                            frameRate: 24;
                        }
                        actions: {
                            primary: {
                                subjects: [
                                    {
                                        id: 'dragon-01',
                                        type: 'creature',
                                        description: 'Ancient red dragon with weathered scales',
                                        importance: 'primary',
                                        characteristics: {
                                            physical: ['massive', 'weathered scales', 'red coloration', 'ancient'],
                                            emotional: ['majestic', 'imposing', 'regal'],
                                            narrative: ['guardian', 'ancient being', 'powerful']
                                        },
                                        positioning: {
                                            screenPosition: 'center',
                                            depth: 'midground',
                                            relationship: ['dominates ruins']
                                        }
                                        // ControlNet subject metadata tags
                                        ,
                                        // ControlNet subject metadata tags
                                        marsMetadataTags: { '[SUBJ]': {
                                                tag: '[SUBJ:DRAGON_ANCIENT_RED]',
                                                description: 'Primary creature subject - ancient red dragon with majestic presence',
                                                controlNetParameters: {},
                                                pose: { enabled: true, strength: 0.9, preprocessor: 'openpose' },
                                                depth: { enabled: true, strength: 0.7, preprocessor: 'midas' },
                                                segmentation: { enabled: true, strength: 0.6, preprocessor: 'seg' },
                                                renderingHints: {
                                                    subjectScale: 0.8,
                                                    detailLevel: 'hero',
                                                    materialType: 'organic_scales',
                                                    animationReady: true
                                                }
                                            } }
                                    }
                                ];
                                primaryAction: 'perched majestically';
                                secondaryActions: ['observing', 'guarding'];
                                interactions: [
                                    { type: 'spatial',
                                        participants: ['dragon-01', 'ruins'],
                                        description: 'Dragon positioned dominantly on ruins',
                                        intensity: 'strong',
                                        duration: 'sustained' }
                                ];
                                performance: {
                                    emotionalState: 'neutral';
                                    intensity: 'intense';
                                    bodyLanguage: 'confident';
                                    facialExpression: 'stoic';
                                }
                                movement: {
                                    pace: 'static';
                                    direction: 'toward-camera';
                                    choreography: 'natural';
                                }
                                rendering: {
                                    lighting: {
                                        setup: 'natural';
                                        quality: 'dramatic';
                                        temperature: {
                                            kelvin: 3200;
                                            description: 'warm';
                                        }
                                        motivation: 'sun';
                                        effects: {
                                            atmosphere: ['mist'];
                                            particles: [];
                                            postProcessing: {
                                                colorGrading: 'cinematic';
                                                filtration: 'clean';
                                            }
                                            // ControlNet effects metadata tags
                                            marsMetadataTags: {
                                                '[FX]';
                                                {
                                                    tag: '[FX:ATMOSPHERIC_MIST_GOLDEN]';
                                                    description: 'Atmospheric mist effects with golden hour lighting';
                                                    controlNetParameters: { }
                                                    depth: {
                                                        enabled: true, strength;
                                                        0.5, preprocessor;
                                                        'midas';
                                                    }
                                                    normal: {
                                                        enabled: true, strength;
                                                        0.4, preprocessor;
                                                        'normal';
                                                    }
                                                    scribble: {
                                                        enabled: false;
                                                    }
                                                    renderingHints: {
                                                        mistDensity: 0.3;
                                                        lightingTemperature: 3200;
                                                        atmosphericPerspective: true;
                                                        volumetricLighting: true;
                                                    }
                                                    quality: {
                                                        renderEngine: 'path-tracing';
                                                        samples: 256;
                                                        bounces: 8;
                                                        denoising: true;
                                                        upscaling: '4x';
                                                    }
                                                    style: {
                                                        genre: 'fantasy';
                                                        visualStyle: {
                                                            overall: 'realistic';
                                                            colorPalette: 'warm';
                                                            contrast: 'high';
                                                            saturation: 'natural';
                                                        }
                                                        influences: {
                                                            cinematographer: ['Roger Deakins', 'Emmanuel Lubezki'];
                                                            director: ['Peter Jackson', 'Denis Villeneuve'];
                                                            period: ['epic fantasy', 'classical mythology'];
                                                            artMovement: ['romanticism'];
                                                        }
                                                        references: {
                                                            films: ['The Lord of the Rings', 'Game of Thrones'];
                                                            artwork: ['Frank Frazetta', 'Boris Vallejo'];
                                                            photography: ['National Geographic wildlife'];
                                                            other: ['Dragon mythology'];
                                                        }
                                                        zadaVariants: [
                                                            { id: 'director-notes',
                                                                type: 'director-notes',
                                                                language: 'english',
                                                                style: {
                                                                    formality: 'professional',
                                                                    length: 'detailed',
                                                                    perspective: 'second-person'
                                                                },
                                                                content: {
                                                                    naturalLanguage: "Picture this: We're looking up at this magnificent, ancient dragon - think Smaug's older, wiser brother. He's perched on these crumbling temple ruins like a king on his throne. The late afternoon sun is hitting him just right, creating these beautiful rim-lit edges on his weathered red scales. There's this ethereal mist rolling around the base of the ruins that adds mystery and depth. The whole composition should feel epic and cinematic - this is a creature that's seen civilizations rise and fall.",
                                                                    technicalNotes: [
                                                                        'Use wide lens to capture both dragon and ruins in frame',
                                                                        'Golden hour lighting for warm, dramatic feel',
                                                                        'Practical mist effects at base level',
                                                                        'Deep focus to keep entire scene sharp'
                                                                    ],
                                                                    creativeNotes: [
                                                                        'Dragon should convey ancient wisdom, not aggression',
                                                                        'Ruins tell story of civilizations past',
                                                                        'Mist adds ethereal, mystical quality',
                                                                        "Composition emphasizes dragon's dominance"
                                                                    ],
                                                                    productionNotes: [
                                                                        'Consider practical miniature for ruins',
                                                                        'Dragon will be full CG creature',
                                                                        'Mist can be combination of practical and digital',
                                                                        'Plan for hero beauty lighting setup'
                                                                    ]
                                                                },
                                                                metadata: {
                                                                    targetAudience: 'director',
                                                                    expertiseLevel: 'expert',
                                                                    context: 'pre-production'
                                                                },
                                                                equivalence: {
                                                                    marsMapping: {
                                                                        metadata: true,
                                                                        actions: true,
                                                                        rendering: true,
                                                                        style: true
                                                                    },
                                                                    structuredPrompt: 'A majestic ancient red dragon with weathered scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, mist swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering',
                                                                    confidence: 0.95
                                                                } },
                                                            { id: 'technical-brief',
                                                                type: 'technical',
                                                                language: 'english',
                                                                style: {
                                                                    formality: 'technical',
                                                                    length: 'concise',
                                                                    perspective: 'objective'
                                                                },
                                                                content: {
                                                                    naturalLanguage: 'Wide-angle exterior shot of large creature asset positioned on architectural ruins. Golden hour lighting conditions with atmospheric haze. Photorealistic rendering quality required.',
                                                                    technicalNotes: [
                                                                        'Creature scale: approximately 15-20 meters',
                                                                        'Asset complexity: hero-level detail required',
                                                                        'Lighting setup: single key sun source + fill bounce',
                                                                        'Atmospheric effects: volumetric fog at ground level'
                                                                    ],
                                                                    creativeNotes: [
                                                                        'Creature pose: regal, non-threatening',
                                                                        'Color palette: warm golden tones',
                                                                        'Mood: majestic, contemplative'
                                                                    ],
                                                                    productionNotes: [
                                                                        'Render time estimate: 8-12 hours per frame',
                                                                        'Memory requirements: 32GB+ recommended',
                                                                        'Dependencies: creature rigging, environment modeling'
                                                                    ]
                                                                },
                                                                metadata: {
                                                                    targetAudience: 'vfx-supervisor',
                                                                    expertiseLevel: 'expert',
                                                                    context: 'production'
                                                                },
                                                                equivalence: {
                                                                    marsMapping: {
                                                                        metadata: true,
                                                                        actions: false,
                                                                        rendering: true,
                                                                        style: false
                                                                    },
                                                                    structuredPrompt: 'Wide shot, ancient red dragon, stone ruins, golden hour lighting, photorealistic',
                                                                    confidence: 0.87
                                                                } }
                                                        ];
                                                        hollywoodProtocol: {
                                                            version: '2.0';
                                                            production: {
                                                                masterSeed: 1024576;
                                                                projectCode: 'PREVIEW-001';
                                                                shotNumber: 42;
                                                            }
                                                            departmental: {
                                                                cinematography: 2048152;
                                                                vfx: 4096304;
                                                                editorial: 8192608;
                                                                sound: 16385216;
                                                                grading: 32770432;
                                                            }
                                                            creative: {
                                                                directorVariant: 1024576;
                                                                alternativeVersions: {
                                                                    director_preferred: {
                                                                        seed: 1024576;
                                                                        description: "Director's preferred composition and lighting";
                                                                        approvalStatus: 'approved';
                                                                        notes: 'Final approved version for production';
                                                                    }
                                                                    alternate_angle: {
                                                                        seed: 1024577;
                                                                        description: 'Alternative low-angle approach';
                                                                        approvalStatus: 'review';
                                                                        notes: 'Backup option if main version needs adjustment';
                                                                    }
                                                                    qa: {
                                                                        validationSeed: 9999999;
                                                                        comparisonSeeds: [1111111, 2222222, 3333333];
                                                                        benchmarkSeed: 5555555;
                                                                    }
                                                                    reproducibility: {
                                                                        guaranteeLevel: 'exact';
                                                                        environmentHash: 'sha256:a1b2c3d4e5f6';
                                                                        softwareVersions: {
                                                                            'wild-construct';
                                                                            '1.0.0';
                                                                            blender: '4.0.0';
                                                                            cycles: '4.0.0';
                                                                        }
                                                                        hardwareFingerprint: 'gpu:rtx4090-cpu:i9-13900k';
                                                                        lastValidated: new Date().toISOString();
                                                                        validationNotes: 'Validated on reference hardware configuration';
                                                                        compliance: {
                                                                            studioCertification: true;
                                                                            distributorApproval: false;
                                                                            archiveCompliant: true;
                                                                            regulatoryCompliance: ['MPAA', 'DCI'];
                                                                        }
                                                                        humanReadable: {
                                                                            executiveSummary: {
                                                                                description: 'An epic establishing shot featuring a majestic dragon positioned on ancient temple ruins during golden hour. The scene conveys power, wisdom, and the passage of time through the juxtaposition of the eternal dragon and crumbling human architecture.';
                                                                                keyElements: [
                                                                                    'Ancient dragon creature',
                                                                                    'Temple ruins',
                                                                                    'Golden hour lighting',
                                                                                    'Atmospheric mist'
                                                                                ];
                                                                                creativeIntent: 'Establish the dragon as a wise, ancient guardian rather than a threatening force';
                                                                                technicalComplexity: 'complex';
                                                                                estimatedCost: 'high';
                                                                                estimatedTime: 'weeks';
                                                                            }
                                                                            creativeTeam: {
                                                                                director: {
                                                                                    vision: 'Epic fantasy with emotional resonance - the dragon represents wisdom and the continuity of nature versus the temporary nature of civilization';
                                                                                    references: [
                                                                                        'Smaug from The Hobbit',
                                                                                        'Drogon from Game of Thrones',
                                                                                        'Classical dragon mythology'
                                                                                    ];
                                                                                    priorities: ["Dragon's regal presence", 'Cinematic lighting', 'Photorealistic integration'];
                                                                                    concerns: [
                                                                                        'Dragon must feel real and lived-in',
                                                                                        'Avoid making it too threatening',
                                                                                        'Lighting must feel natural'
                                                                                    ];
                                                                                }
                                                                                cinematographer: {
                                                                                    lookAndFeel: 'Epic, cinematic with naturalistic lighting that enhances the mythical elements';
                                                                                    lightingApproach: 'Golden hour sun as key light with atmospheric bounce fill, practical mist for atmosphere';
                                                                                    cameraWork: "Static wide shot with low angle to emphasize dragon's majesty, deep focus for environmental context";
                                                                                    technicalChallenges: [
                                                                                        'Matching CG dragon to practical lighting',
                                                                                        'Integrating atmospheric effects',
                                                                                        'Maintaining detail in shadows'
                                                                                    ];
                                                                                }
                                                                                vfxSupervisor: {
                                                                                    vfxApproach: 'Photorealistic creature animation with practical lighting integration and atmospheric enhancement';
                                                                                    practicalElements: [
                                                                                        'Temple ruins set piece',
                                                                                        'Practical mist/fog effects',
                                                                                        'Reference lighting'
                                                                                    ];
                                                                                    digitalElements: [
                                                                                        'Hero dragon asset',
                                                                                        'Enhanced atmospheric effects',
                                                                                        'Digital matte painting extensions'
                                                                                    ];
                                                                                    integrationNotes: [
                                                                                        'Match dragon scales to practical lighting',
                                                                                        'Integrate CG mist with practical fog',
                                                                                        'Ensure consistent color temperature'
                                                                                    ];
                                                                                }
                                                                                production: {
                                                                                    schedule: {
                                                                                        prep: '2 weeks for asset creation and lighting tests';
                                                                                        shoot: '1 day for plates and reference';
                                                                                        post: '3-4 weeks for final creature animation and compositing';
                                                                                    }
                                                                                    resources: {
                                                                                        crew: ['VFX Supervisor', 'Creature Animator', 'Lighting TD', 'Compositor'];
                                                                                        equipment: [
                                                                                            'Creature motion capture system',
                                                                                            'High-res cameras for reference',
                                                                                            'Atmospheric effects units'
                                                                                        ];
                                                                                        locations: ['Temple ruins backlot or suitable location'];
                                                                                        talent: ['N/A - full CG creature'];
                                                                                    }
                                                                                    dependencies: {
                                                                                        prerequisites: [
                                                                                            'Dragon asset modeling complete',
                                                                                            'Ruins set construction',
                                                                                            'Lighting tests approved'
                                                                                        ];
                                                                                        deliverables: [
                                                                                            'Hero creature animation',
                                                                                            'Final composited shot',
                                                                                            'Reference materials for future shots'
                                                                                        ];
                                                                                        approvals: ['Director creative approval', 'VFX budget approval', 'Schedule sign-off'];
                                                                                    }
                                                                                    approval: {
                                                                                        reviewStages: {
                                                                                            concept: {
                                                                                                reviewers: ['Director', 'Producer', 'VFX Supervisor'];
                                                                                                criteria: ['Creative vision alignment', 'Technical feasibility', 'Budget compliance'];
                                                                                                deliverables: ['Concept art', 'Technical breakdown', 'Budget estimate'];
                                                                                                timeline: '3-5 days';
                                                                                            }
                                                                                            previs: {
                                                                                                reviewers: ['Director', 'Cinematographer', 'VFX Supervisor'];
                                                                                                criteria: ['Composition', 'Camera work', 'Creature performance'];
                                                                                                deliverables: ['Animated previs', 'Lighting tests', 'Camera breakdown'];
                                                                                                timeline: '1 week';
                                                                                            }
                                                                                            final: {
                                                                                                reviewers: ['Director', 'Producer', 'VFX Supervisor', 'Editor'];
                                                                                                criteria: ['Final image quality', 'Story integration', 'Technical delivery'];
                                                                                                deliverables: ['Final rendered shot', 'Technical documentation', 'Archive materials'];
                                                                                                timeline: '2-3 days';
                                                                                            }
                                                                                            signOffs: {
                                                                                                creative: false;
                                                                                                technical: false;
                                                                                                legal: true;
                                                                                                budget: false;
                                                                                            }
                                                                                            notes: {
                                                                                                directorNotes: ['Needs to feel epic but not threatening', 'Golden hour lighting is crucial'];
                                                                                                producerNotes: ['Watch render times and budget', 'Coordinate with creature team'];
                                                                                                clientNotes: [];
                                                                                                technicalNotes: ['Test atmospheric integration early', 'Plan for multiple render passes'];
                                                                                            }
                                                                                            documentation: {
                                                                                                projectDocuments: [
                                                                                                    'Dragon design bible',
                                                                                                    'Lighting reference guide',
                                                                                                    'VFX pipeline documentation'
                                                                                                ];
                                                                                                referenceImages: [
                                                                                                    'Classical dragon artwork',
                                                                                                    'Temple architecture references',
                                                                                                    'Golden hour photography'
                                                                                                ];
                                                                                                testFootage: ['Dragon movement tests', 'Lighting studies', 'Atmospheric effect tests'];
                                                                                                alternativeVersions: ['Night version', 'Stormy weather variant', 'Different dragon poses'];
                                                                                                archiveNotes: 'Hero dragon asset to be preserved for future sequences. Lighting setup documented for consistency.';
                                                                                            }
                                                                                            // ControlNet integration metadata tags
                                                                                            controlNetTags: {
                                                                                                camera: {
                                                                                                    ;
                                                                                                    wide_low_angle: {
                                                                                                        tag: '[CAM:WIDE_LOW_ANGLE]';
                                                                                                        description: 'Wide shot with low angle for dramatic perspective';
                                                                                                        controlNetParameters: { }
                                                                                                        depth: {
                                                                                                            enabled: true, strength;
                                                                                                            0.8, preprocessor;
                                                                                                            'midas', guidanceScale;
                                                                                                            7.5;
                                                                                                        }
                                                                                                        pose: {
                                                                                                            enabled: false, strength;
                                                                                                            0.0, preprocessor;
                                                                                                            'openpose';
                                                                                                        }
                                                                                                        canny: {
                                                                                                            enabled: false, strength;
                                                                                                            0.0, lowThreshold;
                                                                                                            100, highThreshold;
                                                                                                            200;
                                                                                                        }
                                                                                                        renderingHints: {
                                                                                                            cameraDistance: 15.0;
                                                                                                            verticalAngle: -20.0;
                                                                                                            fieldOfView: 35.0;
                                                                                                            priorityLevel: 'high';
                                                                                                            processingOrder: 1;
                                                                                                        }
                                                                                                        integration: {
                                                                                                            softwareCompatibility: ['Maya', 'Houdini', 'Blender', 'Unreal Engine'];
                                                                                                            pipelineStage: 'previs';
                                                                                                            qualityLevel: 'final';
                                                                                                            lastValidated: new Date().toISOString();
                                                                                                            validationNotes: ['Camera parameters validated for epic fantasy composition'];
                                                                                                        }
                                                                                                        subjects: {
                                                                                                            dragon_ancient_red: {
                                                                                                                tag: '[SUBJ:DRAGON_ANCIENT_RED]';
                                                                                                                description: 'Primary creature subject - ancient red dragon with majestic presence';
                                                                                                                controlNetParameters: {
                                                                                                                    pose: {
                                                                                                                        enabled: true;
                                                                                                                        strength: 0.9;
                                                                                                                        preprocessor: 'animal_pose';
                                                                                                                        detectHands: false;
                                                                                                                        detectFace: true;
                                                                                                                    }
                                                                                                                    depth: {
                                                                                                                        enabled: true, strength;
                                                                                                                        0.7, preprocessor;
                                                                                                                        'midas', guidanceScale;
                                                                                                                        8.0;
                                                                                                                    }
                                                                                                                    segmentation: {
                                                                                                                        enabled: true, strength;
                                                                                                                        0.6, preprocessor;
                                                                                                                        'seg';
                                                                                                                    }
                                                                                                                    renderingHints: {
                                                                                                                        subjectScale: 0.8;
                                                                                                                        detailLevel: 'hero';
                                                                                                                        materialType: 'organic_scales';
                                                                                                                        animationReady: true;
                                                                                                                        priorityLevel: 'critical';
                                                                                                                        processingOrder: 2;
                                                                                                                    }
                                                                                                                    integration: {
                                                                                                                        softwareCompatibility: ['Maya', 'Houdini', 'Blender', 'ZBrush'];
                                                                                                                        pipelineStage: 'animation';
                                                                                                                        qualityLevel: 'final';
                                                                                                                        lastValidated: new Date().toISOString();
                                                                                                                        validationNotes: [
                                                                                                                            'Creature rigging verified',
                                                                                                                            'Animation controls tested',
                                                                                                                            'Material complexity approved'
                                                                                                                        ];
                                                                                                                    }
                                                                                                                    effects: {
                                                                                                                        atmospheric_mist_golden: {
                                                                                                                            ;
                                                                                                                            tag: '[FX:ATMOSPHERIC_MIST_GOLDEN]';
                                                                                                                            description: 'Atmospheric mist effects with golden hour lighting';
                                                                                                                            controlNetParameters: { }
                                                                                                                            depth: {
                                                                                                                                enabled: true, strength;
                                                                                                                                0.5, preprocessor;
                                                                                                                                'midas', guidanceScale;
                                                                                                                                6.0;
                                                                                                                            }
                                                                                                                            normal: {
                                                                                                                                enabled: true, strength;
                                                                                                                                0.4, preprocessor;
                                                                                                                                'normal';
                                                                                                                            }
                                                                                                                            scribble: {
                                                                                                                                enabled: false, strength;
                                                                                                                                0.0, preprocessor;
                                                                                                                                'scribble';
                                                                                                                            }
                                                                                                                            renderingHints: {
                                                                                                                                mistDensity: 0.3;
                                                                                                                                lightingTemperature: 3200;
                                                                                                                                atmosphericPerspective: true;
                                                                                                                                volumetricLighting: true;
                                                                                                                                priorityLevel: 'medium';
                                                                                                                                processingOrder: 3;
                                                                                                                            }
                                                                                                                            integration: {
                                                                                                                                softwareCompatibility: ['Houdini', 'Maya', 'Nuke', 'After Effects'];
                                                                                                                                pipelineStage: 'compositing';
                                                                                                                                qualityLevel: 'final';
                                                                                                                                lastValidated: new Date().toISOString();
                                                                                                                                validationNotes: [
                                                                                                                                    'Atmospheric effects validated for golden hour lighting',
                                                                                                                                    'Volumetric rendering tested'
                                                                                                                                ];
                                                                                                                            }
                                                                                                                            marsIntegration: {
                                                                                                                                enabled: true;
                                                                                                                                globalSettings: {
                                                                                                                                    baseStrength: 0.7;
                                                                                                                                    adaptiveWeighting: true;
                                                                                                                                    cascadeMode: false;
                                                                                                                                }
                                                                                                                                tagProcessingOrder: [
                                                                                                                                    '[CAM:WIDE_LOW_ANGLE]',
                                                                                                                                    '[SUBJ:DRAGON_ANCIENT_RED]',
                                                                                                                                    '[FX: ATMOSPHERIC_MIST_GOLDEN]'
                                                                                                                                ];
                                                                                                                            }
                                                                                                                            ;
                                                                                                                            // Simulate validation
                                                                                                                            const mockValidation = {
                                                                                                                                isValid: true,
                                                                                                                                errors: [],
                                                                                                                                warnings: exportData.export_options?.include_debug_info
                                                                                                                                    ? ['Debug mode enabled - not recommended for production']
                                                                                                                                    : [],
                                                                                                                                compatibility: {
                                                                                                                                    controlNet: exportData.export_options?.enable_controlnet_support || true,
                                                                                                                                    animation: exportData.export_options?.enable_animation_framework || true,
                                                                                                                                    rendering: exportData.export_options?.include_rendering_data || true,
                                                                                                                                    reproducibility: {
                                                                                                                                        exact: exportData.export_options?.exact_reproduction || true,
                                                                                                                                        approximate: true,
                                                                                                                                        configPreserved: exportData.export_options?.preserve_node_configuration || true,
                                                                                                                                        weightsPreserved: true
                                                                                                                                    }
                                                                                                                                },
                                                                                                                                onValidationComplete
                                                                                                                            }(mockValidation.isValid, mockValidation);
                                                                                                                            try {
                                                                                                                            }
                                                                                                                            catch (error) {
                                                                                                                                console.error('Preview generation failed:', error);
                                                                                                                                const errorValidation = {
                                                                                                                                    isValid: false,
                                                                                                                                    errors: ['Failed to generate preview'],
                                                                                                                                    warnings: [],
                                                                                                                                    compatibility: {
                                                                                                                                        controlNet: false,
                                                                                                                                        animation: false,
                                                                                                                                        rendering: false
                                                                                                                                    }
                                                                                                                                };
                                                                                                                                setValidation(errorValidation);
                                                                                                                                onValidationComplete?.(false, errorValidation);
                                                                                                                                try {
                                                                                                                                }
                                                                                                                                finally {
                                                                                                                                    setLoading(false);
                                                                                                                                }
                                                                                                                            }
                                                                                                                            ;
                                                                                                                            if (loading) {
                                                                                                                                return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600 dark:text-gray-300", children: "Generating VFX export preview..." }), " }"] }));
                                                                                                                                if (!previewData || !validation) {
                                                                                                                                    return _jsx("div", { className: "text-center p-8 text-gray-500 dark:text-gray-400", children: "Failed to generate preview" });
                                                                                                                                }
                                                                                                                                const renderPreviewTab = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: "Export Overview" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FiFile, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Format" }), _jsxs("p", { className: "font-medium text-gray-900 dark:text-white", children: ["VFX Pipeline v", previewData.metadata?.version] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FiSettings, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Quality" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white capitalize", children: previewData.metadata?.export.quality })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FiTarget, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "ControlNet" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: previewData.metadata?.compatibility.controlNet ? 'Enabled' : 'Disabled' })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FiClock, { className: "w-5 h-5 text-orange-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Animation" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: previewData.metadata?.compatibility.animationFramework ? 'Enabled' : 'Disabled' })] })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: "Prompt Preview" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-2", children: "Final Prompt" }), _jsx("p", { className: "text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded", children: previewData.prompt?.finalPrompt })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: Object.entries(previewData.prompt?.components || {}).map(([category, items]) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 capitalize", children: category }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: items.map((item, index) => (_jsx("span", { className: "inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded", children: item }, index))) })] }, category))) })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-3", children: "Pipeline Compatibility" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                                                                                                                                                        { label: 'Maya + Arnold', compatible: true },
                                                                                                                                                        { label: 'Houdini + Mantra', compatible: true },
                                                                                                                                                        { label: 'Blender + Cycles', compatible: true },
                                                                                                                                                        { label: 'Nuke Compositing', compatible: true },
                                                                                                                                                        { label: 'Unreal Engine', compatible: validation.compatibility.animation },
                                                                                                                                                        { label: 'ControlNet Pipeline', compatible: validation.compatibility.controlNet }
                                                                                                                                                    ].map(item => (_jsxs("div", { className: "flex items-center space-x-3", children: [item.compatible ? (_jsx(FiCheck, { className: "w-5 h-5 text-green-600" })) : (_jsx(FiX, { className: "w-5 h-5 text-red-600" })), _jsx("span", { className: `${item.compatible ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`, children: item.label })] }, item.label))) })] })] }));
                                                                                                                                const renderValidationTab = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 ${validation.isValid
                                                                                                                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                                                                                                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}
`, children: _jsxs("div", { className: "flex items-center", children: [validation.isValid ? (_jsx(FiCheck, { className: "w-6 h-6 text-green-600 mr-3" })) : (_jsx(FiX, { className: "w-6 h-6 text-red-600 mr-3" })), _jsxs("div", { children: [_jsx("h4", { className: `text-lg font-semibold ${validation.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}
`, children: validation.isValid ? 'Export Valid' : 'Export Invalid' }), _jsx("p", { className: `text-sm ${validation.isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}
`, children: validation.isValid
                                                                                                                                                                    ? 'Export is ready for VFX pipeline integration'
                                                                                                                                                                    : 'Export has validation errors that must be resolved' })] })] }) }), validation.errors.length > 0 && (_jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(FiX, { className: "w-5 h-5 text-red-600 mr-2" }), _jsx("h4", { className: "font-semibold text-red-800 dark:text-red-200", children: "Errors" })] }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: validation.errors.map((error, index) => (_jsx("li", { className: "text-sm text-red-700 dark:text-red-300", children: error }, index))) })] })), validation.warnings.length > 0 && (_jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(FiAlertTriangle, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsx("h4", { className: "font-semibold text-yellow-800 dark:text-yellow-200", children: "Warnings" })] }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: validation.warnings.map((warning, index) => (_jsx("li", { className: "text-sm text-yellow-700 dark:text-yellow-300", children: warning }, index))) })] })), _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Compatibility Analysis" }), _jsx("div", { className: "space-y-4", children: [
                                                                                                                                                        {
                                                                                                                                                            label: 'ControlNet Support',
                                                                                                                                                            status: validation.compatibility.controlNet,
                                                                                                                                                            description: 'Enables AI-driven pose and composition control'
                                                                                                                                                        },
                                                                                                                                                        { label: 'Animation Framework',
                                                                                                                                                            status: validation.compatibility.animation,
                                                                                                                                                            description: 'Supports keyframe animation and video generation' },
                                                                                                                                                        { label: 'Rendering Pipeline',
                                                                                                                                                            status: validation.compatibility.rendering,
                                                                                                                                                            description: 'Compatible with professional rendering engines' },
                                                                                                                                                        { label: 'Exact Reproducibility',
                                                                                                                                                            status: validation.compatibility.reproducibility?.exact || false,
                                                                                                                                                            description: 'Can reproduce identical results with same seed' }
                                                                                                                                                    ].map(item => (_jsxs("div", { className: "flex items-start space-x-3", children: [item.status ? (_jsx(FiCheck, { className: "w-5 h-5 text-green-600 mt-0.5" })) : (_jsx(FiX, { className: "w-5 h-5 text-red-600 mt-0.5" })), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: item.label }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: item.description })] })] }, item.label))) })] })] }));
                                                                                                                                const renderJsonTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Export JSON Preview" }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300", children: [_jsx(FiInfo, { className: "w-4 h-4" }), _jsx("span", { children: "Showing first 50 lines" })] })] }), _jsx("div", { className: "bg-gray-900 rounded-lg p-4 overflow-x-auto", children: _jsx("pre", { className: "text-sm text-gray-300", children: _jsxs("code", { children: [JSON.stringify(previewData, null, 2).split('\n').slice(0, 50).join('\n'), JSON.stringify(previewData, null, 2).split('\n').length > 50 ? '\n  ...' : ''] }) }) })] }));
                                                                                                                                return (_jsxs("div", { className: "vfx-export-preview", children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-700 mb-6", children: _jsx("nav", { className: "flex space-x-8", children: [
                                                                                                                                                    { id: 'preview', label: 'Preview', icon: FiEye },
                                                                                                                                                    { id: 'validation', label: 'Validation', icon: FiCheck },
                                                                                                                                                    { id: 'json', label: 'JSON', icon: FiCode }
                                                                                                                                                ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                                                                                                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                                                                                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id))) }) }), _jsxs("div", { className: "max-h-96 overflow-y-auto", children: [activeTab === 'preview' && renderPreviewTab(), activeTab === 'validation' && renderValidationTab(), activeTab === 'json' && renderJsonTab()] })] }));
                                                                                                                                ;
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
