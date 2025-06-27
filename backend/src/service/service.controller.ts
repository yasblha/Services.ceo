import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiParam, 
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Créer un nouveau service',
    description: 'Crée un nouveau service avec une configuration par défaut'
  })
  @ApiBody({ 
    type: CreateServiceDto,
    examples: {
      basic: {
        summary: 'Création basique',
        value: {
          name: 'Service de traduction',
          description: 'Traduction professionnelle',
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          authorId: '123e4567-e89b-12d3-a456-426614174001',
          price: 29.99
        }
      },
      full: {
        summary: 'Création complète',
        value: {
          name: 'Service de traduction premium',
          description: 'Traduction professionnelle avec relecture',
          category: 'traduction',
          organizationId: '123e4567-e89b-12d3-a456-426614174000',
          authorId: '123e4567-e89b-12d3-a456-426614174001',
          price: 59.99
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Le service a été créé avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Service de traduction',
        slug: 'service-1234567890',
        description: 'Traduction professionnelle',
        category: 'traduction',
        config: {
          id: '660e8400-e29b-41d4-a716-446655440000',
          inputSchema: {},
          outputSchema: {},
          constraints: {},
          requirements: [],
          systemPrompt: '',
          userPrompt: '',
          metadata: {
            price: 29.99,
            organizationId: '123e4567-e89b-12d3-a456-426614174000'
          }
        },
        createdBy: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'auteur@example.com'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Données invalides',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name should not be empty',
          'price must be a number'
        ],
        error: 'Bad Request'
      }
    }
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lister tous les services',
    description: 'Récupère la liste de tous les services disponibles'
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrer par catégorie',
    example: 'traduction'
  })
  @ApiOkResponse({
    description: 'Liste des services récupérée avec succès',
    schema: {
      example: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Service de traduction',
        slug: 'service-1234567890',
        description: 'Traduction professionnelle',
        category: 'traduction',
        createdBy: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'auteur@example.com'
        }
      }]
    }
  })
  async findAll(@Query('category') category?: string) {
    return this.serviceService.findAll(category);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ 
    summary: 'Lister les services par organisation',
    description: 'Récupère tous les services associés à une organisation spécifique'
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID unique de l\'organisation',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({
    description: 'Liste des services de l\'organisation récupérée avec succès'
  })
  getByOrganization(@Param('organizationId') organizationId: string) {
    return this.serviceService.findAll(undefined, organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un service par son ID' })
  @ApiParam({
    name: 'id',
    description: 'ID du service'
  })
  @ApiResponse({
    status: 200,
    description: 'Service récupéré avec succès'
  })
  @ApiResponse({
    status: 404,
    description: 'Service non trouvé'
  })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un service' })
  @ApiParam({
    name: 'id',
    description: 'ID du service à mettre à jour'
  })
  @ApiResponse({
    status: 200,
    description: 'Service mis à jour avec succès'
  })
  @ApiResponse({
    status: 404,
    description: 'Service non trouvé'
  })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un service' })
  @ApiParam({
    name: 'id',
    description: 'ID du service à supprimer'
  })
  @ApiResponse({
    status: 200,
    description: 'Service supprimé avec succès'
  })
  @ApiResponse({
    status: 404,
    description: 'Service non trouvé'
  })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}