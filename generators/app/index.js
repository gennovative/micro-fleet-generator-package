"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const chalk_1 = require("chalk");
const fsx = require("fs-extra");
const gitClone = require("git-clone");
const Generator = require("yeoman-generator");
const log = {
    bold: (...msg) => console.log(chalk_1.default.bold(...msg)),
    error: (...msg) => console.log(chalk_1.default.bold.red('ERROR'), ...msg),
    warning: (...msg) => console.log(chalk_1.default.bold.yellow('WARNING'), ...msg),
    info: (...msg) => console.log(chalk_1.default.bold.blue('INFO'), ...msg),
    success: (...msg) => console.log(chalk_1.default.bold.green('SUCCESS'), ...msg),
};
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }
    /**
     * Yeoman priority
     * @see http://yeoman.io/authoring/running-context.html
     */
    async initializing() {
        this._vars = {};
    }
    /**
     * Yeoman priority
     */
    async prompting() {
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
    async writing() {
        const opts = this._vars;
        const tplRoot = path.resolve(this.templatePath(), '../../../templates/app');
        const destRoot = path.join(this.destinationRoot(), 'packages', opts.packageName);
        await this._tryCloneRepo(this._vars['repoUrl'], destRoot);
        log.info('Loading templates from: ' + tplRoot);
        const files = await fsx.readdir(tplRoot);
        for (let f of files) {
            log.info('Copying ' + f);
            const from = path.join(tplRoot, f);
            const to = path.join(destRoot, f);
            this.fs.copyTpl(from, to, this._vars);
        }
    }
    async _tryCloneRepo(url, targetPath) {
        const gitDir = path.join(targetPath, '.git');
        if (await fsx.pathExists(targetPath) && await fsx.pathExists(gitDir)) {
            log.info(`A repo at ${targetPath} already exists! No need to clone!`);
            return Promise.resolve();
        }
        return this._cloneRepo(url, targetPath);
    }
    _cloneRepo(url, targetPath) {
        log.info('Cloning repository to: ' + targetPath);
        return new Promise((resolve) => {
            gitClone(url, targetPath, (args) => {
                log.info('Debug cloneRepo arguments');
                console.dir(args);
                resolve();
            });
        });
    }
};
//# sourceMappingURL=index.js.map