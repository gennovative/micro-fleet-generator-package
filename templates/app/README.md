# Micro Fleet - <%= packageName %>

Belongs to Micro Fleet framework. <%- description %>

## INSTALLATION

- Stable version: `npm i @micro-fleet/<%- packageName %>`
- Edge (development) version: `npm i <%- repoUrl %>`

## DEVELOPMENT

- Install packages in `peerDependencies` section with command `npm i --no-save {package name}@{version}`
- `npm run build` to transpile TypeScript then run unit tests (if any) (equiv. `npm run compile` + `npm run test` (if any)).
- `npm run compile`: To transpile TypeScript into JavaScript.
- `npm run watch`: To transpile without running unit tests, then watch for changes in *.ts files and re-transpile on save.
<%_ if(needTest) { _%>
- `npm run test`: To run unit tests.
<%_ } _%>

## RELEASE

- `npm run release`: To transpile and create `app.d.ts` definition file.
- **Note:** Please commit transpiled code in folder `dist` and definition file `app.d.ts` relevant to the TypeScript version.