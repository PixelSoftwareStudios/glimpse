#!/usr/bin/env node

const program = require("commander");
const promise = require("bluebird");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const exec = promise.promisify(require("child_process").exec);
const LineByLineReader = require("line-by-line");

var keyword;
var folder;
var excludedFolder;
var file;
var excludedFile;
var list = [];
var caseSensitive = false;

let getAllFilesInDir = new Promise((resolve, reject) => {
	var files = [];
	console.log("hello " + folder);
	exec(`find ${folder}`)
		.then((stdout, stderr) => {
			var files = [];
			var fileList = stdout.split("\n");
			fileList.forEach(fileEntry => {
				fileEntry = path.normalize(fileEntry);
				if (fileEntry.includes(folder)) {
					fs.stat(getAbsolutePath(fileEntry), (err, stats) => {
						if (stats.isFile()) {
							files.push(getAbsolutePath(fileEntry));
							console.log("Www");
						}
					});
				} else {
					console.log("Ffd");
				}
			});
			resolve(files);
		}).catch(err => {
			console.error(err);
		});
});

program
	.version('1.0.2')
	.description("A command that allows you to look inside code.")
	.arguments("<keyword>")
	.option("-f, --folder [folder]", "Folder to search")
	.option("-F, --file [file]", "File to search")
	.option("-e, --excludefolder [excludedfolder]", "Exclude a folder in the search")
	.option("-E, --excludefile [excludedfile]", "Exclude a file in the search")
	.option("-c, --casesensitive", "Whether to search for the keyword casesensitively, default false")
	.action((keywordd) => {
		if (keywordd) {
			keyword = keywordd;
		} else {
			return console.log("Please input a keyword");
		}
	})
	.parse(process.argv);

if (!program.args.length) {
	program.help();
} else {
	if (program.casesensitive) {
		caseSensitive = true;
	}

	if (program.folder) {
		if (!program.folder) {
			folder = ".";
		} else {
			folder = getAbsolutePath(program.folder);
			console.log(folder);
			if (folder.includes(" ")) {
				folder = '"' + folder + '"';
				console.log(folder);
			}

			console.log(folder);
		}
	}

	if (program.file) {
		file = getAbsolutePath(program.file);
	}

	if (program.excludefolder) {
		excludedFolder = getAbsolutePath(program.excludefolder);
	}

	if (program.excludefile) {
		excludedFile = getAbsolutePath(program.excludefile);
	}

	if (folder) {
		if (excludedFolder) {

		} else {
			main();
		}
	}

	if (file) {

	}

}


function getAbsolutePath(inp) {
	if (!path.isAbsolute(inp)) {
		return path.resolve(inp) + path.sep;
	} else {
		return inp;
	}
}

function main() {
	getAllFilesInDir.then(fileList => {
		fileList.forEach(file => {
			var lr = new LineByLineReader(file);
			var lineNumber = 1;

			lr.on("error", err => {
				console.log("err", err);
			});

			lr.on("line", line => {
				if (caseSensitive) {
					if (line.includes(keyword)) {
						console.log(line);
						if (line == keyword) {
							list.push(chalk.green("In " + file + ": Line #" + lineNumber + ": ") + chalk.bold(keyword));
						} else {
							var linePart1 = line.substring(0, line.indexOf(keyword));
							var linePart2 = line.substring(line.indexOf(keyword) + keyword.length, line.length);
							var lineHighlighted = linePart1 + chalk.bold(keyword) + linePart2;
							list.push(chalk.green("In " + file + ": Line #" + lineNumber + ": ") + lineHighlighted);
						}
					} else {
						console.log("line: " + line);
					}
				} else {
					if (line.toLowerCase().includes(keyword.toLowerCase())) {
						if (line.toLowerCase() == keyword.toLowerCase()) {
							list.push(chalk.green("In " + file + ": Line #" + lineNumber + ": ") + chalk.bold(keyword));
						} else {
							var linePart1 = line.substring(0, line.indexOf(keyword));
							var linePart2 = line.substring(line.indexOf(keyword) + keyword.length, line.length);
							var lineHighlighted = linePart1 + chalk.bold(keyword) + linePart2;
							list.push(chalk.green("In " + file + ": Line #" + lineNumber + ": ") + lineHighlighted);
						}
					}
				}

				lineNumber++;
			});

			lr.on("end", () => {

			});
		});


		console.log("helo");

		list.forEach(line => {
			console.log(line);
		});
	}).catch(err => {
		console.log(err);
	});
}
