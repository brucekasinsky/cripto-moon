'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImportConfigurationModal } from '@/components/modals/import-configuration-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImportConfig {
  targetPath: string;
  sourcePath: string;
  includeSubdirectories: boolean;
  overwriteExisting: boolean;
}

export function ImportModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastImportConfig, setLastImportConfig] = useState<ImportConfig | null>(null);

  const handleImport = (config: ImportConfig) => {
    setLastImportConfig(config);
    
    // Aqui você processaria a importação usando o config.targetPath
    // que contém o valor REAL digitado pelo usuário
    alert(`Importing to: ${config.targetPath}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Modal Example</CardTitle>
          <p className="text-sm text-muted-foreground">
            Este exemplo demonstra como implementar corretamente um modal de configuração de importação
            que respeita o input do usuário no campo &quot;Target Path&quot;.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setIsModalOpen(true)}>
            Abrir Modal de Importação
          </Button>

          {lastImportConfig && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Última Configuração de Importação:</h4>
              <div className="space-y-1 text-xs">
                <div>Target Path: <Badge variant="outline">{lastImportConfig.targetPath}</Badge></div>
                <div>Source Path: <Badge variant="outline">{lastImportConfig.sourcePath}</Badge></div>
                <div>Include Subdirectories: <Badge variant={lastImportConfig.includeSubdirectories ? "default" : "secondary"}>
                  {lastImportConfig.includeSubdirectories ? "Yes" : "No"}
                </Badge></div>
                <div>Overwrite Existing: <Badge variant={lastImportConfig.overwriteExisting ? "default" : "secondary"}>
                  {lastImportConfig.overwriteExisting ? "Yes" : "No"}
                </Badge></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problema Identificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              ❌ Comportamento Incorreto:
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              O modal atual sempre usa o nome do repositório como path, ignorando o input do usuário.
              Independente do que você digite em &quot;Target Path&quot;, ele sempre usa &quot;next-shadcn-dashboard-starter&quot;.
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              ✅ Solução Implementada:
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              O novo modal sempre usa o valor digitado pelo usuário no campo &quot;Target Path&quot;.
              O estado é atualizado corretamente com <code>handleTargetPathChange</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      <ImportConfigurationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

