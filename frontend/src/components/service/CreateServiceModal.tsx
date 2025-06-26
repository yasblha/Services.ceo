"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateServiceData,
  createServiceSchema,
} from "@/schemas/serviceSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ServiceAgentForm } from "./ServiceAgentForm";
import { ServiceBasicInfoForm } from "./ServiceBasicInfoForm";
import { ServiceConfigForm } from "./ServiceConfigForm";
import { ServiceTestForm } from "./ServiceTestForm";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceData) => void;
}

const steps = [
  { title: "Informations de base", component: ServiceBasicInfoForm },
  { title: "Sélection de l'agent", component: ServiceAgentForm },
  { title: "Configuration", component: ServiceConfigForm },
  { title: "Test et validation", component: ServiceTestForm },
];

export function CreateServiceModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<CreateServiceData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      organizationId: "",
      price: 0,
      agent: "",
      model: "",
      inputs: [{ name: "", type: "text", description: "", required: true }],
      outputs: [{ name: "", type: "text", description: "" }],
      prompt: "",
      testData: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    formState: { isValid },
  } = form;

  const totalSteps = steps.length;

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: CreateServiceData) => {
    onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    form.reset();
    onClose();
  };

  const getFieldsForStep = (step: number): (keyof CreateServiceData)[] => {
    switch (step) {
      case 0:
        return ["name", "description", "category", "organizationId", "price"];
      case 1:
        return ["agent", "model"];
      case 2:
        return ["inputs", "outputs", "prompt"];
      case 3:
        return ["testData"];
      default:
        return [];
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau service</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="min-h-[400px]">
              <CurrentStepComponent />
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              {currentStep === totalSteps - 1 ? (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  Créer le service
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
