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
		this.argument('packageName', {
			description: 'Package name which is used to name the folder and put in package.json.',
			type: String,
			required: true,
		});

		this._vars = {
			packageName: this.options['packageName']
		};
	}

	/**
	 * Yeoman priority
	 */
	protected async prompting() {
		const answers = await this.prompt([
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

		const repo = answers['repository'] as string;
		if (repo.startsWith('https://') || repo.startsWith('http://')) {
			await this.prompt([
				{
					type: 'input',
					name: 'repoUser',
					
					message: 'Code repository URL',
				},
			]);
		}
	}

	/**
	 * Yeoman priority
	 */
	protected async writing() {
		const opts: any = this.options;
		const tplRoot: string = path.resolve(this.templatePath(), '../../../templates/app');
		log.info('Template path: ' + tplRoot);
		const destRoot = path.join(this.destinationRoot(), 'packages', opts.packageName);
		log.info('Destination path: ' + destRoot);

		await this.tryCloneRepo(this._vars['repoUrl'], destRoot);

		const files: string[] = await fsx.readdir(tplRoot);

		log.info('Creating package: ' + opts.packageName);
		log.info('Arguments: ' + this._vars);
		for (let f of files) {
			log.info('Copying ' + f);
			const from = path.join(tplRoot, f);
			const to = path.join(destRoot, f);
			this.fs.copyTpl(from, to, this._vars);
		}
	}

	private async tryCloneRepo(url: string, targetPath: string): Promise<void> {
		const gitDir = path.join(targetPath, '.git');
		if (await fsx.pathExists(targetPath) && await fsx.pathExists(gitDir)) {
			return Promise.resolve();
		}
		return this.cloneRepo(url, targetPath);
	}

	private cloneRepo(url: string, targetPath: string): Promise<void> {
		return new Promise((resolve) => {
			gitClone(url, targetPath, (args: any) => {
				log.info('Debug cloneRepo arguments');
				console.dir(args);
				resolve();
			});
		});
	}
};