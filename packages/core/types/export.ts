import { z } from 'zod';

// Export Template Types
export const ExportFormatSchema = z.enum([)
  'json',
  'yaml', 
  'xml',
  'csv',
  'markdown',
  'pdf',
  'html',
  'zip',
  'vfx'  // Wild Construct VFX Pipeline Export Format
]);

export const TemplateTypeSchema = z.enum([)
  'full',
  'summary',
  'diff',
  'custom'
]);

export const ExportTemplateSchema = z.object({ )
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  // Template configuration
  export_format: ExportFormatSchema,
  template_type: TemplateTypeSchema,
  // Template settings
  include_metadata: z.boolean().default(true),
  include_attribution: z.boolean().default(true),
  include_history: z.boolean().default(false),
  include_branching: z.boolean().default(false),
  include_comments: z.boolean().default(false),
  include_attachments: z.boolean().default(false) }
  // Format-specific options
  format_options: z.record(z.unknown()).default({}),
  // Filtering options
  filter_options: z.record(z.unknown()).default({}),
  // Template content
  template_content: z.string().optional(),
  template_schema: z.record(z.unknown()).optional(),
  // Template metadata
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_public: z.boolean().default(false),
  is_system_template: z.boolean().default(false),
  // Usage statistics
  usage_count: z.number().int().min(0).default(0),
  last_used_at: z.string().datetime().optional();
  });

export const CreateExportTemplateSchema = ExportTemplateSchema.omit({ )
  id: true,
  created_at: true,
  updated_at: true,
  usage_count: true,
  last_used_at: true }
});

export const UpdateExportTemplateSchema = CreateExportTemplateSchema.partial();

// Export Job Types
export const ExportJobStatusSchema = z.enum([)
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
]);

export const ExportTypeSchema = z.enum([)
  'version',
  'branch',
  'comparison',
  'full_project'
]);

export const ExportJobSchema = z.object({ )
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  // Export configuration
  export_format: ExportFormatSchema,
  export_type: ExportTypeSchema }
  export_scope: z.record(z.unknown()).default({}),
  // Source data
  source_snapshot_id: z.string().uuid().optional(),
  source_branch_id: z.string().uuid().optional(),
  comparison_snapshot_id: z.string().uuid().optional(),
  // Export options
  export_options: z.record(z.unknown()).default({}),
  custom_filters: z.record(z.unknown()).default({}),
  // Job status
  status: ExportJobStatusSchema.default('pending'),
  progress_percentage: z.number().int().min(0).max(100).default(0),
  // Job results
  output_file_path: z.string().optional(),
  output_file_size: z.number().int().min(0).optional(),
  output_file_hash: z.string().max(64).optional(),
  download_url: z.string().url().optional(),
  expires_at: z.string().datetime().optional(),
  // Job metadata
  initiated_by: z.string().uuid(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  error_message: z.string().optional(),
  processing_log: z.string().optional(),
  // Performance metrics
  processing_duration: z.number().int().min(0).optional(),
  memory_usage: z.number().int().min(0).optional(),
  cpu_usage: z.number().min(0).max(100).optional();
  });

export const CreateExportJobSchema = ExportJobSchema.omit({ )
  id: true,
  started_at: true,
  status: true,
  progress_percentage: true,
  output_file_path: true,
  output_file_size: true,
  output_file_hash: true,
  download_url: true,
  completed_at: true,
  error_message: true,
  processing_log: true,
  processing_duration: true,
  memory_usage: true,
  cpu_usage: true }
});

export const UpdateExportJobSchema = z.object({ )
  status: ExportJobStatusSchema.optional(),
  progress_percentage: z.number().int().min(0).max(100).optional(),
  output_file_path: z.string().optional(),
  output_file_size: z.number().int().min(0).optional(),
  output_file_hash: z.string().max(64).optional(),
  download_url: z.string().url().optional(),
  expires_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  error_message: z.string().optional(),
  processing_log: z.string().optional(),
  processing_duration: z.number().int().min(0).optional(),
  memory_usage: z.number().int().min(0).optional(),
  cpu_usage: z.number().min(0).max(100).optional() }
});

