# CI/CD Pipeline Phase 1

## Build Pipeline Diagram
![diagram](/admin/cipipeline/phase1.drawio.png)

### Description
Our build pipeline starts with us writing some code. Within our ide (VS Code), the StandardJS and ESLint Plugins automatically check for deviations from semistandard js and any bugs, etc. as ESLint would normally find. We then commit our code and make a pull request. Upon merging the committed changes, GitHub actions perform automatic document generation using JSDocs, performs our unit tests with Jest, and reviews our code for quality using CodeInspector. Here are some descriptions of each of these tools and how we are using them:

- JSDocs, pushes to /docs directory as html files
  - start with /** */ over top of functions and constructors, uses @param, @returns, like JavaDocs
  - Only use this style of comment for functions constructors
  - Explicitly define functions so we can add documentation, no on-the-fly closures

- Unit Testing (Jest)
  - set up by running some npm commands that setup the .github/workflows yml file,
  - works now automatically when we commit to main
  - settings in the /source/package.json file
  - can be run locally as well
  - upon comitting, when a branch gets pushed to the main branch, a github action runs the tests located in tests.js
  - we create the tests in a test file called tests.js

- StandardJS
  - shows deviations from semistandardJS in VSCode
  - red underlines deviations
  - using default options

- ESLint
  - shows deviations from semistandardJS
  - shows code that is likely to cause bugs
  - integrated into VSCode
  - each dev installs the extension to their ide
  - setup for semistandard
  - using default options

- CodeInspector
  - added through GitHub apps
  - put a sample script into the .github-workflows folder
  - automatically runs code quality check when we push to main
  - tells you number of things that are wrong in GitHub when you push
  - Shows you specific things in the code inspector dashboard
  - dashboard at https://frontend.code-inspector.com/home
  - just login to github account and click our repo
  - shows code repeats, long functions, etc.