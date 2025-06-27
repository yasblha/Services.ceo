import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Prisma } from '@prisma/client';
import { ServiceVersionService } from '../service-version/service-version.service';


@Injectable()
export class ServiceService {
    constructor(
        private prisma: PrismaService,
        private versioning: ServiceVersionService,
    ) {}

    async create(createServiceDto: CreateServiceDto) {
        const { name, description, category, organizationId, authorId, price } = createServiceDto;

        const serviceConfig = await this.prisma.serviceConfig.create({
            data: {
                inputSchema: {},
                outputSchema: {},
                constraints: {},
                requirements: [],
                systemPrompt: '',
                userPrompt: '',
                metadata: {
                    price,
                    organizationId
                }
            }
        });

        return this.prisma.service.create({
            data: {
                name,
                slug: `service-${Date.now()}`,
                description,
                category: category || 'default',
                config: { connect: { id: serviceConfig.id } },
                createdBy: { connect: { id: authorId } },
                organizationId
            },
            include: {
                config: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
    }

    async findAll(category?: string, organizationId?: string) {
        const where: Prisma.ServiceWhereInput = {};

        if (category) {
            where.category = category;
        }

        if (organizationId) {
            where.config = {
                is: {
                    metadata: {
                        path: ['organizationId'],
                        equals: organizationId
                    } as Prisma.JsonFilter
                }
            } as Prisma.ServiceConfigScalarRelationFilter;
        }
        return this.prisma.service.findMany({
            where,
            include: {
                config: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: { config: true }
        });

        if (!service) {
            throw new NotFoundException('Service non trouvé');
        }

        return service;
    }

    async update(id: string, updateData: any) {
        await this.findOne(id);

        const updated = await this.prisma.service.update({
            where: { id },
            data: updateData,
            include: { config: true }
        });

        await this.versioning.createSnapshot(id);

        return updated;
    }

    async remove(id: string) {
        // Vérifier que le service existe
        await this.findOne(id);

        return this.prisma.service.delete({
            where: { id }
        });
    }
}