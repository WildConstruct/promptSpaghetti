// Epic 16.2.1 Template Submission Routes
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SubmissionService } from './submission.service';
import { SubmissionStatus } from './submission.types';

export async function submissionRoutes(fastify: FastifyInstance) {
  const submissionService = new SubmissionService(fastify.pg);

  // Authentication middleware
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
 catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });

  };

  // Create new submission
  fastify.post('/submissions', {
    preHandler: authenticate,
    schema: {
      body: {
        type: 'object',
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          submission_data: {
            type: 'object',
            required: ['title', 'description', 'tags', 'categories', 'graph_json', 'intended_use_cases', 'example_outputs'],
            properties: {
              title: { type: 'string', minLength: 1, maxLength: 255 },
              description: { type: 'string', minLength: 10, maxLength: 2000 },
              tags: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 20 },
              categories: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
              price_cents: { type: 'integer', minimum: 0, maximum: 100000 },
              is_ai_generated: { type: 'boolean' },
              claude_compat: { type: 'array', items: { type: 'string' }, minItems: 1 },
              claude_model: { type: 'string' },
              graph_json: { type: 'object' },
              prompt_yaml: { type: 'string' },
              changelog_md: { type: 'string' },
              token_per_run_estimate: { type: 'integer', minimum: 0 },
              intended_use_cases: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 },
              technical_requirements: { type: 'array', items: { type: 'string' }, maxItems: 20 },
              example_outputs: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
              documentation_md: { type: 'string' },
              moderation_notes: { type: 'string' },
              is_first_submission: { type: 'boolean' },
              previous_version_id: { type: 'string', format: 'uuid' }




      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            template_id: { type: 'string' },
            status: { type: 'string' },
            validation_results: { type: 'array' },
            created_at: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest<{
    Body: {
      template_id?: string;
      submission_data: any;

>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submission = await submissionService.createSubmission(userId, request.body);
      
      reply.code(201).send({
        id: submission.id,
        template_id: submission.template_id,
        status: submission.status,
        validation_results: submission.validation_results,
        created_at: submission.created_at
      });
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to create submission' });

  });

  // Get submission by ID
  fastify.get('/submissions/:id', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }

        required: ['id']

      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            template_id: { type: 'string' },
            submitter_id: { type: 'string' },
            version_number: { type: 'integer' },
            status: { type: 'string' },
            submission_data: { type: 'object' },
            validation_results: { type: 'array' },
            review_comments: { type: 'string' },
            review_score: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest<{
    Params: { id: string }
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submission = await submissionService.getSubmission(request.params.id, userId);
      
      if (!submission) {
        return reply.code(404).send({ error: 'Submission not found' });

      
      reply.send(submission);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get submission' });

  });

  // Update submission
  fastify.put('/submissions/:id', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }

        required: ['id']

      body: {
        type: 'object',
        properties: {
          submission_data: { type: 'object' },
          status: { type: 'string', enum: ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected'] }



  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: {
      submission_data?: any;
      status?: SubmissionStatus;

>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submission = await submissionService.updateSubmission(request.params.id, userId, request.body);
      
      reply.send(submission);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to update submission' });

  });

  // Submit for review
  fastify.post('/submissions/:id/submit', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }

        required: ['id']


  }, async (request: FastifyRequest<{
    Params: { id: string }
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submission = await submissionService.submitForReview(request.params.id, userId);
      
      reply.send(submission);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to submit for review' });

  });

  // Get user's submissions
  fastify.get('/submissions', {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }


      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              template_id: { type: 'string' },
              status: { type: 'string' },
              version_number: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }





  }, async (request: FastifyRequest<{
    Querystring: { limit?: number }
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submissions = await submissionService.getUserSubmissions(userId, request.query.limit);
      
      reply.send(submissions);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get submissions' });

  });

  // Get submissions for review (admin only)
  fastify.get('/submissions/review-queue', {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['submitted', 'under_review', 'changes_requested'] },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }


      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              template_id: { type: 'string' },
              status: { type: 'string' },
              submitter_id: { type: 'string' },
              version_number: { type: 'integer' },
              submitted_at: { type: 'string', format: 'date-time' },
              validation_results: { type: 'array' }





  }, async (request: FastifyRequest<{
    Querystring: { status?: SubmissionStatus; limit?: number }
>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const submissions = await submissionService.getSubmissionsForReview(
        userId, 
        request.query.status, 
        request.query.limit
      );
      
      reply.send(submissions);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to get review queue' });

  });

  // Create submission review (admin only)
  fastify.post('/submissions/:id/review', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }

        required: ['id']

      body: {
        type: 'object',
        required: ['decision', 'score', 'comments', 'detailed_feedback'],
        properties: {
          decision: { type: 'string', enum: ['approved', 'rejected', 'changes_requested'] },
          score: { type: 'integer', minimum: 1, maximum: 100 },
          comments: { type: 'string', minLength: 1, maxLength: 2000 },
          detailed_feedback: {
            type: 'array',
            minItems: 1,
            maxItems: 5,
            items: {
              type: 'object',
              required: ['category', 'rating', 'comments'],
              properties: {
                category: { type: 'string', enum: ['content', 'quality', 'compliance', 'usability', 'technical'] },
                rating: { type: 'integer', minimum: 1, maximum: 5 },
                comments: { type: 'string', minLength: 1, maxLength: 1000 },
                suggestions: { type: 'array', items: { type: 'string' }, maxItems: 10 }






  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: {
      decision: 'approved' | 'rejected' | 'changes_requested';
      score: number;
      comments: string;
      detailed_feedback: Array<{
        category: 'content' | 'quality' | 'compliance' | 'usability' | 'technical';
        rating: number;
        comments: string;
        suggestions: string[];
>;

>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const review = await submissionService.createReview(request.params.id, userId, request.body);
      
      reply.code(201).send(review);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to create review' });

  });

  // Upload file to submission
  fastify.post('/submissions/:id/files', {
    preHandler: authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }

        required: ['id']

      body: {
        type: 'object',
        required: ['file_type', 'filename', 'file_size', 'mime_type'],
        properties: {
          file_type: { type: 'string', enum: ['graph_json', 'prompt_yaml', 'asset_file', 'documentation'] },
          filename: { type: 'string', minLength: 1, maxLength: 255 },
          file_size: { type: 'integer', minimum: 1, maximum: 10485760 },
          mime_type: { type: 'string', minLength: 1 }



  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: {
      file_type: 'graph_json' | 'prompt_yaml' | 'asset_file' | 'documentation';
      filename: string;
      file_size: number;
      mime_type: string;

>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      const file = await submissionService.uploadFile(request.params.id, userId, request.body);
      
      reply.code(201).send(file);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: error instanceof Error ? error.message : 'Failed to upload file' });

  });

  // Get validation rules
  fastify.get('/submissions/validation-rules', {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          severity: { type: 'string', enum: ['error', 'warning', 'info'] },
          active_only: { type: 'boolean', default: true }



  }, async (request: FastifyRequest<{
    Querystring: {
      category?: string;
      severity?: 'error' | 'warning' | 'info';
      active_only?: boolean;

>, reply: FastifyReply) => {
    try {
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (request.query.active_only !== false) {
        conditions.push('is_active = true');


      if (request.query.category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(request.query.category);


      if (request.query.severity) {
        conditions.push(`severity = $${paramIndex++}`);
        params.push(request.query.severity);


      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const result = await fastify.pg.query(`
        SELECT rule_id, name, description, severity, category, auto_fixable, validation_logic
        FROM submission_validation_rules
        ${whereClause}
        ORDER BY severity DESC, category, name
      `, params);

      reply.send(result.rows);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: 'Failed to get validation rules' });

  });

  // Get submission statistics
  fastify.get('/submissions/stats', {
    preHandler: authenticate,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            total_submissions: { type: 'integer' },
            approved_submissions: { type: 'integer' },
            rejected_submissions: { type: 'integer' },
            pending_submissions: { type: 'integer' },
            avg_review_score: { type: 'number' },
            avg_review_time_hours: { type: 'number' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id;
      
      const result = await fastify.pg.query(`
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_submissions,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_submissions,
          COUNT(*) FILTER (WHERE status IN ('draft', 'submitted', 'under_review', 'changes_requested')) as pending_submissions,
          AVG(review_score) FILTER (WHERE review_score IS NOT NULL) as avg_review_score,
          AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 3600) FILTER (WHERE reviewed_at IS NOT NULL AND submitted_at IS NOT NULL) as avg_review_time_hours
        FROM template_submissions
        WHERE submitter_id = $1
      `, [userId]);

      reply.send(result.rows[0]);
 catch (error) {
      fastify.log.error(error);
      reply.code(400).send({ error: 'Failed to get submission statistics' });

  });
