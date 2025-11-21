import React from "react";

const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Calculating route and generating ELD logs...",
}) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
      <p className="loading-subtext">This may take a few moments</p>
    </div>
  );
};

export default LoadingSpinner;
