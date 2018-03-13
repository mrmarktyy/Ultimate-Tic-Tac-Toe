const readline = require('readline')
const fs = require('fs')

function checkCSVMissingHeader (filePath, missingHeaderFields = []) {
	var lineReader = readline.createInterface({
		input: fs.createReadStream(filePath),
	})

	return new Promise((resolve) => {
		lineReader.on('line',  (line) => {
			const headers = line.split(',')
			lineReader.close()
			resolve(missingHeaderFields.some((missingHeader) => !headers.includes(missingHeader)))
		})
	})
}

module.exports = {
	checkCSVMissingHeader,
}
