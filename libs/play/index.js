const fs = require("fs")
const resIO = require('../resIO');
const play = require('../play');

// story 객체의 option_action을 인자로 받아, action의 type별로 분류하여 리턴하는 함수
exports.divideOptionsByTypeOfAction = (option_action) => {
	const execute_actions = []
	const add_actions = []
	const del_actions = []
	
	for (action of option_action) {
		splited_action = action.split("_")
		switch (splited_action[0]) {
			case "execute":
				execute_actions.push(splited_action[1])
				break;
			case "add":
				add_actions.push(splited_action[1])
				break;
			case "del":
				del_actions.push(splited_action[1])
				break;
			default:
		}
	}
	
	return {
		execute: execute_actions,
		add: add_actions,
		del: del_actions
	}
}

// 인자로 전달된 두 정수 사이의 값을 랜덤하게 선택하여 리턴
exports.getRandomIntBetween = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
}

// 다음으로 나올 수 있는 스토리들의 story_id들이 담긴 배열을 받은 뒤, 그 스토리들중 하나를 랜덤하게 선택해 리턴하는 함수
exports.getNextStory = (story_ids, stories) => {
	if (story_ids.length == 0) {
		// 랜덤하게 스토리 하나 선택
		// weight != 0인 story들 중 하나를 선택한다
		// 이미 확인하고 지나간 story는 어떻게??? -> user별로 play하고 넘어간 story들의 목록을 갖고 있어야 할듯? (이 목록은 게임 재시작 하면 빈 리스트로 초기화)
	} else {
		// 스토리의 weight을 이용하여 다음 스토리를 선택
		var weight_total = 0;
		for (story_id of story_ids) {
			weight_total += stories[story_id].weight
		}
		
		var ticket = play.getRandomIntBetween(0, weight_total);
		var next_story = null
		for (story_id of story_ids) {
			next_story = stories[story_id]
			ticket -= stories[story_id].weight
			if (ticket <= 0) break;
		}
		
		return next_story;
	}
}

// 전달받은 story_id를 이용해 해당 story에 대한 정보를 찾은 뒤 그 스토리에 대한 블록킷을 생성해 리턴하는 함수
// function createStoryBlockKit(story_id, stories) {
	
// }


// res/story 디렉토리 내에 있는 json 파일들을 읽어와 하나의 객체에 story들을 모두 넣어 리턴하는 함수
exports.loadStories = (story_dir_path) => {
	const stories = {};
	var story_jsons = null;
	
	try {
		story_jsons = fs.readdirSync(story_dir_path)
	} catch (err) {
		console.log(err);
	}
	
	for (story_json of story_jsons) {
		const story = resIO.readJsonSync(story_dir_path + "/" + story_json);
		Object.assign(stories, story)
	}
	
	return stories
}
