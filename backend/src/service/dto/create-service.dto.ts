import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateServiceDto {
    @ApiProperty({
        description: 'Nom du service',
        example: 'Service de traduction'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description: 'Description du service'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Catégorie du service',
        example: 'traduction'
    })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({
        description: 'ID de l\'organisation',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    organizationId: string;

    @ApiProperty({
        description: 'ID de l\'auteur',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsString()
    @IsNotEmpty()
    authorId: string;

    @ApiProperty({
        description: 'Prix du service',
        example: 99.99
    })
    @IsNumber()
    @IsNotEmpty()
    price: number;
}
