# CECS543LMD
VCS Project for CECS 543 Sec 07 11646.

# Authors
Liam Nguyen
Matt Nguyen
Marco Curci
Dennis Lo

# Intro
Create a repository for the given project source tree (including all its files and their folder paths) within the project.

# Dependencies
Body-Parser:
This program uses Body Parser to grab the file location input from the user.
If you do not have Body Parse please run ```bash npm install body-parser```

Node:
This program uses Node JS for backend functions. For more information on how to install Node see: https://nodejs.org/en/

## Files in Zip
```bash
|- app.js
|- helpers
    |- Artifact.js
    |- FolderFunctions.js
    |- Queue.js
|- import (where the created Repos will be stored.)
|- public
    |- app
        |- css
            |- styles.css
        |- js
            |- index.js
            |- test.js
        |- index.html
|- routes
    |- index.js

```


## stand up report
file location  
https://1drv.ms/w/s!AgJrpqI0jWm8gZpljgq3uOegIrgdbQ

## Target 1 (Due date sep 28th)
create repo

## How to
put in your desired project name   
then the target file path in your local computer  
and click submit  
your target file should be copied to import folder under the following structure  
```bash
import/[project name folder]/[file name folder]/[artifacts file]
```


## folder structure
```bash
Master
|- app.js (entry point)
|- helpers (functions dir)
|- app (UI dir)
|- import (uplaod file dir)
    |- user project (repo)
    |   |- file name (dir)
    |   |   |-manifest file
```

# Features
Available now:
- Create Repo.

# Bugs
N/A