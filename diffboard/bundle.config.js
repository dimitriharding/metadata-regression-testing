const momentPath = '../node_modules/moment/min/moment.min.js';
module.exports = {
		bundle: {
				main: {
						scripts: [
								'./src/js/jquery.min.js', './src/js/materialize.min.js', './src/js/diffBoard.js', './src/js/run_prettify.js', momentPath
						],
						styles: [
								'./src/css/material-design-icons.css', 'src/css/materialize.min.css', 'src/css/diffboard.css', 'src/css/prettify.css'
						],
						options: {
								rev: true,
								result: {
										type: {
												scripts: function xJavascript(path) {
														return path;
												},
												styles: function html(path) {
														return path;
												}
										}
								}
						}
				}
		}
};
