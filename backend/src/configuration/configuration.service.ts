import { Injectable, NotFoundException } from '@nestjs/common';
import Ajv from 'ajv';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
    ServiceConfiguration,
    ConfigurationResponse,
    UpdateConfigurationDto
} from './types/configuration.type';
import { ServiceVersionService } from '../service-version/service-version.service';


@Injectable()
export class ConfigurationService {
    constructor(
        private prisma: PrismaService,
        private versioning: ServiceVersionService,
    ) {}

    async createDefaultConfig(serviceId: string, createdById: string): Promise<ServiceConfiguration> {
        const defaultConfig = {
            inputSchema: { type: 'object', properties: {} } as Prisma.InputJsonValue,
            outputSchema: { type: 'object', properties: {} } as Prisma.InputJsonValue,
            constraints: {} as Prisma.InputJsonValue,
            requirements: [] as Prisma.InputJsonValue,
            systemPrompt: '',
            userPrompt: '',
            metadata: {
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: createdById
            } as Prisma.InputJsonValue
        };

        const config = await this.prisma.serviceConfig.create({
            data: {
                ...defaultConfig
            }
        });

        await this.prisma.service.update({
            where: { id: serviceId },
            data: { config: { connect: { id: config.id } } }
        });

        return this.mapToServiceConfiguration(config);
    }

    async getByServiceId(serviceId: string): Promise<ConfigurationResponse> {
        const config = await this.prisma.serviceConfig.findFirst({
            where: {
                service: { id: serviceId }
            }
        });

        if (!config) {
            throw new NotFoundException(`Configuration for service ${serviceId} not found`);
        }

        return {
            success: true,
            data: this.mapToServiceConfiguration(config),
            timestamp: new Date()
        };
    }

    async update(
        serviceId: string,
        updateData: UpdateConfigurationDto
    ): Promise<ConfigurationResponse> {
        const existing = await this.prisma.serviceConfig.findFirst({
            where: {
                service: { id: serviceId }
            }
        });

        if (!existing) {
                throw new NotFoundException(`Configuration for service ${serviceId} not found`);
            }

        const updatePayload: Prisma.ServiceConfigUpdateInput = {
            inputSchema: updateData.inputSchema as Prisma.InputJsonValue,
            outputSchema: updateData.outputSchema as Prisma.InputJsonValue,
            constraints: updateData.constraints as Prisma.InputJsonValue,
            requirements: updateData.requirements as Prisma.InputJsonValue,
            systemPrompt: updateData.systemPrompt,
            userPrompt: updateData.userPrompt,
            uiConfig: updateData.uiConfig as Prisma.InputJsonValue,
            validationRules: updateData.validationRules as unknown as Prisma.InputJsonValue,
            fallbackConfig: updateData.fallbackConfig as Prisma.InputJsonValue,
            metadata: {
                ...((existing?.metadata as object) || {}),
                ...(updateData.metadata || {}),
                updatedAt: new Date().toISOString()
            }
        };

        const updated = await this.prisma.serviceConfig.update({
            where: { id: existing.id },
            data: updatePayload
        });

        await this.versioning.createSnapshot(serviceId);

        return {
            success: true,
            data: this.mapToServiceConfiguration(updated),
            timestamp: new Date()
        };
    }

    async validateInput(serviceId: string, input: any): Promise<boolean> {
        const { data } = await this.getByServiceId(serviceId);
        if (!data) {
            return false;
        }

        const ajv = new Ajv({ allErrors: true, useDefaults: false });
        const validate = ajv.compile(data.inputSchema as object);
        const valid = validate(input);

        if (!valid) {
            const errors = validate.errors
                ?.map(e => `${(e as any).instancePath ?? e.dataPath} ${e.message}`)
                .join('; ');
            throw new Error(errors || 'Invalid input');

        }

        return true;
    }

    private mapToServiceConfiguration(config: any): ServiceConfiguration {
        return {
            inputSchema: config.inputSchema,
            outputSchema: config.outputSchema,
            constraints: config.constraints || [],
            requirements: config.requirements || [],
            systemPrompt: config.systemPrompt,
            userPrompt: config.userPrompt,
            uiConfig: config.uiConfig || {},
            validationRules: config.validationRules || [],
            fallbackConfig: config.fallbackConfig || null,
            metadata: {
                ...(config.metadata || {}),
                updatedAt: config.updatedAt
            }
        } as ServiceConfiguration;
    }

    async buildAiRequest(serviceId: string, rawInput: any): Promise<Record<string, any>> {
        const { data } = await this.getByServiceId(serviceId);

        if (!data) {
            throw new NotFoundException(`Configuration for service ${serviceId} not found`);
        }

        const cfg = data;

        return {
            system: cfg.systemPrompt,
            user: cfg.userPrompt,
            input: rawInput,
            meta: cfg.metadata,
            constraints: cfg.constraints,
            requirements: cfg.requirements,
            uiConfig: cfg.uiConfig,
            validationRules: cfg.validationRules,
            fallbackConfig: cfg.fallbackConfig,
        };
    }
}