import React from 'react';

// Button component
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}>(({ children, variant = 'primary', size = 'md', className, style, ...props }, ref) => {
  const baseStyle: React.CSSProperties = {
    padding: size === 'sm' ? '6px 12px' : size === 'md' ? '10px 20px' : '14px 28px',
    fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: variant === 'primary' ? '#0070f3' : 
                    variant === 'secondary' ? '#f0f0f0' : 
                    '#ff4d4f',
    color: variant === 'secondary' ? '#333' : '#fff',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ...style
  };
  
  return (
    <button 
      ref={ref} 
      style={baseStyle} 
      className={className}
      disabled={props.disabled} 
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// Card component
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  bordered?: boolean;
}>(({ children, bordered = true, style, ...props }, ref) => {
  const baseStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    border: bordered ? '1px solid #eaeaea' : 'none',
    ...style
  };
  
  return (
    <div ref={ref} style={baseStyle} {...props}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';

// Input component
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ style, ...props }, ref) => {
  const baseStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    width: '100%',
    boxSizing: 'border-box',
    ...style
  };
  
  return <input ref={ref} style={baseStyle} {...props} />;
});
Input.displayName = 'Input';

// Label component
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ style, children, ...props }, ref) => {
  const baseStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'block',
    color: '#333',
    ...style
  };
  
  return <label ref={ref} style={baseStyle} {...props}>{children}</label>;
});
Label.displayName = 'Label';

// Grid components
export const Container = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const baseStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 15px',
    ...style
  };
  
  return <div style={baseStyle} {...props}>{children}</div>;
};

export const Row = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 -15px',
    ...style
  };
  
  return <div style={baseStyle} {...props}>{children}</div>;
};

export const Col = ({ 
  children, 
  style, 
  span = 12,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { span?: number }) => {
  const baseStyle: React.CSSProperties = {
    padding: '0 15px',
    flexBasis: `${(span / 12) * 100}%`,
    maxWidth: `${(span / 12) * 100}%`,
    ...style
  };
  
  return <div style={baseStyle} {...props}>{children}</div>;
};