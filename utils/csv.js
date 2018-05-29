const lineReader = require('line-reader')

function checkCSVMissingHeader (filePath, missingHeaderFields = []) {
	return new Promise((resolve) => {
		lineReader.eachLine(filePath, (line) => {
			const rawHeaders = line.split(',')
			const headers = rawHeaders.map((header) => header.replace(/"/g, ''))
			resolve(missingHeaderFields.some((missingHeader) => !headers.includes(missingHeader)))
			return false
		})
	})
}

module.exports = {
	checkCSVMissingHeader,
}
