# Prefixer - Auto prefix adding tool

## Overview
Prefixer is a tool that automatically adds prefix to files. It would be helpful when you want to do numbering multiple files at the same time, or you can even save files one by one while this tool automatically rename your saved file with numbered prefix in the background.

This tool is powered by Node.js Javascript Runtime and packaged using pkg.

### Installation
See the release tab and download the right one for your platform. Currently supporting Windows and macOS.

### Basic Usage
1. Place binary (Prefixer-win.exe or Prefixer-macos) just inside the folder which contains files you want to do numbering.
2. Double-click binary to run the tool
3. Check the detected working directory shown in the console to make sure that it is the right one you chosen.
4. Type "yes" to proceed, or "no" to quit the program.
5. If you proceed, the tool will start watching newly created files & existing files and rename them as needed.

### Build
In some cases, such as you are worried about the safety of codes, you can always clone this repository to see the source code and build your own binary.
Firstly, you need to install npm to your system in advance.

After downloading repository to your local folder, run `npm install -D` to install all modules required to run, build and test project.

To build, run `npm run build` inside the project root directory.

### Test
You can easily test the behavior of the tool. To test, create `test` folder inside the root directory and run `npm test`. Check the behavior by placing random files in `test` folder.


### Disclaimer & License
This tool is licensed under MIT License, which means you can use this tool freely and modify the source or executables as you want. However, I am not responsible for any damage caused by the use of this software.