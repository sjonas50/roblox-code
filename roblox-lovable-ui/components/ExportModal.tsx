"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { ExportService } from "@/services/exportService";
import { ProjectStorageService } from "@/services/projectStorage";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export default function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'rbxmx' | 'rojo' | 'zip'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      switch (exportFormat) {
        case 'json': {
          const data = ProjectStorageService.exportProject(project.id);
          downloadFile(
            data,
            `${project.name.replace(/\s+/g, '_')}_backup.json`,
            'application/json'
          );
          setExportStatus({ type: 'success', message: 'Project exported as JSON backup' });
          break;
        }
        
        case 'rbxmx': {
          const xml = await ExportService.exportAsRobloxModel(project.id);
          downloadFile(
            xml,
            `${project.name.replace(/\s+/g, '_')}.rbxmx`,
            'application/xml'
          );
          setExportStatus({ type: 'success', message: 'Project exported as Roblox Model' });
          break;
        }
        
        case 'rojo': {
          const { files, projectJson } = ExportService.exportAsRojoProject(project.id);
          
          // For now, just export the project.json
          // In a real app, you'd create a proper ZIP with all files
          downloadFile(
            projectJson,
            'default.project.json',
            'application/json'
          );
          
          // Also generate a README
          const readme = ExportService.generateReadme(project.id);
          setTimeout(() => {
            downloadFile(readme, 'README.md', 'text/markdown');
          }, 500);
          
          setExportStatus({ 
            type: 'success', 
            message: 'Rojo project files exported. Note: Scripts need to be manually saved to their folders.' 
          });
          break;
        }
        
        case 'zip': {
          const blob = await ExportService.exportAsZip(project.id);
          downloadBlob(
            blob,
            `${project.name.replace(/\s+/g, '_')}_project.txt`
          );
          setExportStatus({ type: 'success', message: 'Project exported as archive' });
          break;
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Export failed' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const exportOptions = [
    {
      value: 'json' as const,
      label: 'JSON Backup',
      description: 'Complete project backup that can be imported later',
      icon: '💾'
    },
    {
      value: 'rbxmx' as const,
      label: 'Roblox Model',
      description: 'Import directly into Roblox Studio',
      icon: '🎮'
    },
    {
      value: 'rojo' as const,
      label: 'Rojo Project',
      description: 'Professional workflow with version control',
      icon: '📁'
    },
    {
      value: 'zip' as const,
      label: 'Archive',
      description: 'All scripts in a simple text format',
      icon: '📦'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Export Project</h2>
        
        <p className="text-gray-400 mb-6">
          Export "{project.name}" in your preferred format
        </p>

        {/* Export Format Selection */}
        <div className="space-y-3 mb-6">
          {exportOptions.map(option => (
            <label
              key={option.value}
              className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                exportFormat === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value={option.value}
                  checked={exportFormat === option.value}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium text-white">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Status Message */}
        {exportStatus && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            exportStatus.type === 'success' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {exportStatus.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isExporting}
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}