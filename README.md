# Micro Fleet - Package Project Generator tool

Belongs to Micro Fleet framework, provides a Yeoman-based generator to quickly create new project in Micro Fleet monorepo.

## HOW TO USE
- See section _"Adding new package"_ in `README.md` of the monorepo root.

## DEVELOPMENT

- Install packages in `peerDependencies` section with command `npm i --no-save {package name}@{version}`
- `npm run compile`: To transpile TypeScript into JavaScript.
- `npm run watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.