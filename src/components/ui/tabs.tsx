import React from "react";

interface TabsProps {
  className?: string;
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: "",
  onValueChange: () => {},
});

export function Tabs({ 
  className = "",
  value,
  defaultValue,
  onValueChange,
  children,
  ...props 
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string;
  children?: React.ReactNode;
}

export function TabsList({ className = "", ...props }: TabsListProps) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    />
  );
}

interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  className?: string;
  value: string;
}

export function TabsTrigger({ className = "", value, ...props }: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = React.useContext(TabsContext);
  const isActive = currentValue === value;
  
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}
      data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      {...props}
    />
  );
}

interface TabsContentProps {
  className?: string;
  children?: React.ReactNode;
  value: string;
}

export function TabsContent({ className = "", value, ...props }: TabsContentProps) {
  const { value: currentValue } = React.useContext(TabsContext);
  const isActive = currentValue === value;
  
  if (!isActive) return null;
  
  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    />
  );
} 