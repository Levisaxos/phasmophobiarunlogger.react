// constants/index.js

export const UI_CONSTANTS = {
    MAX_DEFAULT_PLAYERS: 4,
    MAX_EVIDENCE_TYPES: 3,
    MAX_ROOMS_PER_MAP: 100,    
    SIDEBAR_WIDTH: 'w-80',
    MAIN_HEIGHT: 'calc(100vh - 140px)'
};

export const GAME_DEFAULTS = {
    PLAYER_STATUS: {
        ALIVE: 'alive',
        DEAD: 'dead'
    },
    MAP_SIZES: {
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large'
    },
    DEFAULT_GAME_MODE: {
        name: 'Professional',
        maxEvidence: 3
    }
};

export const TOAST_CONSTANTS = {
    DEFAULT_DURATION: 8000,
    FADE_OUT_DURATION: 500,
    SUCCESS_DURATION: 6000,
    ERROR_DURATION: 10000,
    WARNING_DURATION: 8000,
    INFO_DURATION: 6000,
    POSITION: 'top-right',
    MAX_TOASTS: 5
};

export const STORAGE_KEYS = {
    MAIN_DATA: 'phasmophobia-data'
};

export const DATE_FORMATS = {
    DUTCH_LOCALE: 'nl-NL',
    DATE_OPTIONS: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },
    TIME_OPTIONS: {
        hour: '2-digit',
        minute: '2-digit'
    }
};