import React from 'react';

export default function Button({children, variant = 'primary', className = '', ...props}) {
    const variants = {
        primary: 'px-6 py-2 bg-lime-400 text-black rounded-full hover:bg-lime-300 transition font-medium',
        outline: 'px-6 py-2 border border-gray-600 rounded-full hover:border-gray-400 transition',
        outlineLarge: 'px-8 py-3 border border-gray-600 rounded-full hover:border-gray-400 transition',
        small_1:'px-3 py-1 text-sm  border border-gray-600 rounded-full hover:border-gray-400 transition'
    };

    return (
        <button className={`${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}