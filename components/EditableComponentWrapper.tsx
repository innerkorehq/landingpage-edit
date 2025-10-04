"use client";

import React, { useState } from "react";
import DynamicComponent from "./DynamicComponent";
import { cn } from "@/lib/utils";

interface EditableComponentWrapperProps {
  componentName: string;
  componentProps: Record<string, any>;
  id: string;
  isEditing?: boolean;
  onEdit?: (id: string, props: Record<string, any>) => void;
}

const EditableComponentWrapper: React.FC<EditableComponentWrapperProps> = ({
  componentName,
  componentProps,
  id,
  isEditing = false,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isEditing && onEdit) {
      onEdit(id, componentProps);
    }
  };

  return (
    <div
      className={cn(
        "relative transition-all",
        isEditing && "hover:outline hover:outline-2 hover:outline-blue-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isEditing && isHovered && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs py-1 px-2 rounded-t-md z-10">
          {componentName}
        </div>
      )}
      <DynamicComponent componentName={componentName} props={componentProps} />
    </div>
  );
};

export default EditableComponentWrapper;