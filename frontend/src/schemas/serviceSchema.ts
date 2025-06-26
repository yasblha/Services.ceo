import { z } from "zod";

export const serviceBasicInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du service est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .min(1, "La description est requise")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  organizationId: z
    .string()
    .min(1, "L'organisation est requise"),
  price: z
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .positive("Le prix doit être positif"),
});

export const serviceAgentSchema = z.object({
  agent: z.string().min(1, "Vous devez sélectionner un agent"),
  model: z.string().min(1, "Le modèle est requis"),
});

export const serviceInputOutputSchema = z.object({
  inputs: z
    .array(
      z.object({
        name: z.string().min(1, "Le nom du paramètre est requis"),
        type: z.enum(["text", "number", "boolean", "file"]),
        description: z.string().optional(),
        required: z.boolean().default(false),
      })
    )
    .min(1, "Au moins une entrée est requise"),
  outputs: z
    .array(
      z.object({
        name: z.string().min(1, "Le nom de la sortie est requis"),
        type: z.enum(["text", "json", "file"]),
        description: z.string().optional(),
      })
    )
    .min(1, "Au moins une sortie est requise"),
  prompt: z
    .string()
    .min(1, "Le prompt est requis")
    .max(2000, "Le prompt ne peut pas dépasser 2000 caractères"),
});

export const serviceTestSchema = z.object({
  testData: z.string().optional(),
});

export const createServiceSchema = serviceBasicInfoSchema
  .merge(serviceAgentSchema)
  .merge(serviceInputOutputSchema)
  .merge(serviceTestSchema);

export type ServiceBasicInfo = z.infer<typeof serviceBasicInfoSchema>;
export type ServiceAgent = z.infer<typeof serviceAgentSchema>;
export type ServiceInputOutput = z.infer<typeof serviceInputOutputSchema>;
export type ServiceTest = z.infer<typeof serviceTestSchema>;
export type CreateServiceData = z.infer<typeof createServiceSchema>;
