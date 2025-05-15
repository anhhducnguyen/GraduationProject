import React from "react";

interface LabelProps {
  text: string;
  type?: "info" | "danger" | "warning" | "success" | "primary" | "default";
}

const Label: React.FC<LabelProps> = ({ text, type = "default" }) => {
    const typeClasses = {
      info: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      warning: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
      success: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      primary: "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400",
      default: "bg-base-100 text-base-700 dark:bg-base-500/20 dark:text-base-200",
    } as const;
  
    return (
      <span
        className={`inline-block font-semibold leading-normal px-2 py-1 rounded text-xxs uppercase whitespace-nowrap ${
          typeClasses[type] ?? typeClasses.default
        }`}
      >
        {text}
      </span>
    );
  };
  

interface CardProps {
  className?: string;
  title?: string;
  children?: React.ReactNode;
  label?: string;
  icon?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = "", title, children, label, icon, footer }) => {
  return (
    <div
      className={`bg-white border flex flex-col flex-grow overflow-hidden p-6 relative rounded shadow-sm dark:bg-base-900 dark:border-base-800 ${className}`}
    >
      {title && (
        <h2 className="bg-base-50 border-b font-semibold mb-6 -mt-6 -mx-6 py-4 px-6 text-font-important-light dark:text-font-important-dark dark:border-base-800 dark:bg-white/[.02]">
          {title}
        </h2>
      )}
      <div className={`flex-grow relative ${icon ? "pl-6" : ""}`}>
        {children}
        {label && (
          <div className="absolute right-0 top-0">
            <Label text={label} type="primary" />
          </div>
        )}
        {icon && (
          <span className="material-symbols-outlined absolute -left-6 text-base-300 top-1/2 -translate-x-1/3 -translate-y-1/2 !text-6xl dark:text-base-500">
            {icon}
          </span>
        )}
      </div>
      {footer && (
        <div className="border-t flex items-center -mb-6 -mx-6 mt-6 pb-2 pt-2 px-6 text-sm dark:border-base-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export { Card, Label };
