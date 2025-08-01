// Epic 17.1.5 - Feature Toggle Scheduling API Routes

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SchedulingService } from '../services/scheduling-service';
import {
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleQuery,
  ScheduleType,
  ScheduleAction,
  ScheduleStatus
 from '../database/scheduling-models';

// Request type definitions



interface CreateScheduleRequestBody {
  Body: CreateScheduleRequest;







interface UpdateScheduleRequestBody {
  Body: UpdateScheduleRequest;



  Params: { id: string };




interface GetScheduleRequest {
  Params: { id: string };




interface QuerySchedulesRequest {
  Querystring: {
    toggleId?: string;
    status?: ScheduleStatus;
    type?: ScheduleType;
    startDate?: string;
    endDate?: string;
    timezone?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
    sortBy?: 'startTime' | 'createdAt' | 'priority' | 'status';
    sortOrder?: 'asc' | 'desc';



  };




interface DeleteScheduleRequest {
  Params: { id: string };




interface GetExecutionsRequest {
  Params: { scheduleId: string };
  Querystring: { limit?: number };




interface BulkActionRequest {
  Body: {
    scheduleIds: string[];
    action: 'cancel' | 'pause' | 'resume' | 'delete';
    reason?: string;



  };




interface ManualExecuteRequest {
  Params: { id: string };
  Body: { reason?: string };


export async function schedulingRoutes(fastify: FastifyInstance) {
  const schedulingService: SchedulingService = fastify.schedulingService;

  // Create a new schedule
  fastify.post<CreateScheduleRequestBody>('/schedules', {
    schema: {
      description: 'Create a new feature toggle schedule',
      tags: ['Scheduling'],
      body: {
        type: 'object',
        required: ['toggleId', 'name', 'type', 'action', 'startTime', 'timezone', 'actionConfig'],
        properties: {
          toggleId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: Object.values(ScheduleType) },
          action: { type: 'string', enum: Object.values(ScheduleAction) },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          timezone: { type: 'string' },
          recurrence: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'] },
              interval: { type: 'number', minimum: 1 },
              daysOfWeek: { type: 'array', items: { type: 'number', minimum: 0, maximum: 6 } },
              daysOfMonth: { type: 'array', items: { type: 'number', minimum: 1, maximum: 31 } },
              monthsOfYear: { type: 'array', items: { type: 'number', minimum: 1, maximum: 12 } },
              cronExpression: { type: 'string' },
              maxOccurrences: { type: 'number', minimum: 1 },
              endDate: { type: 'string', format: 'date-time' }


          actionConfig: {
            type: 'object',
            properties: {
              targetValue: {},
              rolloutPercentage: { type: 'number', minimum: 0, maximum: 100 },
              conditions: { type: 'array' },
              gradualRollout: {
                type: 'object',
                properties: {
                  startPercentage: { type: 'number', minimum: 0, maximum: 100 },
                  endPercentage: { type: 'number', minimum: 0, maximum: 100 },
                  incrementMinutes: { type: 'number', minimum: 1 }




          priority: { type: 'number', default: 0 },
          conflictResolution: { type: 'string', enum: ['skip', 'override', 'merge'], default: 'skip' }


      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }




  }, async (request: FastifyRequest<CreateScheduleRequestBody>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'anonymous';
      const schedule = await schedulingService.createSchedule(request.body, userId);
      
      reply.code(201).send({
        success: true,
        data: schedule
      });
 catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });

  });

  // Get a specific schedule
  fastify.get<GetScheduleRequest>('/schedules/:id', {
    schema: {
      description: 'Get a schedule by ID',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']


  }, async (request: FastifyRequest<GetScheduleRequest>, reply: FastifyReply) => {
    try {
      const schedule = await schedulingService.getSchedule(request.params.id);
      
      if (!schedule) {
        return reply.code(404).send({
          success: false,
          error: 'Schedule not found'
        });


      reply.send({
        success: true,
        data: schedule
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Query schedules
  fastify.get<QuerySchedulesRequest>('/schedules', {
    schema: {
      description: 'Query schedules with filters',
      tags: ['Scheduling'],
      querystring: {
        type: 'object',
        properties: {
          toggleId: { type: 'string' },
          status: { type: 'string', enum: Object.values(ScheduleStatus) },
          type: { type: 'string', enum: Object.values(ScheduleType) },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          timezone: { type: 'string' },
          createdBy: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          sortBy: { type: 'string', enum: ['startTime', 'createdAt', 'priority', 'status'], default: 'startTime' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }



  }, async (request: FastifyRequest<QuerySchedulesRequest>, reply: FastifyReply) => {
    try {
      const result = await schedulingService.querySchedules(request.query);
      
      reply.send({
        success: true,
        data: result.schedules,
        pagination: {
          page: request.query.page || 1,
          limit: request.query.limit || 50,
          total: result.total,
          totalPages: Math.ceil(result.total / (request.query.limit || 50))

      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Update a schedule
  fastify.put<UpdateScheduleRequestBody>('/schedules/:id', {
    schema: {
      description: 'Update a schedule',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']

      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          timezone: { type: 'string' },
          recurrence: { type: 'object' },
          actionConfig: { type: 'object' },
          priority: { type: 'number' },
          conflictResolution: { type: 'string', enum: ['skip', 'override', 'merge'] },
          enabled: { type: 'boolean' },
          reason: { type: 'string' }



  }, async (request: FastifyRequest<UpdateScheduleRequestBody>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'anonymous';
      const updateRequest = { ...request.body, id: request.params.id };
      const schedule = await schedulingService.updateSchedule(updateRequest, userId);
      
      if (!schedule) {
        return reply.code(404).send({
          success: false,
          error: 'Schedule not found'
        });


      reply.send({
        success: true,
        data: schedule
      });
 catch (error: any) {
      reply.code(400).send({
        success: false,
        error: error.message
      });

  });

  // Delete a schedule
  fastify.delete<DeleteScheduleRequest>('/schedules/:id', {
    schema: {
      description: 'Delete a schedule',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']


  }, async (request: FastifyRequest<DeleteScheduleRequest>, reply: FastifyReply) => {
    try {
      const deleted = await schedulingService.deleteSchedule(request.params.id);
      
      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: 'Schedule not found'
        });


      reply.send({
        success: true,
        message: 'Schedule deleted successfully'
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Get schedule executions
  fastify.get<GetExecutionsRequest>('/schedules/:scheduleId/executions', {
    schema: {
      description: 'Get execution history for a schedule',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { scheduleId: { type: 'string' } },
        required: ['scheduleId']

      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 }



  }, async (request: FastifyRequest<GetExecutionsRequest>, reply: FastifyReply) => {
    try {
      const executions = await schedulingService.getExecutionsBySchedule(
        request.params.scheduleId,
        request.query.limit
      );
      
      reply.send({
        success: true,
        data: executions
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Manual execution
  fastify.post<ManualExecuteRequest>('/schedules/:id/execute', {
    schema: {
      description: 'Manually execute a schedule',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']

      body: {
        type: 'object',
        properties: {
          reason: { type: 'string' }



  }, async (request: FastifyRequest<ManualExecuteRequest>, reply: FastifyReply) => {
    try {
      const schedule = await schedulingService.getSchedule(request.params.id);
      if (!schedule) {
        return reply.code(404).send({
          success: false,
          error: 'Schedule not found'
        });


      // This would trigger immediate execution
      // For now, we'll update the next execution time to now
      const userId = request.user?.id || 'anonymous';
      await schedulingService.updateSchedule(
        { 
          id: request.params.id, 
          nextExecution: new Date(),
          reason: request.body.reason || 'Manual execution'

        userId
      );

      reply.send({
        success: true,
        message: 'Schedule execution triggered'
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Bulk operations
  fastify.post<BulkActionRequest>('/schedules/bulk', {
    schema: {
      description: 'Perform bulk operations on schedules',
      tags: ['Scheduling'],
      body: {
        type: 'object',
        required: ['scheduleIds', 'action'],
        properties: {
          scheduleIds: { type: 'array', items: { type: 'string' } },
          action: { type: 'string', enum: ['cancel', 'pause', 'resume', 'delete'] },
          reason: { type: 'string' }



  }, async (request: FastifyRequest<BulkActionRequest>, reply: FastifyReply) => {
    try {
      const { scheduleIds, action, reason } = request.body;
      const userId = request.user?.id || 'anonymous';
      const results = [];

      for (const scheduleId of scheduleIds) {
        try {
          let result;
          switch (action) {
          case 'cancel':
            result = await schedulingService.updateSchedule(
              { id: scheduleId, status: ScheduleStatus.CANCELLED, reason },
              userId
            );
            break;
          case 'pause':
            result = await schedulingService.updateSchedule(
              { id: scheduleId, enabled: false, reason },
              userId
            );
            break;
          case 'resume':
            result = await schedulingService.updateSchedule(
              { id: scheduleId, enabled: true, reason },
              userId
            );
            break;
          case 'delete':
            const deleted = await schedulingService.deleteSchedule(scheduleId);
            result = deleted ? { id: scheduleId, deleted: true } : null;
            break;


          results.push({
            scheduleId,
            success: !!result,
            data: result
          });
 catch (error: any) {
          results.push({
            scheduleId,
            success: false,
            error: error.message
          });



      reply.send({
        success: true,
        data: results
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Get conflicts
  fastify.get('/schedules/conflicts', {
    schema: {
      description: 'Get unresolved schedule conflicts',
      tags: ['Scheduling']

  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const conflicts = await schedulingService.getUnresolvedConflicts();
      
      reply.send({
        success: true,
        data: conflicts
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Get analytics
  fastify.get('/schedules/analytics', {
    schema: {
      description: 'Get scheduling analytics',
      tags: ['Scheduling'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }



  }, async (request: FastifyRequest<{ Querystring: { startDate?: string; endDate?: string } }>, reply: FastifyReply) => {
    try {
      const startDate = request.query.startDate ? new Date(request.query.startDate) : undefined;
      const endDate = request.query.endDate ? new Date(request.query.endDate) : undefined;
      
      const analytics = await schedulingService.getScheduleAnalytics(startDate, endDate);
      
      reply.send({
        success: true,
        data: analytics
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });

  // Get schedules by toggle
  fastify.get<{ Params: { toggleId: string } }>('/schedules/toggle/:toggleId', {
    schema: {
      description: 'Get all schedules for a specific toggle',
      tags: ['Scheduling'],
      params: {
        type: 'object',
        properties: { toggleId: { type: 'string' } },
        required: ['toggleId']


  }, async (request: FastifyRequest<{ Params: { toggleId: string } }>, reply: FastifyReply) => {
    try {
      const schedules = await schedulingService.getSchedulesByToggle(request.params.toggleId);
      
      reply.send({
        success: true,
        data: schedules
      });
 catch (error: any) {
      reply.code(500).send({
        success: false,
        error: error.message
      });

  });
