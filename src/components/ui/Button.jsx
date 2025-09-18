import Icon from "./Icon";

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed gap-2";
  const sizes = {
    xs: "px-1 py-0.5 text-xs",
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5",
  };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent",
  };
  const cls = `${base} ${sizes[size] ?? sizes.md} ${
    variants[variant] ?? variants.primary
  } ${className}`;
  
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  
  return (
    <button className={cls} {...props}>
      {icon && iconPosition === "left" && <Icon name={icon} size={iconSize} />}
      {children}
      {icon && iconPosition === "right" && <Icon name={icon} size={iconSize} />}
    </button>
  );
}
