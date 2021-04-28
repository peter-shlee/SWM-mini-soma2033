const fs = require("fs")
const resIO = require('../resIO');
const play = require('../play');
const block_kit = require('../block-kit');
const libKakaoWork = require('../kakaoWork');

// story 객체의 option_action을 인자로 받아, action의 type별로 분류하여 리턴하는 함수
exports.divideOptionsByTypeOfAction = (option_action) => {
	const execute_actions = []
	const add_actions = []
	const del_actions = []
	const add_es_actions = []
	const del_es_actions = []
	var new_start = false
	
	for (action of option_action) {
		splited_action = action.split("_")
		switch (splited_action[0]) {
			case "execute":
				execute_actions.push(splited_action[1]);
				break;
			case "add":
				add_actions.push(splited_action[1]);
				break;
			case "del":
				del_actions.push(splited_action[1]);
				break;
			case "add-es":
				add_es_actions.push(splited_action[1]);
				break;
			case "del-es":
				del_es_actions.push(splited_action[1]);
				break;
			case "new-start":
				new_start = true;
				break;
			default:
		}
	}
	
	return {
		execute: execute_actions,
		add: add_actions,
		del: del_actions,
		add_es: add_es_actions,
		del_es: del_es_actions,
		new_start: new_start
	}
}

// 인자로 전달된 두 정수 사이의 값을 랜덤하게 선택하여 리턴
exports.getRandomIntBetween = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
}

exports.checkPlayableStory = (story, user) => {
	essentials = play.statesList2dict(user.essentials);
	conditions = play.statesList2dict(story.condition);
	states = play.statesList2dict(user.states);
	
	// user.essentials에 있는 것들이 story.condition에 있어야하고 (개수 고려)
	for (essential of Object.keys(essentials)) {
		if (!Object.keys(conditions).includes(essential)) return false;
		
		if (essentials[essential] > condition[essential]) return false;
	}
	
	// story.condition에 있는 것들이 user.states에 있어야한다 (개수 고려)
	for (condition of Object.keys(conditions)) {
		if (!Object.keys(states).includes(condition)) return false;
		
		if (conditions[condition] > states[condition]) return false;
	}

	return true;
}

// 다음으로 플레이 가능한 스토리들을 골라낸다 - story의 condition을 고려 && weight != 0인 story들 중 하나를 선택한다
exports.getPlayableStories = (stories, user) => {
	const playableStories = [];
	
	for (story_id of Object.keys(stories)) {
		if (stories[story_id].weight <= 0) continue;
		
		if (play.checkPlayableStory(stories[story_id], user))
			playableStories.push(story_id);
	}
	
	return playableStories;
}

// 다음으로 나올 수 있는 스토리들의 story_id들이 담긴 배열을 받은 뒤, 그 스토리들중 하나를 랜덤하게 선택해 리턴하는 함수
exports.getNextStoryId = (stories, user, executes) => {/////////////////////////////////////////////////////////////
	if (executes.length != 0) // 다음에 실행할 스토리가 정해져 있는 경우
		return executes[0]
	
	// 랜덤 인카운터
	const playableStories = play.getPlayableStories(stories, user);
	
	var weight_total = 0;
	for (story_id of playableStories) {
		weight_total += stories[story_id].weight
	}
	
	var ticket = play.getRandomIntBetween(0, weight_total);
	var next_story_id = null
	for (story_id of playableStories) {
		next_story_id = story_id
		ticket -= stories[story_id].weight
		if (ticket <= 0) break;
	}
	
	return next_story_id;
}

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

// 카카오 서버에서 보내주는 user 객체를 전달하면 게임에 사용하는 user 객체로 변환하여 리턴하는 함수
exports.createNewUser = (user) => {
	new_user = {};
	new_user[user.id] = {
		current_story: 'start',
		states: ['health_3', 'wifi_3', 'coin_3'],
		achieves: [],
		essentials: [],
	};

	return new_user;
}

exports.initUser = (user_id, userInfos) => {
	userInfos[user_id].current_story = 'start';
	userInfos[user_id].states = ['health_3', 'wifi_3', 'coin_3'];
	userInfos[user_id].essentials = [];
}

exports.statesList2dict = (states_list) => {
	const status_dict = {}
	
	for (state of states_list) {
		const splited_states = state.split("_");
		
		if (splited_states.length == 1)
			splited_states.push(1)
		
		status_dict[splited_states[0]] = parseInt(splited_states[1]);
	}
	
	return status_dict
}

exports.statesDict2list = (states_dict) => {
	const states_list = []
	
	for (state_name of Object.keys(states_dict)) {
		var state_string;
		
		if (states_dict[state_name] === 0 || states_dict[state_name] === undefined) {
			continue;	
		} else {
			state_string = state_name + "_" + states_dict[state_name];
		}
		
		states_list.push(state_string)
	}

	return states_list
}

exports.deleteState = (user_id, userInfos, target_state, count) => {
	const user_states = userInfos[user_id].states;
	const state_dict = play.statesList2dict(user_states);
	
	if (Object.keys(state_dict).includes(target_state)){
		state_dict[target_state] -= count;
		
		if (state_dict[target_state] <= 0)
			delete state_dict[target_state];
	}
	
	const new_user_states = play.statesDict2list(state_dict);
	userInfos[user_id].states = new_user_states;
	
	return;
}

