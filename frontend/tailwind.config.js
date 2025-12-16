/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // The Void / Deep Space
        black: '#000000',
        deep: '#050505',
        
        // The "Open" Surface System
        surface: {
          subtle: 'rgba(255, 255, 255, 0.03)',
          glass: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.06)',
        },
        
        // The Glows (Warm Ambers & Champion Tints)
        warm: {
          glow: '#f5c087',
          dim: '#8c5e36',
          bright: '#ffd9a8',
        },
        
        // Cool accent for counters/advantage
        cool: {
          glow: '#87c5f5',
          dim: '#365e8c',
        },
        
        // Danger/threat
        threat: {
          glow: '#f58787',
          dim: '#8c3636',
        },
        
        // Text hierarchy
        text: {
          primary: '#F2F2F2',
          secondary: '#A1A1AA',
          muted: '#52525b',
          inverse: '#000000',
        },

        // Semantic
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(245, 192, 135, 0.1)',
        'glow-md': '0 0 40px rgba(245, 192, 135, 0.12)',
        'glow-lg': '0 0 60px rgba(245, 192, 135, 0.15)',
        'glow-cool': '0 0 40px rgba(135, 197, 245, 0.15)',
        'inner-glow': 'inset 0 0 30px rgba(245, 192, 135, 0.05)',
      },
      animation: {
        'breathe': 'breathe 8s ease-in-out infinite',
        'breathe-slow': 'breathe 12s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 30s linear infinite reverse',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 192, 135, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 192, 135, 0.25)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
