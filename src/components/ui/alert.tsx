import * as React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export function Alert({ className = "", variant = "default", ...props }: AlertProps) {
  const variantClasses = {
    default: "bg-background text-foreground",
    destructive: "bg-destructive/15 text-destructive border-destructive/50",
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function AlertTitle({ className = "", ...props }: AlertTitleProps) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />
  );
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className = "", ...props }: AlertDescriptionProps) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
  );
} 