import {
	useState,
	useMemo,
	useCallback,
	useEffect,
	useRef,
} from '@wordpress/element';
import type {
	DataTableInstance,
	ActiveFilterState,
	FilterOperator,
	UseDataTableProps,
} from './types';

export const useDataTable = <T>({
	data,
	initialSortBy = '',
	initialSortDirection = 'desc',
	initialPerPage = 25,
	searchableFields = [],
	manualPagination = false,
	manualTotalItems = 0,
	storageKey,
	onStateChange,
}: UseDataTableProps<T>): DataTableInstance<T> => {
	const getCache = useCallback(() => {
		if (!storageKey) return null;
		try {
			const saved = localStorage.getItem(`ppadvp_table_${storageKey}`);
			return saved ? JSON.parse(saved) : null;
		} catch (e) {
			return null;
		}
	}, [storageKey]);

	const [sortBy, setSortBy] = useState<string>(
		() => getCache()?.sortBy || initialSortBy
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
		() => getCache()?.sortDirection || initialSortDirection
	);
	const [perPage, setPerPage] = useState<number>(
		() => getCache()?.perPage || initialPerPage
	);
	const [activeFilters, setActiveFilters] = useState<
		Record<string, ActiveFilterState>
	>(() => getCache()?.activeFilters || {});
	const [hiddenColumns, setHiddenColumns] = useState<string[]>(
		() => getCache()?.hiddenColumns || []
	);

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>(
		[]
	);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [visibleFilters, setVisibleFilters] = useState<string[]>(() =>
		Object.keys(getCache()?.activeFilters || {})
	);
	const [activeFilterDropdown, setActiveFilterDropdown] = useState<
		string | null
	>(null);
	const [isFiltersPanelVisible, setIsFiltersPanelVisible] =
		useState<boolean>(true);

	useEffect(() => {
		if (!storageKey) return;

		const stateToSave = {
			sortBy,
			sortDirection,
			perPage,
			activeFilters,
			hiddenColumns,
		};

		localStorage.setItem(
			`ppadvp_table_${storageKey}`,
			JSON.stringify(stateToSave)
		);
	}, [
		storageKey,
		sortBy,
		sortDirection,
		perPage,
		activeFilters,
		hiddenColumns,
	]);

	const onStateChangeRef = useRef(onStateChange);
	useEffect(() => {
		onStateChangeRef.current = onStateChange;
	}, [onStateChange]);

	const handleToggleColumn = useCallback((columnId: string) => {
		setHiddenColumns((prev) =>
			prev.includes(columnId)
				? prev.filter((id) => id !== columnId)
				: [...prev, columnId]
		);
	}, []);

	const handleSort = useCallback(
		(columnId: string, direction: 'asc' | 'desc') => {
			setSortBy(columnId);
			setSortDirection(direction);
			setCurrentPage(1);
		},
		[]
	);

	const handlePerPageChange = useCallback((newPerPage: number) => {
		setPerPage(newPerPage);
		setCurrentPage(1);
	}, []);

	const handleSelectRow = useCallback(
		(id: string | number, checked: boolean) => {
			setSelectedRowIds((prev) =>
				checked ? [...prev, id] : prev.filter((prevId) => prevId !== id)
			);
		},
		[]
	);

	const handleSelectAll = useCallback(
		(checked: boolean, pageIds: (string | number)[]) => {
			if (checked) {
				setSelectedRowIds((prev) => {
					const newSet = new Set([...prev, ...pageIds]);
					return Array.from(newSet);
				});
			} else {
				setSelectedRowIds((prev) =>
					prev.filter((prevId) => !pageIds.includes(prevId))
				);
			}
		},
		[]
	);

	const clearSelection = useCallback(() => setSelectedRowIds([]), []);

	const handleSearchChange = useCallback(
		(query: string) => {
			setSearchQuery(query);
			setCurrentPage(1);
			clearSelection();
		},
		[clearSelection]
	);

	const handleFilterChange = useCallback(
		(filterId: string, value: any, operator: FilterOperator = 'is') => {
			setActiveFilters((prev) => {
				const next = { ...prev };
				if (
					value === '' ||
					value === undefined ||
					value === null ||
					(Array.isArray(value) && value.length === 0)
				) {
					delete next[filterId];
				} else {
					next[filterId] = { value, operator };
				}
				return next;
			});
			setCurrentPage(1);
			clearSelection();
		},
		[clearSelection]
	);

	const handleShowFilter = useCallback((filterId: string) => {
		setVisibleFilters((prev) => {
			if (!prev.includes(filterId)) {
				setActiveFilterDropdown(filterId);
				setIsFiltersPanelVisible(true);
				return [...prev, filterId];
			}
			return prev;
		});
	}, []);

	const handleHideFilter = useCallback(
		(filterId: string) => {
			setVisibleFilters((prev) => prev.filter((id) => id !== filterId));
			handleFilterChange(filterId, '', 'is');
			setActiveFilterDropdown((prevDropdown) =>
				prevDropdown === filterId ? null : prevDropdown
			);
		},
		[handleFilterChange]
	);

	const handleResetFilters = useCallback(() => {
		setVisibleFilters([]);
		setActiveFilters({});
		setSearchQuery('');
		setCurrentPage(1);
		clearSelection();
		setActiveFilterDropdown(null);
	}, [clearSelection]);

	const checkRowAgainstFilter = (
		row: T,
		filterState: ActiveFilterState,
		key: string
	): boolean => {
		const cellValue = String(row[key as keyof T] || '');
		if (Array.isArray(filterState.value)) {
			const filterValues = filterState.value.map(String);
			if (filterState.operator === 'isNot') {
				return !filterValues.includes(cellValue);
			}
			return filterValues.includes(cellValue);
		}
		const filterValue = String(filterState.value).toLowerCase();
		const cellValueLower = cellValue.toLowerCase();
		switch (filterState.operator) {
			case 'isNot':
				return cellValueLower !== filterValue;
			case 'contains':
				return cellValueLower.includes(filterValue);
			case 'notContains':
				return !cellValueLower.includes(filterValue);
			case 'before':
				return (
					new Date(cellValue) < new Date(String(filterState.value))
				);
			case 'after':
				return (
					new Date(cellValue) > new Date(String(filterState.value))
				);
			case 'on':
				return cellValue.startsWith(String(filterState.value));
			case 'is':
			default:
				return cellValueLower === filterValue;
		}
	};

	const filteredData = useMemo(() => {
		if (manualPagination) return data;
		return data.filter((row: T) => {
			for (const [key, filterState] of Object.entries(activeFilters)) {
				if (
					!filterState ||
					filterState.value === undefined ||
					filterState.value === '' ||
					(Array.isArray(filterState.value) &&
						filterState.value.length === 0)
				) {
					continue;
				}
				if (!checkRowAgainstFilter(row, filterState, key)) {
					return false;
				}
			}
			if (searchQuery && searchableFields.length > 0) {
				const query = searchQuery.toLowerCase();
				const matches = searchableFields.some((field) => {
					const val = row[field];
					if (Array.isArray(val)) {
						return val.some((v) =>
							String(v || '')
								.toLowerCase()
								.includes(query)
						);
					}
					return String(val || '')
						.toLowerCase()
						.includes(query);
				});
				if (!matches) return false;
			}
			return true;
		});
	}, [data, activeFilters, searchQuery, searchableFields, manualPagination]);

	const sortedData = useMemo(() => {
		if (manualPagination || !sortBy) return filteredData;
		return [...filteredData].sort((a, b) => {
			const rawA = a[sortBy as keyof T];
			const rawB = b[sortBy as keyof T];
			if (typeof rawA === 'string' && typeof rawB === 'string') {
				return sortDirection === 'asc'
					? rawA.localeCompare(rawB)
					: rawB.localeCompare(rawA);
			}
			const valA = String(rawA || '');
			const valB = String(rawB || '');
			return sortDirection === 'asc'
				? valA.localeCompare(valB)
				: valB.localeCompare(valA);
		});
	}, [filteredData, sortBy, sortDirection, manualPagination]);

	const totalItems = manualPagination ? manualTotalItems : sortedData.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
	const safeCurrentPage = manualPagination
		? currentPage
		: Math.min(currentPage, totalPages);

	const paginatedData = useMemo(() => {
		if (manualPagination) return data;
		const start = (safeCurrentPage - 1) * perPage;
		return sortedData.slice(start, start + perPage);
	}, [sortedData, safeCurrentPage, perPage, manualPagination, data]);

	useEffect(() => {
		if (manualPagination && onStateChangeRef.current) {
			onStateChangeRef.current({
				page: safeCurrentPage,
				perPage,
				sortBy,
				sortDirection,
				searchQuery,
				filters: activeFilters,
			});
		}
	}, [
		safeCurrentPage,
		perPage,
		sortBy,
		sortDirection,
		searchQuery,
		activeFilters,
		manualPagination,
	]);

	return {
		hiddenColumns,
		sortBy,
		sortDirection,
		currentPage: safeCurrentPage,
		totalPages,
		totalItems,
		perPage,
		paginatedData,
		selectedRowIds,
		searchQuery,
		activeFilters,
		visibleFilters,
		activeFilterDropdown,
		isFiltersPanelVisible,
		setIsFiltersPanelVisible,
		setActiveFilterDropdown,
		handleToggleColumn,
		handleSort,
		handlePageChange: setCurrentPage,
		handlePerPageChange,
		handleSelectRow,
		handleSelectAll,
		clearSelection,
		handleSearchChange,
		handleFilterChange,
		handleShowFilter,
		handleHideFilter,
		handleResetFilters,
	};
};
