import React from "react";
import { Link } from "react-router";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3>Unable to Calculate Trip</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
        </button>
      )}
      <Link to="/" className="btn btn-primary">
        ← Back to Home
      </Link>
      <div className="error-help">
        <p>
          <strong>Tips:</strong>
        </p>
        <ul>
          <li>Check that all locations are entered correctly</li>
          <li>Ensure the backend server is running</li>
          <li>Verify your internet connection</li>
          <li>Try using one of the example trips</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorMessage;
