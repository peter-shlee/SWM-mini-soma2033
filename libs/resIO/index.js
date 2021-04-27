const fs = require("fs")

// load json file synchronously
exports.readJsonSync = (filePath) => {
	try {
		const jsonString = fs.readFileSync(filePath)
		const jsonObject = JSON.parse(jsonString)
		return jsonObject;
	} catch (err) {
		console.log(err)
		return
	}
};

// save json file synchronously
exports.saveJsonSync = (filePath, jsonObject) => {
	try {
		const jsonString = JSON.stringify(jsonObject)
		fs.writeFileSync(filePath, jsonString)
		return
	} catch (err) {
		console.log(err)
		return
	}
}

// save json file asynchronously
exports.saveJsonAsync = async (filePath, jsonObject, callback) => {
	const jsonString = JSON.stringify(jsonObject)
	fs.writeFile(filePath, jsonString, function (err) {
		if (err) {
			console.log(err)
			return
		} else {
			callback()
		}
	})
	return
}
