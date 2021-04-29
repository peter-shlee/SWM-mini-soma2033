const imgUrl = 'https://swm-mini-soma2033-girbv.run.goorm.io/request/img';
const resIO = require('../resIO');
const play = require('../play');

getImageUrl = (imgName) => {
	return imgUrl + '?name=' + imgName;
};
getStatusBar = (a, b, c) => {
	txt = '';
	if (a == 0) txt += '💔';
	for (i = 0; i < a; i++) txt += '❤️';
	txt += ' | ';
	if (b == 0) txt += '📵';
	for (i = 0; i < b; i++) txt += '📡';
	txt += ' | ';
	if (c == 0) txt += '❌';
	for (i = 0; i < c; i++) txt += '💰';
	return {
		type: 'text',
		text: txt,
		markdown: true,
	};
};

// 스토리 블록킷을 넘겨줍니다.
exports.storyBlock = (conversation_id, user_json, story_json, story_id) => {
	userBaseState = ['', '', ''];
	for (state of user_json.states) {
		first = state.split('_')[0];
		if (first == 'health') {
			userBaseState[0] = state.split('_')[1];
		}
		if (first == 'wifi') {
			userBaseState[1] = state.split('_')[1];
		}
		if (first == 'coin') {
			userBaseState[2] = state.split('_')[1];
		}
	}
	// text length 500 limitation
	if (story_json.body.length > 500) {
		console.log({ story_id: story_id, errorMsg: 'body length 500 exceeded' });
		story_json.body = story_json.body.slice(0, 500);
	}
	ret_object = {
		conversationId: conversation_id,
		text: '새로운 이야기가 도착했어요!',
		blocks: [
			{
				type: 'header',
				text: 'SOMA 2033',
				style: 'blue',
			},
			getStatusBar(
				parseInt(userBaseState[0]),
				parseInt(userBaseState[1]),
				parseInt(userBaseState[2])
			),
			{
				type: 'text',
				text: story_json.body,
				markdown: true,
			},
			{
				type: 'divider',
			},
		],
	};
	if (story_json.picture) {
		imgBlock = {
			type: 'image_link',
			url: getImageUrl(story_json.picture),
		};
		ret_object.blocks.splice(2, 0, imgBlock);
	}
	cnt = -1;
	user_states = [];
	for (state of user_json.states) {
		user_states.push(state.split('_')[0]);
	}
	for (option of story_json.options) {
		cnt++;
		flag = 0;
		for (op of option.option_condition) {
			if (!user_states.includes(op)) {
				flag = 1;
				break;
			}
		}
		if (flag) continue;
		// Button string length 20 limitation
		if (option.option_text.length > 20) {
			console.log({
				story_id: story_id,
				option_text: option.option_text,
				errorMsg: 'length 20 exceeded',
			});
			option.option_text = option.option_text.slice(0, 20);
		}
		ret_object.blocks.push({
			type: 'button',
			text: option.option_text,
			action_type: 'submit_action',
			action_name: 'AcTioN nAmE',
			value: story_id + '_' + String(cnt),
			style: 'default',
		});
	}
	return ret_object;
};

exports.showUpdatedStatesAndAchieve = (
	conversation_id,
	added_states,
	deleted_states,
	achieve,
	stateInfos,
	achieveInfos
) => {
	const blocks = [];
	var states_exist = false;

	const added_states_dict = play.statesList2dict(added_states);
	const deleted_states_dict = play.statesList2dict(deleted_states);

	for (state of Object.keys(added_states_dict)) {
		if (
			stateInfos[state] == undefined ||
			stateInfos[state] == null ||
			stateInfos[state] == ''
		) {
			delete added_states_dict[state];
		}
	}

	for (state of Object.keys(deleted_states_dict)) {
		if (
			stateInfos[state] == undefined ||
			stateInfos[state] == null ||
			stateInfos[state] == ''
		) {
			delete deleted_states_dict[state];
		}
	}

	if (Object.keys(added_states_dict).length + Object.keys(deleted_states_dict).length > 0)
		states_exist = true;

	if (achieve != '') {
		blocks.push({
			type: 'text',
			text: `☆ 업적 획득 ☆`,
			markdown: true,
		});

		blocks.push({
			type: 'text',
			text: `- "${achieveInfos[achieve]}" 업적을 획득하였습니다!`,
			markdown: true,
		});

		if (states_exist) {
			blocks.push({
				type: 'divider',
			});
		}
	}

	if (states_exist) {
		blocks.push({
			type: 'text',
			text: `☆ 상태 변경 ☆`,
			markdown: true,
		});

		for (const st of Object.keys(deleted_states_dict)) {
			blocks.push({
				type: 'text',
				text: `- ${stateInfos[st]} ${deleted_states_dict[st]}개 잃었습니다.`,
				markdown: true,
			});
		}

		for (const st of Object.keys(added_states_dict)) {
			blocks.push({
				type: 'text',
				text: `- ${stateInfos[st]} ${added_states_dict[st]}개 얻었습니다.`,
				markdown: true,
			});
		}
	}

	if (blocks.length > 0) {
		blocks.push({
			type: 'button',
			text: '업적/상태 확인하기',
			action_type: 'call_modal',
			action_name: 'AcTioN nAmE',
			value: 'getUserInfo',
			style: 'default',
		});
	}

	ret_object = {
		conversationId: conversation_id,
		text: '상태/업적이 변경되었어요!',
		blocks: blocks,
	};

	return ret_object;
};

exports.userInfoBlock = (user_json, states, achieves) => {
	txt_state = '[ 상태 ]\n';
	for (state of user_json.states) {
		state = state.split('_')[0];
		state = states[state];
		if (state != undefined && state != null && state != '') txt_state += ' - ' + state + '\n';
	}
	txt_achieve = '[ 업적 ]\n';
	for (achieve of user_json.achieves) {
		achieve = achieves[achieve];
		if (achieve != undefined && achieve != null && achieve != '')
			txt_achieve += ' - ' + achieve + '\n';
	}
	// text length 200 limitation
	if (txt_state.length > 200) {
		console.log({ txt_state: txt_state, errorMsg: 'length 200 exceeded' });
		txt_state = '글자수 초과로 인해 상태를 불러올 수 없습니다.';
	}
	if (txt_achieve.length > 200) {
		console.log({ txt_achieve: txt_achieve, errorMsg: 'length 200 exceeded' });
		txt_achieve = '글자수 초과로 인해 업적을 불러올 수 없습니다.';
	}
	ret_object = {
		title: 'User Info',
		accept: '확인',
		decline: '취소',
		value: 'gotUserInfo', // implement if necessary
		blocks: [
			{
				type: 'label',
				text: txt_state,
				markdown: true,
			},
			{
				type: 'label',
				text: txt_achieve,
				markdown: true,
			},
			{
  				'type': 'input',
				'name': 'restart',
  				'required': false,
  				'placeholder': '재시작'
			},
			{
				type: 'label',
				text: '오류 등으로 인해 재시작을 원할 경우 위에 \"재시작\"을 입력하고 아래 \"확인\"을 눌러주세요. 이외의 경우 뒤로 가기를 눌러주세요.',
				markdown: true
			}
		],
	};
	return ret_object;
};