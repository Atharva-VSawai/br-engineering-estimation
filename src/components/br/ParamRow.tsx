'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';

interface ParamRowProps {
  label: string;
  children: React.ReactNode;
  description?: string;
}

export function ParamRow({ label, children, description }: ParamRowProps) {
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">{label}</Label>
        {description && (
          <span className="text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
      {children}
    </div>
  );
}

interface NumberFieldProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  unit?: string;
  className?: string;
  disabled?: boolean;
  valid?: boolean;
}

export function NumberField({ value, onChange, min = 0, max = 9999, placeholder, unit, className = '', disabled, valid }: NumberFieldProps) {
  const showIndicator = valid !== undefined;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
            else if (e.target.value === '') onChange(min);
          }}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-8 w-28 text-sm transition-colors duration-150 ${showIndicator ? 'pr-8' : ''}`}
        />
        {valid === true && (
          <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
        )}
        {valid === false && (
          <X className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-400 pointer-events-none" />
        )}
      </div>
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </div>
  );
}

interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  className?: string;
  valid?: boolean;
}

export function SelectField({ value, onChange, options, placeholder, className = '', valid }: SelectFieldProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-8 w-full max-w-xs text-sm transition-colors duration-150 ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-sm">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {valid === true && (
        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      )}
      {valid === false && (
        <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
      )}
    </div>
  );
}

interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  valid?: boolean;
}

export function TextField({ value, onChange, placeholder, className = '', valid }: TextFieldProps) {
  const showIndicator = valid !== undefined;
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-8 text-sm transition-colors duration-150 ${showIndicator ? 'pr-8' : ''} ${className}`}
      />
      {valid === true && (
        <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
      )}
      {valid === false && (
        <X className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-400 pointer-events-none" />
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  valid?: boolean;
}

export function TextAreaField({ value, onChange, placeholder, rows = 3, className = '', valid }: TextAreaFieldProps) {
  const showIndicator = valid !== undefined;
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`text-sm resize-none transition-colors duration-150 ${showIndicator ? 'pr-8' : ''} ${className}`}
      />
      {valid === true && (
        <Check className="absolute right-2 top-3 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
      )}
      {valid === false && (
        <X className="absolute right-2 top-3 h-3.5 w-3.5 text-red-400 pointer-events-none" />
      )}
    </div>
  );
}

interface ToggleFieldProps {
  label?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}

export function ToggleField({ checked, onChange, description }: ToggleFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-primary transition-colors duration-150" />
      {description && <span className="text-[11px] text-muted-foreground">{description}</span>}
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}

export function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1 group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-input text-primary accent-primary cursor-pointer"
      />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{label}</span>
        {description && <span className="text-[11px] text-muted-foreground">{description}</span>}
      </div>
    </label>
  );
}
