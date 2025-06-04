function Spinner({ size = "medium" }) {
  // Map size prop to Tailwind classes for width and height
  const sizeStyles = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeStyles[size] || sizeStyles.medium} 
          border-4 border-blue-500 border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
    </div>
  );
}

export default Spinner;