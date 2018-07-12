import * as path from 'path';
import chalk from 'chalk';
import * as fsx from 'fs-extra';
import * as gitClone from 'git-clone';
import * as Generator from 'yeoman-generator';

const log = {
	bold: (...msg: any[]) => console.log(chalk.bold(...msg)),
	error: (...msg: any[]) => console.log(chalk.bold.red('ERROR'), ...msg),
	warning: (...msg: any[]) => console.log(chalk.bold.yellow('WARNING'), ...msg),
	info: (...msg: any[]) => console.log(chalk.bold.blue('INFO'), ...msg),
	success: (...msg: any[]) => console.log(chalk.bold.green('SUCCESS'), ...msg),
};

module.exports = class extends Generator {

	private _vars: any;

	constructor(args: string|string[], opts: {}) {
		super(args, opts);
	}

	/**
	 * Yeoman priority
	 * @see http://yeoman.io/authoring/running-context.html
	 */
	protected async initializing(): Promise<any> {
		this._vars = {};
	}

	/**
	 * Yeoman priority
	 */
	protected async prompting() {
		const answers = await this.prompt([
			{
				type: 'input',
				name: 'packageName',
				message: 'Package name (for folder name and package.json)',
			},
			{
				type: 'input',
				name: 'description',
				message: 'Description (for package.json and README.md)',
			},
			{
				type: 'confirm',
				name: 'needTest',
				message: 'Have unit test?',
			},
			{
				type: 'input',
				name: 'repoUrl',
				message: 'Code repository URL',
			},
		]);
		this._vars = Object.assign(this._vars, answers);

		// const repo = answers['repository'] as string;
		// if (repo.startsWith('https://') || repo.startsWith('http://')) {
		// 	await this.prompt([
		// 		{
		// 			type: 'input',
		// 			name: 'repoUser',
					
		// 			message: 'Code repository URL',
		// 		},
		// 	]);
		// }
	}

	/**
	 * Yeoman priority
	 */
	protected async writing() {
		const opts: any = this._vars;
		const tplRoot: string = path.resolve(this.templatePath(), '../../../templates/app');
		const destRoot = path.join(this.destinationRoot(), 'packages', opts.packageName);

		await this._tryCloneRepo(this._vars['repoUrl'], destRoot);

		log.info('Loading templates from: ' + tplRoot);
		const files: string[] = await fsx.readdir(tplRoot);

		for (let f of files) {
			log.info('Copying ' + f);
			const from = path.join(tplRoot, f);
			const to = path.join(destRoot, f);
			this.fs.copyTpl(from, to, this._vars);
		}
	}

	private async _tryCloneRepo(url: string, targetPath: string): Promise<void> {
		const gitDir = path.join(targetPath, '.git');
		if (await fsx.pathExists(targetPath) && await fsx.pathExists(gitDir)) {
			log.info(`A repo at ${targetPath} already exists! No need to clone!`);
			return Promise.resolve();
		}
		return this._cloneRepo(url, targetPath);
	}
	
	private _cloneRepo(url: string, targetPath: string): Promise<void> {
		log.info('Cloning repository to: ' + targetPath);
		return new Promise((resolve) => {
			gitClone(url, targetPath, (args: any) => {
				log.info('Debug cloneRepo arguments');
				console.dir(args);
				resolve();
			});
		});
	}
};