exports.addState = (user_id, userInfos, new_state, count) => {
	const user_states = userInfos[user_id].states;
	const state_dict = play.statesList2dict(user_states);
	
	if (!Object.keys(state_dict).includes(new_state))
		state_dict[new_state] = 0;
	
	state_dict[new_state] += count;
	if (new_state == "health" || new_state ==  "wifi" || new_state == "coin")
		if (state_dict[new_state] > 3)
			state_dict[new_state] = 3;
	
	const new_user_states = play.statesDict2list(state_dict);
	userInfos[user_id].states = new_user_states;
	
	return;
}

exports.deleteEssentialState = (user_id, userInfos, target_state, count) => {
	const user_states = userInfos[user_id].essentials;
	const state_dict = play.statesList2dict(user_states);
	
	if (Object.keys(state_dict).includes(target_state)){
		state_dict[target_state] -= count;
		
		if (state_dict[target_state] <= 0)
			delete state_dict[target_state];
	}
	
	const new_user_states = play.statesDict2list(state_dict);
	userInfos[user_id].essentials = new_user_states;
	
	return;
}

exports.addEssentialState = (user_id, userInfos, new_state, count) => {
	const user_states = userInfos[user_id].essentials;
	const state_dict = play.statesList2dict(user_states);
	
	if (!Object.keys(state_dict).includes(new_state))
		state_dict[new_state] = 0;
	
	state_dict[new_state] += count;
	if (new_state == "health" || new_state ==  "wifi" || new_state == "coin")
		if (state_dict[new_state] > 3)
			state_dict[new_state] = 3;
	
	const new_user_states = play.statesDict2list(state_dict);
	userInfos[user_id].essentials = new_user_states;
	
	return;
}

exports.onButtonClicked = (value, react_user_id, userInfos, stories, conversation_id) => {
	// button의 value parsing
	const splitted_values = play.parseButtonValue(value);
	const current_story_id = splitted_values[0];
	const button_idx = splitted_values[1];
	
	// 현재 사용자가 위치하는 story가 맞는지 확인. 이전 스토리 챗봇의 버튼 눌렀으면 아무 일도 일어나지 않는다.
	if (userInfos[react_user_id].current_story != current_story_id) return;
	
	// option actions 확인하여 user의 states와 essentials 갱신
	const clicked_button_option_actions = stories[current_story_id].options[button_idx].option_action;
	
	const divided_option_action = play.divideOptionsByTypeOfAction(clicked_button_option_actions);
	
	const states_to_add = play.statesList2dict(divided_option_action["add"]);
	// add_page -> page 수 하나씩 추가해야 함
	states_to_add["page"] = 1;
	
	for (state of Object.keys(states_to_add)) {
		play.addState(react_user_id, userInfos, state, states_to_add[state]);
	}
	
	const states_to_delete = play.statesList2dict(divided_option_action["del"]);
	for (state of Object.keys(states_to_delete)) {
		play.deleteState(react_user_id, userInfos, state, states_to_delete[state]);
	}
	
	// essentials 갱신
	const essential_states_to_add = play.statesList2dict(divided_option_action["add_es"]);
	for (state of Object.keys(essential_states_to_add)) {
		play.addEssentialState(react_user_id, userInfos, state, essential_states_to_add[state]);
	}
	
	const essential_states_to_delete = play.statesList2dict(divided_option_action["del_es"]);
	for (state of Object.keys(essential_states_to_delete)) {
		play.deleteEssentialState(react_user_id, userInfos, state, essential_states_to_delete[state]);
	}
	
	// new-start도 처리해야 함
	if (divided_option_action.new_start) {
		// user states 초기화
		play.initUser(react_user_id, userInfos);
		
		// userInfos 저장
		play.saveUserInfos(userInfos);
		
		// 처음부터 다시 시작
		const start_block = block_kit.storyBlock(conversation_id, userInfos[react_user_id], stories["start"], "start");
		libKakaoWork.sendMessage(start_block);
		
		return;
	}
	
	
	// 다음 스토리 실행
	// value parsing한 정보로 어떤 스토리로 넘어갈지 결정 -> getNextStoryId() 이용
	const next_story_id = play.getNextStoryId(stories, userInfos[react_user_id], divided_option_action["execute"]);
	if (!next_story_id) {
		console.log("다음으로 플레이 할 수 있는 스토리가 없어요 ㅠㅠ. 버그일지도...");
		return;
	}
	
	// achieve도 처리해야 함
	play.addAchieves(stories[next_story_id].achieve, react_user_id, userInfos);
	
	// user의 current story 변경해야 함
	userInfos[react_user_id].current_story = next_story_id;
	
	// userInfos 저장
	play.saveUserInfos(userInfos);
	
	// 다음 story 챗봇 전송
	const next_block = block_kit.storyBlock(conversation_id, userInfos[react_user_id], stories[next_story_id], next_story_id);
	libKakaoWork.sendMessage(next_block);
	
	return;
}

exports.parseButtonValue = (value) => {
	values = value.split("_");
	return [values[0], parseInt(values[1])];
}

exports.addAchieves = (new_achieves, user_id, userInfos) => {
	if (new_achieves.length == 0) return;
	
	const concated_achieves = userInfos[user_id].achieves.concat(new_achieves);
	userInfos[user_id].achieves = concated_achieves;
}

exports.saveUserInfos = (userInfos) => {
		resIO.saveJsonSync('res/user.json', userInfos, () => {
			console.log('save user.json');
		});
}