// Export Schedule Types
export const ExportScheduleSchema = z.object({ )
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  template_id: z.string().uuid(),
  // Schedule configuration
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  is_enabled: z.boolean().default(true),
  // Schedule timing
  schedule_expression: z.string().min(1).max(100), // Cron expression
  timezone: z.string().default('UTC') }
  // Export configuration
  export_options: z.record(z.unknown()).default({}),
  notification_options: z.record(z.unknown()).default({}),
  // Schedule metadata
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Schedule statistics
  last_run_at: z.string().datetime().optional(),
  next_run_at: z.string().datetime().optional(),
  total_runs: z.number().int().min(0).default(0),
  successful_runs: z.number().int().min(0).default(0),
  failed_runs: z.number().int().min(0).default(0);
  });

export const CreateExportScheduleSchema = ExportScheduleSchema.omit({ )
  id: true,
  created_at: true,
  updated_at: true,
  last_run_at: true,
  next_run_at: true,
  total_runs: true,
  successful_runs: true,
  failed_runs: true }
});

export const UpdateExportScheduleSchema = CreateExportScheduleSchema.partial();

// Export Share Types
export const ShareAccessLevelSchema = z.enum([)
  'public',
  'password_protected', 
  'private'
]);

export const ExportShareSchema = z.object({ )
  id: z.string().uuid(),
  export_job_id: z.string().uuid(),
  // Share configuration
  share_token: z.string().min(1).max(255),
  access_level: ShareAccessLevelSchema.default('public'),
  password: z.string().optional(),
  description: z.string().optional(),
  // Access control
  max_downloads: z.number().int().min(1).optional(), // null for unlimited,
  download_count: z.number().int().min(0).default(0),
  allowed_ips: z.array(z.string()).default([]),
  // Share permissions
  allow_download: z.boolean().default(true),
  allow_preview: z.boolean().default(true),
  track_access: z.boolean().default(true),
  notify_on_access: z.boolean().default(false),
  // Share metadata
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  expires_in_days: z.number().int().min(1).optional(),
  is_active: z.boolean().default(true),
  // Share statistics
  last_accessed_at: z.string().datetime().optional(),
  access_count: z.number().int().min(0).default(0),
  // Share URL
  share_url: z.string().url().optional() }
});

export const CreateExportShareSchema = ExportShareSchema.omit({ )
  id: true,
  created_at: true,
  download_count: true,
  last_accessed_at: true,
  access_count: true }
});

export const UpdateExportShareSchema = z.object({ )
  share_name: z.string().max(255).optional(),
  password_protected: z.boolean().optional(),
  password_hash: z.string().max(255).optional(),
  allowed_downloads: z.number().int().optional(),
  allowed_ips: z.array(z.string()).optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().optional() }
});

// Export Analytics Types
export const ExportAnalyticsSchema = z.object({ )
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  export_job_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  // Analytics data
  export_format: ExportFormatSchema,
  export_size: z.number().int().min(0).optional(),
  processing_time: z.number().int().min(0).optional(),
  download_count: z.number().int().min(0).default(0),
  // User analytics
  user_id: z.string().uuid().optional(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
  // Temporal data
  exported_at: z.string().datetime(),
  date_bucket: z.string().date(),
  hour_bucket: z.string().datetime() }
});

export const CreateExportAnalyticsSchema = ExportAnalyticsSchema.omit({ )
  id: true,
  exported_at: true,
  date_bucket: true,
  hour_bucket: true }
});

// Export Format Definition Types
export const ExportFormatDefinitionSchema = z.object({ )
  id: z.string().uuid(),
  format_name: z.string().max(50),
  // Format specification
  display_name: z.string().min(1).max(100),
  description: z.string().optional(),
  file_extension: z.string().min(1).max(10),
  mime_type: z.string().min(1).max(100),
  // Format capabilities
  supports_metadata: z.boolean().default(true),
  supports_binary_data: z.boolean().default(false),
  supports_compression: z.boolean().default(false),
  supports_encryption: z.boolean().default(false),
  max_file_size: z.number().int().min(0).optional() }
  // Format configuration
  default_options: z.record(z.unknown()).default({}),
  validation_schema: z.record(z.unknown()).optional(),
  // Format status
  is_enabled: z.boolean().default(true),
  is_system_format: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime();
  });

