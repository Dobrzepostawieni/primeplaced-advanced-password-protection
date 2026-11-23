import { createContext } from '@wordpress/element';

import type { PasswordsContextValue } from './types';

export const PasswordsContext =
	createContext<PasswordsContextValue | null>(null);
