import { nestAPI } from "@/config/apiClient";
import {
  LoginPayload,
  LoginResponse,
  PreAuth,
  PreAuthPayload,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/types/Auth";
import { Service, CreateServicePayload } from "@/types/Service";
import {
  Agent,
  CreateAgentPayload,
  AgentTestResponse,
} from "@/types/Agentia";

// ——— USER —————————————————————————————
export const getUser = async (): Promise<User> => {
  return await nestAPI.get<User, User>("/user/profile");
};

// ——— AUTHENTICATION ————————————————————————
export const preAuth = async ({
                                email,
                                role,
                              }: PreAuthPayload): Promise<PreAuth> => {
  return await nestAPI.post<PreAuthPayload, PreAuth>("/auth/pre-auth", {
    email,
    role,
  });
};

export const signIn = async ({
                               email,
                               password,
                             }: LoginPayload): Promise<LoginResponse> => {
  return await nestAPI.post<LoginPayload, LoginResponse>("/auth/login", {
    email,
    password,
  });
};

export const signUp = async ({
                               firstName,
                               lastName,
                               email,
                               password,
                               role,
                             }: RegisterPayload): Promise<RegisterResponse> => {
  return await nestAPI.post<RegisterPayload, RegisterResponse>(
      "/auth/register",
      {
        firstName,
        lastName,
        email,
        password,
        role,
      }
  );
};

// ——— SERVICES ————————————————————————
export const fetchServices = async (): Promise<Service[]> => {
  return await nestAPI.get<Service[], Service[]>("/services");
};

export const createService = async (
    serviceData: CreateServicePayload
): Promise<Service> => {
  return await nestAPI.post<CreateServicePayload, Service>("/services", serviceData);
};

export const updateServiceStatus = async (
    serviceId: string,
    status: Service["status"]
): Promise<Service> => {
  return await nestAPI.patch<Service, Service>(
      `/services/${serviceId}/status`,
      { status }
  );
};

// ——— AGENTIA ———————————————————————————————
export const getAgents = async (): Promise<Agent[]> => {
  return await nestAPI.get<unknown, Agent[]>("/agentia");
};

export const createAgent = async (
    payload: CreateAgentPayload
): Promise<Agent> => {
  return await nestAPI.post<CreateAgentPayload, Agent>(
      "/agentia/create",
      payload
  );
};

export const testAgentConnection = async ({
                                            apiKey,
                                            apiUrl,
                                            model,
                                          }: {
  apiKey?: string;
  apiUrl: string;
  model: string;
}): Promise<AgentTestResponse> => {
  return await nestAPI.post<
      { apiKey?: string; apiUrl: string; model: string },
      AgentTestResponse
  >("/agentia/test-connection", { apiKey, apiUrl, model });
};
