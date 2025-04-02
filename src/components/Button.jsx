import React from 'react';
import './../styles/utilities.css'; // Make sure button styles are here

// Basic icon spacing example (add to utilities.css or button specific css)
/*
.button-icon-left { margin-right: 0.5rem; display: inline-flex; vertical-align: middle; }
.button-icon-right { margin-left: 0.5rem; display: inline-flex; vertical-align: middle; }
*/

function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // 'primary', 'secondary', 'gradient', 'custom'
    shine = false,
    disabled = false,
    className = '',
    iconLeft = null,
    iconRight = null,
    ...props
}) {
    const baseClasses = 'button';
    const variantClasses = {
        primary: 'button-primary',
        secondary: 'button-secondary',
        gradient: 'button-gradient',
        custom: '', // For fully custom styling via className
    };
    const shineClass = shine ? 'button-shine' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${shineClass} ${className}`}
            {...props}
        >
            {iconLeft && <span style={{marginRight: '0.5rem', display: 'inline-flex', verticalAlign: 'middle'}}>{iconLeft}</span>}
            {children}
            {iconRight && <span style={{marginLeft: '0.5rem', display: 'inline-flex', verticalAlign: 'middle'}}>{iconRight}</span>}
        </button>
    );
}

export default Button;