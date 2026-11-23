import { useEffect } from '@wordpress/element';
import { UpgradeHeader } from '@shared/components/UpgradeHeader';
import { Notices, useNotices } from '@shared/components/Notices';

export const App = (): JSX.Element => {
	const { notify } = useNotices();

	useEffect(() => {
		const timer = setTimeout(() => {
			if (typeof window.FS === 'undefined') {
				notify('FREEMIUS_BLOCKED');
			}
		}, 1500);

		return () => clearTimeout(timer);
	}, [notify]);

	return (
		<>
			<Notices context="pricing" />
			<UpgradeHeader context="pricing" />
		</>
	);
};
