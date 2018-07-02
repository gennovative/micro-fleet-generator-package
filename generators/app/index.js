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
    async prompting() {
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
        const repo = answers['repository'];
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
    async writing() {
        const opts = this.options;
        const tplRoot = path.resolve(this.templatePath(), '../../../templates/app');
        log.info('Template path: ' + tplRoot);
        const destRoot = path.join(this.destinationRoot(), 'packages', opts.packageName);
        log.info('Destination path: ' + destRoot);
        await this.tryCloneRepo(this._vars['repoUrl'], destRoot);
        const files = await fsx.readdir(tplRoot);
        log.info('Creating package: ' + opts.packageName);
        log.info('Arguments: ' + this._vars);
        for (let f of files) {
            log.info('Copying ' + f);
            const from = path.join(tplRoot, f);
            const to = path.join(destRoot, f);
            this.fs.copyTpl(from, to, this._vars);
        }
    }
    async tryCloneRepo(url, targetPath) {
        const gitDir = path.join(targetPath, '.git');
        if (await fsx.pathExists(targetPath) && await fsx.pathExists(gitDir)) {
            return Promise.resolve();
        }
        return this.cloneRepo(url, targetPath);
    }
    cloneRepo(url, targetPath) {
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