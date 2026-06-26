import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                tasho: {
                    primary: '#6C5CE7',
                    secondary: '#2D3436',
                    accent: '#F6AD55',
                    success: '#48BB78',
                    warning: '#F6AD55',
                    danger: '#FC8181',
                    dark: '#0A0A0A',
                    'dark-surface': '#1A202C',
                    light: '#F5F5F7',
                }
            }
        },
    },

    plugins: [forms],
};
