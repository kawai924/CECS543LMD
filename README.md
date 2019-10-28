# CECS543LMD

VCS Project for CECS 543 Sec 07 11646

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
|- data (as a database to store repos)
|- private
	|- js (backend helper functions)
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
   	|- app.js (start server)
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
  _ Provide name of user<br />
  _ Provide name of the repo in testing folder<br />
- (Testing phase) A clone of the repo from testing folder will be generated into

```bash
|- testing
	|-data
		|- user name
		|- repo name
			|- ...
```

# Features

- Create repo
