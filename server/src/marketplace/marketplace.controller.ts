// Epic 16 Marketplace Controller
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/middleware/jwt-auth.guard';
import { RolesGuard } from '../auth/middleware/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  SearchFilters,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  CreateVersionSchema,
  CreateReviewSchema,
  CreatePurchaseSchema,
  PreviewRequest
} from './types';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // Template endpoints
  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTemplate(@Request() req: any, @Body() templateData: any) {
    return this.marketplaceService.createTemplate(req.user.id, templateData);
  }

  @Get('templates/search')
  @ApiOperation({ summary: 'Search templates in the marketplace' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'categories', required: false, description: 'Category filters (comma-separated)' })
  @ApiQuery({ name: 'tags', required: false, description: 'Tag filters (comma-separated)' })
  @ApiQuery({ name: 'price_min', required: false, type: Number, description: 'Minimum price in cents' })
  @ApiQuery({ name: 'price_max', required: false, type: Number, description: 'Maximum price in cents' })
  @ApiQuery({ name: 'rating_min', required: false, type: Number, description: 'Minimum rating (1-5)' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'popularity', 'newest', 'oldest'] })
  @ApiQuery({ name: 'is_free', required: false, type: Boolean, description: 'Filter for free templates' })
  @ApiQuery({ name: 'is_featured', required: false, type: Boolean, description: 'Filter for featured templates' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  async searchTemplates(
    @Query('query') query?: string,
    @Query('categories') categories?: string,
    @Query('tags') tags?: string,
    @Query('price_min', new DefaultValuePipe(0), ParseIntPipe) price_min?: number,
    @Query('price_max') price_max?: number,
    @Query('rating_min') rating_min?: number,
    @Query('sort_by', new DefaultValuePipe('relevance')) sort_by?: string,
    @Query('is_free') is_free?: boolean,
    @Query('is_featured') is_featured?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Request() req?: any
  ) {
    const filters: SearchFilters = {
      query,
      categories: categories ? categories.split(',').map(c => c.trim()) : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      price_min,
      price_max: price_max ? parseInt(price_max.toString()) : undefined,
      rating_min: rating_min ? parseFloat(rating_min.toString()) : undefined,
      sort_by: sort_by as any,
      is_free,
      is_featured,
      page,
      limit: Math.min(limit, 100)
    };

    const userId = req?.user?.id;
    return this.marketplaceService.searchTemplates(filters, userId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template details' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template details returned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Template not accessible' })
  async getTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id;
    return this.marketplaceService.getTemplate(id, userId);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this template' })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updates: any,
    @Request() req: any
  ) {
    return this.marketplaceService.updateTemplate(id, req.user.id, updates);
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 204, description: 'Template archived successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this template' })
  async deleteTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ) {
    await this.marketplaceService.deleteTemplate(id, req.user.id);
  }

  // Version endpoints
  @Post('templates/:id/versions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new version of a template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to create versions for this template' })
  async createVersion(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Body() versionData: any,
    @Request() req: any
  ) {
    return this.marketplaceService.createVersion(templateId, req.user.id, versionData);
  }

  @Get('templates/:id/versions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all versions of a template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template versions returned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to view template versions' })
  async getTemplateVersions(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Request() req: any
  ) {
    return this.marketplaceService.getTemplateVersions(templateId, req.user.id);
  }

  @Get('versions/:id')
  @ApiOperation({ summary: 'Get specific version details' })
  @ApiParam({ name: 'id', description: 'Version UUID' })
  @ApiResponse({ status: 200, description: 'Version details returned successfully' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.getVersion(id);
  }

  // Purchase endpoints
  @Post('purchases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a template' })
  @ApiResponse({ status: 201, description: 'Purchase initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid purchase data' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async createPurchase(
    @Body() purchaseData: any,
    @Request() req: any
  ) {
    return this.marketplaceService.createPurchase(req.user.id, purchaseData);
  }

  @Get('purchases/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user purchases' })
  @ApiResponse({ status: 200, description: 'User purchases returned successfully' })
  async getUserPurchases(@Request() req: any) {
    return this.marketplaceService.getUserPurchases(req.user.id);
  }

  // Review endpoints
  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a template' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid review data or user has not purchased template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async createReview(
    @Body() reviewData: any,
    @Request() req: any
  ) {
    return this.marketplaceService.createReview(req.user.id, reviewData);
  }

  @Get('templates/:id/reviews')
  @ApiOperation({ summary: 'Get reviews for a template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template reviews returned successfully' })
  async getTemplateReviews(@Param('id', ParseUUIDPipe) templateId: string) {
    return this.marketplaceService.getTemplateReviews(templateId);
  }

  // Preview endpoints
  @Post('templates/:id/preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview template output' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        version_id: { type: 'string', format: 'uuid', description: 'Specific version to preview (optional)' },
        user_input: { type: 'object', description: 'Input parameters for the template' },
        claude_model_override: { type: 'string', description: 'Override Claude model for preview' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Preview generated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Template preview not available' })
  async previewTemplate(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Body() body: any,
    @Request() req: any
  ) {
    const request: PreviewRequest = {
      template_id: templateId,
      version_id: body.version_id,
      user_input: body.user_input,
      claude_model_override: body.claude_model_override
    };

    return this.marketplaceService.previewTemplate(req.user.id, request);
  }

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all template categories' })
  @ApiResponse({ status: 200, description: 'Categories returned successfully' })
  async getCategories() {
    return this.marketplaceService.getCategories();
  }

  // Analytics endpoints (for creators)
  @Get('templates/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template analytics' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Analytics returned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to view analytics for this template' })
  async getTemplateAnalytics(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Request() req: any
  ) {
    return this.marketplaceService.getTemplateAnalytics(templateId, req.user.id);
  }

  // Admin endpoints
  @Post('search/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Refresh search index (admin only)' })
  @ApiResponse({ status: 204, description: 'Search index refreshed successfully' })
  async refreshSearchIndex() {
    await this.marketplaceService.refreshSearchIndex();
  }
}