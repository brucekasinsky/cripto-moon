'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImportConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (config: ImportConfig) => void;
}

interface ImportConfig {
  targetPath: string;
  sourcePath: string;
  includeSubdirectories: boolean;
  overwriteExisting: boolean;
}

export function ImportConfigurationModal({ isOpen, onClose, onImport }: ImportConfigurationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<ImportConfig>({
    targetPath: '', // Inicializa vazio para permitir input personalizado
    sourcePath: '',
    includeSubdirectories: false,
    overwriteExisting: false
  });

  const handleTargetPathChange = (value: string) => {
    // CORREÇÃO: Sempre usa o valor digitado pelo usuário
    setConfig(prev => ({
      ...prev,
      targetPath: value
    }));
  };

  const handleImport = () => {
    onImport(config);
    onClose();
  };

  const steps = [
    { id: 1, title: 'Select Source', description: 'Choose what to import' },
    { id: 2, title: 'Configure Options', description: 'Set import preferences' },
    { id: 3, title: 'Review', description: 'Review your selection' },
    { id: 4, title: 'Configure Import', description: 'Set target path and finalize' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Configuration</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 4: Configure Import</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set the target path for imported pages:
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPath">Target Path:</Label>
                  <div className="space-y-2">
                    <Input
                      id="targetPath"
                      value={config.targetPath}
                      onChange={(e) => handleTargetPathChange(e.target.value)}
                      placeholder="Enter your custom path (e.g., /my-custom-path)"
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Current value: <Badge variant="outline">{config.targetPath || 'No path set'}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourcePath">Source Path:</Label>
                  <Input
                    id="sourcePath"
                    value={config.sourcePath}
                    onChange={(e) => setConfig(prev => ({ ...prev, sourcePath: e.target.value }))}
                    placeholder="Source path to import from"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSubdirectories"
                    checked={config.includeSubdirectories}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      includeSubdirectories: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeSubdirectories" className="text-sm">
                    Include subdirectories
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overwriteExisting"
                    checked={config.overwriteExisting}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      overwriteExisting: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="overwriteExisting" className="text-sm">
                    Overwrite existing files
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div>Repository name: <Badge variant="secondary">next-shadcn-dashboard-starter</Badge></div>
                  <div>User input: <Badge variant="outline">{config.targetPath || 'Empty'}</Badge></div>
                  <div>Final path: <Badge variant="default">{config.targetPath || 'No path set'}</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep === 4 ? (
              <Button onClick={handleImport}>
                Import
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


