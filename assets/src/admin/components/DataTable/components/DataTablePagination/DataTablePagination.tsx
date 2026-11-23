import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	SelectControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { previous, next } from '@wordpress/icons';
import { useDataTableContext } from '../../DataTableContext';

import './DataTablePagination.scss';

export const DataTablePagination = () => {
	const { totalItems, perPage, currentPage, totalPages, handlePageChange } =
		useDataTableContext();

	if (totalItems < perPage + 1) return null;

	return (
		<div className="ppadvp-datatable__pagination">
			<span className="ppadvp-datatable__pagination-wrapper">
				<span className="ppadvp-datatable__pagination-label">
					{__('Page', 'primeplaced-advanced-password-protection')}
				</span>

				<SelectControl
					value={currentPage.toString()}
					options={Array.from(
						{ length: Math.max(1, totalPages) },
						(_, i) => ({
							label: (i + 1).toString(),
							value: (i + 1).toString(),
						})
					)}
					onChange={(val: string) => handlePageChange(Number(val))}
					
					__next40pxDefaultSize
					className="ppadvp-datatable__pagination-select"
				/>

				<span className="ppadvp-datatable__pagination-label ppadvp-datatable__pagination-label-suffix">
					{sprintf(
						/* translators: %d: total pages */
						__('with %d ', 'primeplaced-advanced-password-protection'),
						totalPages
					)}
				</span>
			</span>
			<Button
				icon={previous}
				disabled={currentPage <= 1}
				onClick={() => handlePageChange(currentPage - 1)}
				variant="tertiary"
				aria-label={__(
					'Previous page ',
					'primeplaced-advanced-password-protection'
				)}
				className="ppadvp-button ppadvp-datatable__pagination-arrows"
			/>
			<Button
				icon={next}
				disabled={currentPage >= totalPages}
				onClick={() => handlePageChange(currentPage + 1)}
				variant="tertiary"
				aria-label={__('Next page ', 'primeplaced-advanced-password-protection')}
				className="ppadvp-button ppadvp-datatable__pagination-arrows"
			/>
		</div>
	);
};