export const CreateExportFormatDefinitionSchema = ExportFormatDefinitionSchema.omit({ )
  id: true,
  created_at: true,
  updated_at: true }
});

export const UpdateExportFormatDefinitionSchema = CreateExportFormatDefinitionSchema.partial();

// Export Options Types
export const CommonExportOptionsSchema = z.object({ )
  // Content options
  include_metadata: z.boolean().default(true),
  include_attribution: z.boolean().default(true),
  include_history: z.boolean().default(false),
  include_branching: z.boolean().default(false),
  include_comments: z.boolean().default(false),
  include_attachments: z.boolean().default(false),
  // Filtering options
  date_range: z.object({);
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional() }
}).optional(),
  user_filters: z.array(z.string().uuid()).optional(),
  // Output options
  compress_output: z.boolean().default(false),
  encrypt_output: z.boolean().default(false),
  encryption_key: z.string().optional();
  });

export const JsonExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  pretty: z.boolean().default(true),
  include_schema: z.boolean().default(false),
  array_format: z.boolean().default(false) }
});

export const YamlExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  include_comments: z.boolean().default(true),
  flow_style: z.boolean().default(false),
  explicit_start: z.boolean().default(false) }
});

export const XmlExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  pretty: z.boolean().default(true),
  include_schema: z.boolean().default(true),
  namespace: z.string().optional(),
  root_element: z.string().default('export') }
});

export const CsvExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  delimiter: z.string().default(','),
  include_headers: z.boolean().default(true),
  quote_all: z.boolean().default(false),
  flatten_objects: z.boolean().default(true) }
});

export const MarkdownExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  include_toc: z.boolean().default(true),
  format: z.enum(['github', 'commonmark']).default('github'),
  heading_level: z.number().int().min(1).max(6).default(1),
  code_blocks: z.boolean().default(true) }
});

export const PdfExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  page_size: z.enum(['A4', 'A3', 'Letter', 'Legal']).default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  include_images: z.boolean().default(true),
  font_size: z.number().min(8).max(24).default(12),
  margins: z.object({);
  top: z.number().min(0).default(20),
  right: z.number().min(0).default(20),
  bottom: z.number().min(0).default(20),
  left: z.number().min(0).default(20) }
}).default({ )
  top: 20,
  right: 20,
  bottom: 20,
  left: 20 }

});

export const HtmlExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  include_css: z.boolean().default(true),
  standalone: z.boolean().default(true),
  theme: z.enum(['default', 'dark', 'light']).default('default'),
  minify: z.boolean().default(false) }
});

export const ZipExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  compression_level: z.number().int().min(0).max(9).default(6),
  include_metadata: z.boolean().default(true),
  separate_files: z.boolean().default(false),
  folder_structure: z.boolean().default(true) }
});

export const VFXExportOptionsSchema = CommonExportOptionsSchema.extend({ )
  // Export quality level
  quality: z.enum(['production', 'preview', 'debug']).default('production'),
  // VFX-specific features
  include_debug_info: z.boolean().default(false),
  include_historical_data: z.boolean().default(true),
  include_performance_data: z.boolean().default(false),
  include_variant_data: z.boolean().default(true),
  // ControlNet compatibility
  enable_controlnet_support: z.boolean().default(true),
  // Animation support
  enable_animation_framework: z.boolean().default(true),
  // Rendering parameters
  include_rendering_data: z.boolean().default(true),
  include_camera_data: z.boolean().default(true),
  include_lighting_data: z.boolean().default(true),
  // Wild Construct ecosystem integration
  include_ecosystem_data: z.boolean().default(false),
  // Format compatibility
  format_version: z.string().default('1.2.0'),
  backwards_compatible: z.boolean().default(true),
  // Reproducibility options
  include_reproducibility_data: z.boolean().default(true),
  exact_reproduction: z.boolean().default(true),
  preserve_node_configuration: z.boolean().default(true),
  include_rng_states: z.boolean().default(true) }
});

