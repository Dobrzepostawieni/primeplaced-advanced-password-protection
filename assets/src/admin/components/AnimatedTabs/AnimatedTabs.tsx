import { useEffect, useRef, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { cn } from '@shared/utils/formatting';
import type { AnimatedTabsProps } from './types';
import './AnimatedTabs.scss';

export const AnimatedTabs = ({
	tabs,
	activeTab,
	onTabChange,
}: AnimatedTabsProps): JSX.Element => {
	const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
	const [lineStyle, setLineStyle] = useState({
		left: 0,
		width: 0,
		isReady: false,
	});

	useEffect(() => {
		const updateLinePosition = () => {
			const activeIndex = tabs.findIndex((t) => t.name === activeTab);
			if (activeIndex === -1) return;

			const currentTabElement = tabsRef.current[activeIndex];
			if (currentTabElement) {
				setLineStyle((prev) => ({
					left: currentTabElement.offsetLeft,
					width: currentTabElement.offsetWidth,
					isReady: true,
				}));
			}
		};

		const timeoutId = setTimeout(updateLinePosition, 10);
		window.addEventListener('resize', updateLinePosition);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('resize', updateLinePosition);
		};
	}, [activeTab, tabs]);

	return (
		<div className="ppadvp-animated-tabs">
			<div className="ppadvp-animated-tabs__list" role="tablist">
				<div
					className={cn(
						'ppadvp-animated-tabs__line',
						lineStyle.isReady && 'is-ready'
					)}
					style={
						{
							'--ppadvp-tab-left': `${lineStyle.left}px`,
							'--ppadvp-tab-width': `${lineStyle.width}px`,
						} as React.CSSProperties
					}
				/>
				{tabs.map((tab, index) => (
					<Button
						key={tab.name}
						ref={(el: HTMLButtonElement | null) => {
							tabsRef.current[index] = el;
						}}
						className={cn(
							'ppadvp-animated-tabs__button',
							tab.className,
							activeTab === tab.name && 'is-active'
						)}
						onClick={() => onTabChange(tab.name)}
						role="tab"
						aria-selected={activeTab === tab.name}
					>
						{tab.title}
					</Button>
				))}
			</div>
		</div>
	);
};
