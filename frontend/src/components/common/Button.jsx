export default function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  className = '', 
  ...props 
}) {
  const baseStyle = "px-4 py-1.5 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-tally-blue text-white hover:bg-opacity-90 focus:ring-tally-blue",
    secondary: "bg-tally-light-blue text-tally-dark border border-tally-border hover:bg-tally-yellow hover:text-tally-dark focus:ring-tally-yellow",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
