import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
