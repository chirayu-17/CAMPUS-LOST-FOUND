import React, { useState, useRef } from 'react';
import { X, Upload, Check, Trash2, Shield, Radio, Key, Compass } from 'lucide-react';

export type LogoPreset = 'shield' | 'radar' | 'key' | 'compass';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomLogo: string;
  currentPreset: LogoPreset;
  onSave: (customLogoUrl: string, preset: LogoPreset) => void;
}

export const renderPresetLogoSvg = (preset: LogoPreset, className = 'w-5 h-5') => {
  switch (preset) {
    case 'shield':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L3 7V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V7L12 2Z" />
          <circle cx="12" cy="11.5" r="3" />
          <path d="M14.2 13.8L17 16.5" />
          <circle cx="12" cy="11.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'radar':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'key':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="m10.7 12.3 8.3-8.3a2.1 2.1 0 0 1 3 3L20 9l-2-2-2 2-2-2" />
          <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'compass':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
  }
};

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentCustomLogo,
  currentPreset,
  onSave,
}) => {
  const [customLogo, setCustomLogo] = useState<string>(currentCustomLogo);
  const [selectedPreset, setSelectedPreset] = useState<LogoPreset>(currentPreset);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCustomLogo(result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    onSave(customLogo, selectedPreset);
    onClose();
  };

  const presets: { id: LogoPreset; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'shield',
      name: 'Campus Shield & Finder',
      desc: 'Institutional security emblem with search optic',
      icon: renderPresetLogoSvg('shield', 'w-6 h-6'),
    },
    {
      id: 'radar',
      name: 'Live Radar Beacon',
      desc: 'Signal broadcast for real-time recovery',
      icon: renderPresetLogoSvg('radar', 'w-6 h-6'),
    },
    {
      id: 'key',
      name: 'Found Property Tag',
      desc: 'Security key & physical asset emblem',
      icon: renderPresetLogoSvg('key', 'w-6 h-6'),
    },
    {
      id: 'compass',
      name: 'Campus Compass',
      desc: 'Navigational hub for lost items',
      icon: renderPresetLogoSvg('compass', 'w-6 h-6'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden mobile-drag-handle bg-neutral-300 dark:bg-neutral-700 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-neutral-200/90 dark:border-neutral-800/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">Customize Campus Logo</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                Choose an emblem or upload your official institution logo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition cursor-pointer text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Preview Bar */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Live Header Preview
            </label>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/90 dark:border-neutral-800/90 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-black shadow-xs shrink-0 border border-neutral-800 dark:border-neutral-200/90 overflow-hidden">
                {customLogo ? (
                  <img src={customLogo} alt="Preview Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  renderPresetLogoSvg(selectedPreset, 'w-6 h-6 stroke-[2.2]')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black tracking-tight text-neutral-900 dark:text-white truncate">
                  CAMPUS LOST & FOUND
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold truncate">
                  {customLogo ? 'Custom University / College Logo' : presets.find(p => p.id === selectedPreset)?.name}
                </div>
              </div>
              {customLogo && (
                <button
                  type="button"
                  onClick={() => setCustomLogo('')}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition cursor-pointer"
                  title="Remove uploaded logo"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Option A: Upload Custom Logo Image */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Upload Official School / College Logo
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50 dark:bg-neutral-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-600 dark:text-neutral-400" />
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                Drag & drop or <span className="underline">browse image</span>
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                PNG, SVG, JPG, WebP (Max 5MB)
              </p>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">{errorMsg}</p>
            )}
          </div>

          {/* Option B: Choose Built-in Institutional Emblem */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Or Choose Curated Emblem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset) => {
                const isSelected = !customLogo && selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCustomLogo('');
                      setSelectedPreset(preset.id);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-900 dark:text-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300/60 dark:border-neutral-700/60'
                      }`}
                    >
                      {preset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <p
                        className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${
                          isSelected
                            ? 'text-neutral-300 dark:text-neutral-700 font-medium'
                            : 'text-neutral-600 dark:text-neutral-400 font-normal'
                        }`}
                      >
                        {preset.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-black bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs border border-transparent dark:border-neutral-200"
          >
            Apply Logo
          </button>
        </div>
      </div>
    </div>
  );
};
