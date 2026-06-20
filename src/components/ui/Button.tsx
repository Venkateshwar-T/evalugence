import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  let baseClass = "inline-flex items-center justify-center font-medium transition-transform active:scale-95 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  let variantClass = "";
  if (variant === 'primary') variantClass = "bg-black dark:bg-white text-white dark:text-black shadow-sm hover:bg-gray-900 dark:hover:bg-gray-100";
  if (variant === 'secondary') variantClass = "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800";
  if (variant === 'outline') variantClass = "border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white";
  if (variant === 'ghost') variantClass = "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white";

  let sizeClass = "";
  if (size === 'sm') sizeClass = "h-8 px-3 text-xs rounded-md gap-1.5";
  if (size === 'md') sizeClass = "h-10 px-4 py-2 text-sm rounded-xl gap-2";
  if (size === 'lg') sizeClass = "h-12 px-8 text-base rounded-2xl gap-2";
  if (size === 'icon') sizeClass = "h-10 w-10 rounded-xl flex items-center justify-center p-0";

  return (
    <button className={`${baseClass} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