// Export Result Types
export const ExportResultSchema = z.object({ )
  job_id: z.string().uuid(),
  status: ExportJobStatusSchema,
  download_url: z.string().url().optional(),
  file_size: z.number().int().min(0).optional(),
  expires_at: z.string().datetime().optional(),
  share_token: z.string().optional(),
  error_message: z.string().optional() }
});

export const ExportProgressSchema = z.object({ )
  job_id: z.string().uuid(),
  status: ExportJobStatusSchema,
  progress_percentage: z.number().int().min(0).max(100),
  current_step: z.string().optional(),
  estimated_completion: z.string().datetime().optional(),
  processing_log: z.string().optional() }
});

// Export Statistics Types
export const ExportStatisticsSchema = z.object({ )
  project_id: z.string().uuid(),
  total_exports: z.number().int().min(0),
  exports_by_format: z.record(ExportFormatSchema, z.number().int().min(0)),
  exports_by_type: z.record(ExportTypeSchema, z.number().int().min(0)),
  total_size: z.number().int().min(0),
  average_processing_time: z.number().min(0),
  most_used_templates: z.array(z.object({),
  template_id: z.string().uuid(),
  template_name: z.string(),
  usage_count: z.number().int().min(0) }
})),
  success_rate: z.number().min(0).max(100),
  last_export_at: z.string().datetime().optional();
  });

// TypeScript type exports
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type TemplateType = z.infer<typeof TemplateTypeSchema>;
export type ExportTemplate = z.infer<typeof ExportTemplateSchema>;
export type CreateExportTemplate = z.infer<typeof CreateExportTemplateSchema>;
export type UpdateExportTemplate = z.infer<typeof UpdateExportTemplateSchema>;

export type ExportJobStatus = z.infer<typeof ExportJobStatusSchema>;
export type ExportType = z.infer<typeof ExportTypeSchema>;
export type ExportJob = z.infer<typeof ExportJobSchema>;
export type CreateExportJob = z.infer<typeof CreateExportJobSchema>;
export type UpdateExportJob = z.infer<typeof UpdateExportJobSchema>;

export type ExportSchedule = z.infer<typeof ExportScheduleSchema>;
export type CreateExportSchedule = z.infer<typeof CreateExportScheduleSchema>;
export type UpdateExportSchedule = z.infer<typeof UpdateExportScheduleSchema>;

export type ExportShare = z.infer<typeof ExportShareSchema>;
export type CreateExportShare = z.infer<typeof CreateExportShareSchema>;
export type UpdateExportShare = z.infer<typeof UpdateExportShareSchema>;

export type ExportAnalytics = z.infer<typeof ExportAnalyticsSchema>;
export type CreateExportAnalytics = z.infer<typeof CreateExportAnalyticsSchema>;

export type ExportFormatDefinition = z.infer<typeof ExportFormatDefinitionSchema>;
export type CreateExportFormatDefinition = z.infer<typeof CreateExportFormatDefinitionSchema>;
export type UpdateExportFormatDefinition = z.infer<typeof UpdateExportFormatDefinitionSchema>;

export type CommonExportOptions = z.infer<typeof CommonExportOptionsSchema>;
export type JsonExportOptions = z.infer<typeof JsonExportOptionsSchema>;
export type YamlExportOptions = z.infer<typeof YamlExportOptionsSchema>;
export type XmlExportOptions = z.infer<typeof XmlExportOptionsSchema>;
export type CsvExportOptions = z.infer<typeof CsvExportOptionsSchema>;
export type MarkdownExportOptions = z.infer<typeof MarkdownExportOptionsSchema>;
export type PdfExportOptions = z.infer<typeof PdfExportOptionsSchema>;
export type HtmlExportOptions = z.infer<typeof HtmlExportOptionsSchema>;
export type ZipExportOptions = z.infer<typeof ZipExportOptionsSchema>;
export type VFXExportOptions = z.infer<typeof VFXExportOptionsSchema>;

