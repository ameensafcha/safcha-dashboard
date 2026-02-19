'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export type FieldConfig<T extends string> = {
  name: T;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'number' | 'date' | 'textarea';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  colSpan?: number;
};

type FormDialogProps<T extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValues?: Record<string, unknown>;
  fields: FieldConfig<T>[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gridCols?: 1 | 2;
};

export function FormDialog<T extends string>({
  open,
  onOpenChange,
  title,
  description,
  defaultValues = {},
  fields,
  onSubmit,
  loading = false,
  submitLabel = 'Save',
  size = 'md',
  gridCols = 1,
}: FormDialogProps<T>) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [wasOpen, setWasOpen] = useState(false);

  const stableDefaults = useMemo(() => defaultValues, [defaultValues]);

  useEffect(() => {
    if (open && !wasOpen) {
      setFormData(stableDefaults || {});
    }
    setWasOpen(open);
  }, [open, wasOpen, stableDefaults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-[350px]',
    md: 'max-w-[450px]',
    lg: 'max-w-[600px]',
    xl: 'max-w-[800px]',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={`grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 grid-cols-1 ${gridCols === 2 ? 'md:grid-cols-2' : ''}`}>
            {fields.map((field) => (
              <div
                key={field.name}
                className={`grid gap-2 ${field.type === 'checkbox' ? 'flex items-center gap-2 h-end pb-2' : ''
                  } ${field.colSpan === 2 ? 'col-span-1 md:col-span-2' : ''}`}
              >
                {field.type !== 'checkbox' && (
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                )}
                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    value={String(formData[field.name] || '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    required={field.required}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    id={field.name}
                    type="number"
                    value={String(formData[field.name] ?? '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    required={field.required}
                    min={0}
                    step="0.01"
                  />
                )}
                {field.type === 'date' && (
                  <Input
                    id={field.name}
                    type="date"
                    value={
                      formData[field.name]
                        ? String(formData[field.name]).split('T')[0]
                        : ''
                    }
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.disabled || loading}
                    required={field.required}
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    value={String(formData[field.name] || '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    required={field.required}
                    rows={3}
                  />
                )}
                {field.type === 'select' && (
                  <Select
                    value={String(formData[field.name] || '')}
                    onValueChange={(value) => handleChange(field.name, value)}
                    disabled={field.disabled || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={Boolean(formData[field.name])}
                      onCheckedChange={(checked) =>
                        handleChange(field.name, checked)
                      }
                      disabled={field.disabled || loading}
                    />
                    <Label htmlFor={field.name} className="font-normal">
                      {field.label}
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
