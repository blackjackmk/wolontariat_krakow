import { ExtendableAutoFormProps } from "@autoform/react";
import { FieldValues } from "react-hook-form";

// Extend base props with our project's convenience options
export interface AutoFormProps<T extends FieldValues>
  extends ExtendableAutoFormProps<T> {
  // Allow passing field options (e.g., select options) to provider integrations
  // Forwarded to the underlying BaseAutoForm; keep as any to stay decoupled
  fieldOptions?: any;
}
