const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const freeApps = {
	'primeplaced-advanced-password-protection-admin': { path: 'admin/index', src: 'src' },
	'primeplaced-advanced-password-protection-public': { path: 'front/index', src: 'src' },
	'primeplaced-advanced-password-protection-widget': { path: 'widget/index', src: 'src' },
	'primeplaced-advanced-password-protection-pricing': {
		path: 'pricing/index',
		src: 'src',
	},
};


const createEntry = (apps) => {
	const entry = {};

	Object.entries(apps).forEach(([outputName, config]) => {
		entry[outputName] = path.resolve(
			process.cwd(),
			`assets/${config.src}/${config.path}.tsx`
		);
	});

	return entry;
};

/**
 *
 * @param rules
 */
function updateRules(rules) {
	return rules.map((rule) => {
		if (Array.isArray(rule.use)) {
			rule.use = rule.use.map((u) => {
				const isSass =
					(typeof u === 'string' && u.includes('sass-loader')) ||
					(typeof u === 'object' &&
						u.loader &&
						u.loader.includes('sass-loader'));

				if (isSass) {
					const existingOptions =
						typeof u === 'object' && u.options ? u.options : {};

					return {
						loader: require.resolve('sass-loader'),
						options: {
							...existingOptions,
							sourceMap: true,
							api: 'modern',
							webpackImporter: true,
							sassOptions: {
								loadPaths: [
									path.resolve(process.cwd(), 'node_modules'),
									path.resolve(process.cwd(), 'assets/src'),
								],
								quietDeps: true,
								silenceDeprecations: ['legacy-js-api'],
							},
						},
					};
				}

				return u;
			});
		}

		if (rule.oneOf) {
			rule.oneOf = updateRules(rule.oneOf);
		}

		return rule;
	});
}

const rulesWithSassFix = updateRules(defaultConfig.module.rules);

const customMinimizers = (defaultConfig.optimization.minimizer || []).map(
	(plugin) => {
		if (plugin.constructor.name === 'TerserPlugin') {
			plugin.options.extractComments = false;
			plugin.options.terserOptions = {
				...plugin.options.terserOptions,
				format: {
					...(plugin.options.terserOptions?.format || {}),
					comments: false,
				},
			};
		}
		return plugin;
	}
);

const freeAliases = {
	'@pro': path.resolve(process.cwd(), 'assets/src/pro'),
	'@admin': path.resolve(process.cwd(), 'assets/src/admin'),
	'@front': path.resolve(process.cwd(), 'assets/src/front'),
	'@shared': path.resolve(process.cwd(), 'assets/src/shared'),
	'@features': path.resolve(process.cwd(), 'assets/src/admin/features'),
	'@components': path.resolve(process.cwd(), 'assets/src/admin/components'),
	'@styles': path.resolve(process.cwd(), 'assets/src/styles'),
	'@widget': path.resolve(process.cwd(), 'assets/src/widget'),
	'@images': path.resolve(process.cwd(), 'assets/images'),
	'@config': path.resolve(process.cwd(), 'config'),
};


const createConfig = (entry, aliases, isProBuild = false) => ({
	...defaultConfig,
	entry,
	output: {
		path: path.join(__dirname, './assets/build'),
		filename: '[name].js',
		chunkFilename: () => '[name].[contenthash].js',
	},
	resolve: {
		...defaultConfig.resolve,
		alias: aliases,
		extensions: [
			'.ts',
			'.tsx',
			'.js',
			'.jsx',
			...defaultConfig.resolve.extensions,
		],
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		...defaultConfig.externals,
	},
	module: {
		...defaultConfig.module,
		rules: rulesWithSassFix,
	},
	optimization: {
		...defaultConfig.optimization,
		...(isProBuild
			? {
					runtimeChunk: false,
					splitChunks: false,
				}
			: {}),
		minimize: true,
		minimizer: customMinimizers,
	},
	performance: {
		...defaultConfig.performance,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
});

module.exports = [
	createConfig(createEntry(freeApps), freeAliases),
];
