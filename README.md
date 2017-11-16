# Forge BIM QTO Application

Forge BIM QTO application based on Node.js.

## Prerequisites
* Install [git](https://pages.git.autodesk.com/github-solutions/).
* Install [Node.js LTS](https://nodejs.org/).
* Install [Visual Studio Code](https://code.visualstudio.com/).

## Development Environment
* Clone or download code from [Git](https://git.autodesk.com/consulting-emea/forge-bim-qto)
* Run `npm install`. This will install all dependencies and build both server and client.
* Enter `set CONSUMER_KEY=xxxx` where `xxxx` is unique key for your Forge application. The key can be generated on [Forge portal](https://developer.autodesk.com/).
* Enter `set CONSUMER_SECRET=xxxx` where `xxxx` is unique secret for your Forge application.
* Start node server by typing `npm start`.

## Running the application
1. Open web page [here](http://forge-bim-qto.azurewebsites.net). Note that it's using shared instance so it may take a while when website opens when running for first time.
2. Click on Quanity Take Off button in the main toolbar.
3. The empty QTO panel is displayed.
4. In the Report dropdown select Doors report.
5. List of door elements is displayed. Corresponding elements in the model are highlighted and themed using colors from the list.
6. In the Property dropdown select another property (i.e. Height). The list will be updated.
7. When  row in the list is selected then corresponding elements in the model will be highlighted.
