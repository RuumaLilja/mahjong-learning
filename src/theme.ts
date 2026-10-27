import { createContext } from 'react';

export type Theme = 'regular' | 'black';

export const ThemeContext = createContext<Theme>('regular');
