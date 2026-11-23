import { useSelect, useDispatch } from '@wordpress/data';
import { SnackbarList } from '@wordpress/components';
import { useEffect, createPortal } from '@wordpress/element';
import type { Notice, NoticesProps } from './types';
import { cn } from '@shared/utils/formatting';
import './Notices.scss';
import { __ } from '@wordpress/i18n';

const MAX_VISIBLE_NOTICES = 10;

export const Notices = ({ context }: NoticesProps): JSX.Element | null => {
	const notices = useSelect((select) => {
		// @ts-ignore
		return select('core/notices').getNotices() as Notice[];
	}, []);

	const { removeNotice } = useDispatch('core/notices');

	useEffect(() => {
		if (!notices || notices.length <= MAX_VISIBLE_NOTICES) return;

		let noticeToRemove = notices.find((n) => n.status !== 'error');
		if (!noticeToRemove) noticeToRemove = notices[0];

		if (noticeToRemove) removeNotice(noticeToRemove.id);
	}, [notices, removeNotice]);

	if (!notices || notices.length === 0) return null;

	const styledNotices = notices.map((notice) => {
		const prefix = context ? 'PrimePlaced - Password Protect Site & Staging: ' : '';

		return {
			...notice,
			content: `${prefix}${notice.content}`,
			explicitDismiss: true,
			className: cn(
				notice.className,
				`is-${notice.status}`,
				`is-${notice.type}`,
				'ppadvp-notice'
			),
		};
	});

	return createPortal(
		<div className="ppadvp-notices-portal-root">
			<SnackbarList
				notices={styledNotices}
				className="ppadvp-snackbar-list"
				onRemove={removeNotice}
			/>
		</div>,
		document.body
	);
};