export type ExportResult = z.infer<typeof ExportResultSchema>;
export type ExportProgress = z.infer<typeof ExportProgressSchema>;
export type ExportStatistics = z.infer<typeof ExportStatisticsSchema>;

// Helper types for API responses
export type ExportTemplateWithStats = ExportTemplate & { recent_jobs: ExportJob;
  avg_processing_time: number;
  success_rate: number };

export type ExportJobWithTemplate = ExportJob & { template: ExportTemplate | null }
  share: ExportShare | null;
};

export type ExportScheduleWithStats = ExportSchedule & { template: ExportTemplate;
  recent_jobs: ExportJob;
  next_scheduled_run: string };

// Validation helpers
export function validateExportOptions(format: ExportFormat, options: any) {
  switch (format) {
  case 'yaml':
    return YamlExportOptionsSchema.safeParse(options);
  case 'xml':
    return XmlExportOptionsSchema.safeParse(options);
  case 'csv':
    return CsvExportOptionsSchema.safeParse(options);
  case 'markdown':
    return MarkdownExportOptionsSchema.safeParse(options);
  case 'pdf':
    return PdfExportOptionsSchema.safeParse(options);
  case 'html':
    return HtmlExportOptionsSchema.safeParse(options);
  case 'zip':
    return ZipExportOptionsSchema.safeParse(options);
  case 'vfx':
    return VFXExportOptionsSchema.safeParse(options);
  default:
    return CommonExportOptionsSchema.safeParse(options);

// Constants
export const MAX_EXPORT_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// TypeScript type exports
export type ShareAccessLevel = z.infer<typeof ShareAccessLevelSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type TemplateType = z.infer<typeof TemplateTypeSchema>;
export type ExportType = z.infer<typeof ExportTypeSchema>;
export type ExportJobStatus = z.infer<typeof ExportJobStatusSchema>;
export type ExportTemplate = z.infer<typeof ExportTemplateSchema>;
export type CreateExportTemplate = z.infer<typeof CreateExportTemplateSchema>;
export type UpdateExportTemplate = z.infer<typeof UpdateExportTemplateSchema>;
export type ExportJob = z.infer<typeof ExportJobSchema>;
export type CreateExportJob = z.infer<typeof CreateExportJobSchema>;
export type UpdateExportJob = z.infer<typeof UpdateExportJobSchema>;
export type ExportSchedule = z.infer<typeof ExportScheduleSchema>;
export type CreateExportSchedule = z.infer<typeof CreateExportScheduleSchema>;
export type UpdateExportSchedule = z.infer<typeof UpdateExportScheduleSchema>;
export type ExportShare = z.infer<typeof ExportShareSchema>;
export type CreateExportShare = z.infer<typeof CreateExportShareSchema>;
export type UpdateExportShare = z.infer<typeof UpdateExportShareSchema>;
export type ExportAnalytics = z.infer<typeof ExportAnalyticsSchema>;
export type CreateExportAnalytics = z.infer<typeof CreateExportAnalyticsSchema>;
export type ExportFormatDefinition = z.infer<typeof ExportFormatDefinitionSchema>;
export type CreateExportFormatDefinition = z.infer<typeof CreateExportFormatDefinitionSchema>;
export type UpdateExportFormatDefinition = z.infer<typeof UpdateExportFormatDefinitionSchema>;
export type CommonExportOptions = z.infer<typeof CommonExportOptionsSchema>;
export type JsonExportOptions = z.infer<typeof JsonExportOptionsSchema>;
export type YamlExportOptions = z.infer<typeof YamlExportOptionsSchema>;
export type XmlExportOptions = z.infer<typeof XmlExportOptionsSchema>;
export type CsvExportOptions = z.infer<typeof CsvExportOptionsSchema>;
export type MarkdownExportOptions = z.infer<typeof MarkdownExportOptionsSchema>;
export type PdfExportOptions = z.infer<typeof PdfExportOptionsSchema>;
export type HtmlExportOptions = z.infer<typeof HtmlExportOptionsSchema>;
export type ZipExportOptions = z.infer<typeof ZipExportOptionsSchema>;
export type ExportStatistics = z.infer<typeof ExportStatisticsSchema>;