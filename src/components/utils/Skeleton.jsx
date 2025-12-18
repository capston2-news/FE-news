import React from 'react';

const Skeleton = ({ className = 'w-full h-6 rounded-md bg-gray-200 animate-pulse' }) => {
  return <div className={className} aria-hidden="true" />;
};

export default Skeleton;
