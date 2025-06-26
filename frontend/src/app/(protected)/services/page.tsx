"use client";

import { CreateServiceModal } from "@/components/service/CreateServiceModal";
import { ServiceCard } from "@/components/service/ServiceCard";
import { StatsCard } from "@/components/service/StatsCard";
import { Button } from "@/components/ui/button";
import { createService, fetchServices, updateServiceStatus } from "@/lib/api";
import { CreateServiceData } from "@/schemas/serviceSchema";
import { Service, CreateServicePayload } from "@/types/Service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Plus, Settings, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ServicesFromDb } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  useEffect(() => {
    if (ServicesFromDb) {
      const mapped = ServicesFromDb.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        category: s.category || "",
        status: s.isActive ? "active" : "inactive",
        agent: "",
        model: "",
        lastUsed: "",
        usageCount: 0,
        isPublic: false,
      }));
      setServices(mapped);
    }
  }, [ServicesFromDb]);

  const { mutate: newService } = useMutation({
    mutationFn: createService,
    onSuccess: (data) => {
      setIsCreateModalOpen(false);
    },
  });

  const { mutateAsync: serviceStatusChange } = useMutation({
    mutationFn: updateServiceStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });

  const activeServices = services.filter((s) => s.status === "active").length;
  const testingServices = services.filter((s) => s.status === "testing").length;
  const inactiveServices = services.filter(
    (s) => s.status === "inactive"
  ).length;
  const publicServices = services.filter((s) => s.isPublic).length;

  const handleCreateService = (serviceData: CreateServiceData) => {
    const payload: CreateServicePayload = {
      title: serviceData.name,
      description: serviceData.description,
      category: serviceData.category,
      organizationId: serviceData.organizationId,
      price: serviceData.price,
    };
    newService(payload);
  };

  const handleStatusChange = (serviceId: string, status: Service["status"]) => {
    serviceStatusChange({ serviceId, status });
  };

  const handleEdit = (serviceId: string) => {
    console.log("Edit service:", serviceId);
  };

  const handleDelete = (serviceId: string) => {
    setServices(services.filter((service) => service.id !== serviceId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            </div>
            <p className="text-gray-600">
              Gérez vos services IA et leurs configurations
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un service
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Services"
            value={services.length}
            icon={Settings}
            color="text-gray-400"
          />
          <StatsCard
            title="Actifs"
            value={activeServices}
            icon={CheckCircle}
            color="text-green-500"
          />
          <StatsCard
            title="En test"
            value={testingServices}
            icon={Settings}
            color="text-yellow-500"
          />
          <StatsCard
            title="Publics"
            value={publicServices}
            icon={Users}
            color="text-blue-500"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Create Service Modal */}
        <CreateServiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateService}
        />
      </div>
    </div>
  );
}
