## Environment setup

###### Before use follow below steps

- Clone it
- Upgrade Node to 18 LTS.
- Update all dependency using `npm update`
- Test boilerplate for any breaking changes
- If everything fine then you can fork this repository.

###### Setup steps

1. You should have a Node version >=18 in your system. (use `node --version` to check current node version)
2. `npm i`
3. `npm start`
4. After setup and project runs successfully
5. To make it future proof remove carrot sign from all dependency version in package.json

###### Deployment settings

- Change .gitlab-ci.yml variable to new project server variable.
- Make sure you have correct config in .firebaserc file.

##### Packages

"@ant-design/icons": Used to import icons from ant library. (Reference Link: https://ant.design/components/icon)
"@apollo/client": Used to make graphql API calls. (Reference Link: https://www.apollographql.com/docs/react)
"@dnd-kit": Used to build performant and accessible drag and drop experiences. (Reference Link: https://docs.dndkit.com)
"@sentry/react": Sentry's React SDK enables automatic reporting of errors and exceptions. (Reference Link: https://docs.sentry.io/platforms/javascript/guides/react/)
"@testing-library": A very lightweight solution for testing React components. (Reference Link: https://www.npmjs.com/package/@testing-library/react)
"antd": React UI library with a set of high-quality React components (Reference Link: https://ant.design)
"axios": Used to make HTTP requests from the browser (Reference Link: https://www.npmjs.com/package/axios)
"eslint": It helps you to find and fix problems with your JavaScript code (Reference Link: https://www.npmjs.com/package/eslint)
"graphql": A query language for APIs and a runtime for fulfilling those queries with your existing data. (Reference Link: https://graphql.org/)
"history": The history library lets you easily manage session history anywhere JavaScript runs. (Reference Link: https://www.npmjs.com/package/history)
"jwt-decode: Used to decode well-formed JWT. (Reference Link: https://www.npmjs.com/package/jwt-decode#documentation)
"less": It is a backwards-compatible language extension for CSS. (Reference Link: https://lesscss.org/)
"less-loader": Used to compile Less to css. (Reference Link: https://www.npmjs.com/package/less-loader)
"less-vars-to-js": Read LESS variables from the contents of a file and return them as a javascript object. (Reference Link: https://www.npmjs.com/package/less-vars-to-js)
"lodash": Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc. (Reference Link: https://lodash.com/)
"dayjs": Parse, validate, manipulate and display dates and times in JavaScript. (Reference Link: https://www.npmjs.com/package/dayjs)
"universal-cookie": Universal cookies for React (Reference Link: https://www.npmjs.com/package/universal-cookie)
"web-vitals": To measure all the Web Vitals metrics on real users (Reference Link: https://www.npmjs.com/package/web-vitals)
"workbox-core": Used to simplify implementation of advance caching using service workers and progressive web app development in general. (Reference Link: https://www.npmjs.com/package/workbox-core)
"react-router-dom": It enables you to implement dynamic routing in a web app

###### - Required plugins (Must include)

- ESLint (https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Code spell Checker (https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- Prettier (https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

###### - Development productivity

- Auto Close Tag (https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
- Simple React Snippest (https://marketplace.visualstudio.com/items?itemName=burkeholland.simple-react-snippets)
- Turbo Console Log (https://marketplace.visualstudio.com/items?itemName=ChakrounAnas.turbo-console-log)
  ```
  ctrl + alt + L
  ```

##### Styles and framework

- Ant Design version 5.11.2 (https://ant.design)

##### Can't commit using vscode or commandline ?

- we implemented eslint restrictions so this may cause this problem.
- Please make sure you solved all your problems and errors
- To check what's the issue with code please check (output) tab of vscode that shows you error which have to fixed first before commit

##### Having issues related eslint ?

- Before commit please run this `npm run lint` command for checking errors and warnings
- Run below command for fixing eslint issue please check all changes after running below command.
- Command syntax`eslint {foldername} {options}`
- `eslint src --fix`
- This will solve some of syntax issues. other issues you have to fix manually.
- Make sure that all warnings and errors should resolved.

##### Docs (References)

(https://medium.com/netscape/git-hooks-with-husky-8b98f2556363)
Eslint commandline interface (https://eslint.org/docs/user-guide/command-line-interface)
CI-CD (Firebase deployment, FIREBASE_TOKEN config) (https://gitlab.com/help/ci/environments/index.md)
(https://about.gitlab.com/blog/2020/03/16/gitlab-ci-cd-with-firebase/)

##### Notes

- We are currently using older version of below packages because of some compatibility issues in new version. In future if issue are resolved, we'll upgrade the packages
  1. history
  2. husky
  3. less
  4. less-loader
# register_frontend
