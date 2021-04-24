const fs = require("fs")
const resIO = require('../resIO');
const play = require('../play');

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

exports.getRandomIntBetween = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
}

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

// function createStoryBlockKit(story_id, ) {
	
// }

exports.loadStory = (story_dir_path) => {
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
