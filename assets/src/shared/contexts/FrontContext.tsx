import {
	createContext,
	useContext,
	useEffect,
	useState,
	useMemo,
} from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import type { PpadvpFrontData } from '@shared/types';

interface FrontContextValue {
	frontData: PpadvpFrontData;
	proLoaded: boolean;
}

const FRONT_KEY = 'PpadvpFrontContext_v1';
if (!(window as any)[FRONT_KEY]) {
	(window as any)[FRONT_KEY] = createContext<FrontContextValue | undefined>(undefined);
}
const FrontContext = (window as any)[FRONT_KEY];

export const useFrontContext = (): FrontContextValue => {
	const context = useContext(FrontContext) as FrontContextValue | undefined;
	if (!context) {
		return {
			frontData: (window.ppadvpFrontData || {}) as unknown as PpadvpFrontData,
			proLoaded: true,
		};
	}
	return context;
};

export const FrontProvider = ({
	children,
}: {
	children: JSX.Element | JSX.Element[] | any;
}) => {
	const frontData = (window.ppadvpFrontData || {}) as unknown as PpadvpFrontData;
	const [proLoaded, setProLoaded] = useState(false);

	useEffect(() => {
		const loadModules = async () => {
			const plan = frontData.active_plan || 'free';

			try {
				if (plan !== 'free') {
					const loadProFront = applyFilters(
						'ppadvp.front.load_pro',
						null
					) as ((plan: string) => Promise<void>) | null;

					if (loadProFront) {
						await loadProFront(plan);
					}
				}
			} catch (error: any) {
				if (error?.name !== 'ChunkLoadError') {
					// eslint-disable-next-line no-console
					console.error(
						'PPADVP: Failed to load frontend modules',
						error
					);
				}
			} finally {
				setProLoaded(true);
			}
		};

		void loadModules();
	}, [frontData.active_plan]);

	const value = useMemo(
		() => ({ frontData, proLoaded }),
		[frontData, proLoaded]
	);

	return (
		<FrontContext.Provider value={value}>{children}</FrontContext.Provider>
	);
};