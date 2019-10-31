# CECS543LMD

VCS Project for CECS 543 Sec 07 11646

# For DEVS

To test each feature, please go to sever/routes/index.js

- Uncomment each block of code in the router.post method to test each feature
- Note:

  - You can't create a repo of the same REPONAME and USERNAME, since the manifests and master manifest will be overwritten.
  - If you want to distable this feature, go to RepoHandler, in its construtor, comment out

```bash
    if (command === "create" && fs.existsSync(destRepoPath)) {
      throw new Error("Repo already exists");
    }
```

# Authors

Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo

# Intro

Create a repository for the given project source tree (including all its files and their folder paths) within the project.

# Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js v11 or higher is required.

# Dependencies

Install Dependencies is done using [npm install](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install
```

## Structure

```bash
|- database (store all repos from users)
|- private (stores all helper JS functions)
	|- js
   		|- Artifact.js
   		|- FolderFunctions.js
    	|- Queue.js
|- public
    |- app
        |- css
            |- styles.css
        |- js
            |- index.js
            |- test.js
        |- index.html
|-server
	|- routes
   		|- index.js
   	|- app.js (entry point)
	|- constants.js (stores all constants)
|-testing (testing repo goes here)
	|- dest (checkout repo goes here)
```

## Stand Up Report

Part 1: [LINK](https://1drv.ms/w/s!AgJrpqI0jWm8gZpljgq3uOegIrgdbQ)

Part 2: [LINK](https://onedrive.live.com/view.aspx?resid=BC698D34A2A66B02!19862&ithint=file%2cdocx&authkey=!APonenOErzhufgc)

## Targets

### Target 1:

- Date: Sep 28th
- Goal: create repo
- Status: Completed

## Guide

- Clone this repo
- Start server with:

```bash
npm start
```

- In browser, use: [localhost:3000](localhost:3000)
- Put project into testing folder
- On the web page:<br />
  _ Provide USERNAME<br />
  _ Provide REPONAME of the repo in testing folder (REPONAME has to match with the name of the repo in the testing folder)<br />

```bash
|- testing
	|-data
		|- user name
		|- repo name
			|- ...
```

# Features

- Create repo
