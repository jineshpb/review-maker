// Form field type enum
export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  TOGGLE = "toggle",
  SLIDER = "slider",
  NUMBER = "number",
  DATE = "date",
  COLOR_PICKER = "colorPicker",
}

// Base form field definition
export interface BaseFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

// Input field (text, email, etc.)
export interface InputField extends BaseFormField {
  type: FormFieldType.INPUT;
  inputType?: "text" | "email" | "url";
}

// Textarea field
export interface TextareaField extends BaseFormField {
  type: FormFieldType.TEXTAREA;
  rows?: number;
}

// Toggle/Switch field
export interface ToggleField extends BaseFormField {
  type: FormFieldType.TOGGLE;
}

// Slider field
export interface SliderField extends BaseFormField {
  type: FormFieldType.SLIDER;
  min: number;
  max: number;
  step?: number;
}

// Number input field
export interface NumberField extends BaseFormField {
  type: FormFieldType.NUMBER;
  min?: number;
  max?: number;
}

// Date field
export interface DateField extends BaseFormField {
  type: FormFieldType.DATE;
}

// Color picker field
export interface ColorPickerField extends BaseFormField {
  type: FormFieldType.COLOR_PICKER;
  colors: string[]; // Array of color values (hex or CSS gradients)
  defaultColor?: string; // Default selected color
}

// Union type for all field types
export type FormField =
  | InputField
  | TextareaField
  | ToggleField
  | SliderField
  | NumberField
  | DateField
  | ColorPickerField;

// Form section (groups fields together)
export interface FormSection {
  title?: string;
  fields: FormField[];
}

// Platform form configuration
export interface PlatformFormConfig {
  platform: string;
  sections: FormSection[];
}
