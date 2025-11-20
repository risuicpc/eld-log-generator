import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Calculating route and generating ELD logs...</p>
      <p className="loading-subtext">This may take a few moments</p>
    </div>
  );
};

export default LoadingSpinner;
