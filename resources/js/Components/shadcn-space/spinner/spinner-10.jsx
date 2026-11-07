import { memo, useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SIZE_CONFIG = {
    sm: {
        container: 'gap-3',
        svgWidth: 80,
        svgHeight: 80,
        fontSize: 'text-xs',
    },
    md: {
        container: 'gap-5',
        svgWidth: 120,
        svgHeight: 120,
        fontSize: 'text-sm',
    },
    lg: {
        container: 'gap-7',
        svgWidth: 180,
        svgHeight: 180,
        fontSize: 'text-base',
    },
};

const WAVE_PATH =
    'M 0 36.5 ' +
    'C 67.43 36.5, 99.09 15.5, 160.53 15.5 C 221.98 15.5, 250.54 36.5, 300 36.5 ' +
    'C 348.56 36.5, 397.30 7, 457.63 7 C 517.96 7, 539.66 36.5, 600 36.5 ' +
    'C 667.43 36.5, 699.09 15.5, 760.53 15.5 C 821.98 15.5, 850.54 36.5, 900 36.5 ' +
    'C 948.56 36.5, 997.30 7, 1057.63 7 C 1117.96 7, 1139.66 36.5, 1200 36.5 ' +
    'L 1200 800 L 0 800 Z';

const LOADING_WORDS = [
    'Chargement de la page...',
    'Préparation de votre espace...',
    'Mise à jour des contenus...',
];

function TextMorph({ words, interval = 2000, className = '' }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!words.length) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setIndex((previous) => (previous + 1) % words.length);
        }, interval);

        return () => window.clearInterval(timer);
    }, [interval, words]);

    const chars = useMemo(() => Array.from(words[index] ?? ''), [index, words]);

    if (!words.length) {
        return null;
    }

    return (
        <AnimatePresence mode="popLayout">
            <motion.span
                key={index}
                className={`flex gap-0.5 overflow-hidden ${className}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
            >
                {chars.map((char, charIndex) => (
                    <motion.span
                        key={`${char}-${charIndex}`}
                        className="inline-block"
                        initial={{ opacity: 0, y: 5, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -5, filter: 'blur(5px)' }}
                        transition={{ delay: charIndex * 0.02, duration: 0.25 }}
                    >
                        {char === ' ' ? '\u00a0' : char}
                    </motion.span>
                ))}
            </motion.span>
        </AnimatePresence>
    );
}

export const LiquidWaveSpinner = memo(function LiquidWaveSpinner({
    size = 'md',
    hideText = false,
    className = '',
    ...props
}) {
    const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;
    const clipId = useId();
    const randomYDuration = useMemo(() => 5.5 + Math.random() * 1.5, []);
    const randomXDurationBg = useMemo(() => 3.5 + Math.random(), []);
    const randomXDurationFg = useMemo(() => 2.5 + Math.random(), []);
    const randomDelay = useMemo(() => Math.random() * 0.5, []);

    return (
        <motion.div
            className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-b-lg bg-white dark:bg-[#060d20] ${config.container} ${className}`}
            {...props}
        >
            <svg
                viewBox="0 0 500 500"
                width={config.svgWidth}
                height={config.svgHeight}
                aria-hidden="true"
            >
                <defs>
                    <clipPath id={clipId}>
                        <circle cx="249.5" cy="249.5" r="107.5" />
                    </clipPath>
                </defs>

                <circle
                    cx="249.5"
                    cy="249.5"
                    r="107.5"
                    className="fill-[#d9eafa] dark:fill-[#13283b]"
                />

                <g clipPath={`url(#${clipId})`}>
                    <motion.g
                        initial={{ y: 330.6 }}
                        animate={{ y: 170.1 }}
                        transition={{
                            duration: randomYDuration,
                            delay: randomDelay,
                            ease: 'easeOut',
                        }}
                    >
                        <motion.g
                            initial={{ x: -600 }}
                            animate={{ x: 0 }}
                            transition={{
                                duration: randomXDurationBg,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            <path d={WAVE_PATH} className="fill-[#1b9cd8]" opacity="0.4" />
                        </motion.g>
                    </motion.g>

                    <motion.g
                        initial={{ y: 330.6 }}
                        animate={{ y: 180.1 }}
                        transition={{
                            duration: randomYDuration,
                            delay: randomDelay,
                            ease: 'easeOut',
                        }}
                    >
                        <motion.g
                            initial={{ x: 0 }}
                            animate={{ x: -600 }}
                            transition={{
                                duration: randomXDurationFg,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            <path d={WAVE_PATH} className="fill-[#1b9cd8]" />
                        </motion.g>
                    </motion.g>
                </g>
            </svg>

            {!hideText && (
                <div
                    className="flex select-none items-center gap-1 text-slate-600 dark:text-slate-300"
                    aria-live="polite"
                >
                    <TextMorph
                        words={LOADING_WORDS}
                        className={`font-medium ${config.fontSize}`}
                    />
                </div>
            )}
        </motion.div>
    );
});

LiquidWaveSpinner.displayName = 'LiquidWaveSpinner';

export default LiquidWaveSpinner;
