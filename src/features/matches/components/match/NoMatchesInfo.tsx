
import React from 'react';
import { AlertCircle } from "lucide-react";

interface NoMatchesInfoProps {
  message: string;
}

const NoMatchesInfo = ({ message }: NoMatchesInfoProps) => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded">
      <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default NoMatchesInfo;
