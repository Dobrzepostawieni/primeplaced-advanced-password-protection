import { createContext, useContext } from '@wordpress/element';
import type { DataTableContextValue } from './types';
import { __ } from '@wordpress/i18n';

const DT_KEY = 'PpadvpDataTableContext_v1';
if (!(window as any)[DT_KEY]) {
	(window as any)[DT_KEY] = createContext<DataTableContextValue<any> | null>(null);
}
const DataTableContext = (window as any)[DT_KEY];

export const DataTableProvider = DataTableContext.Provider;

export const useDataTableContext = <T,>() => {
	const context = useContext(DataTableContext) as DataTableContextValue<T> | undefined;
	if (!context) {
		throw new Error(
			'useDataTableContext must be used within a DataTableProvider'
		);
	}
	return context;
};