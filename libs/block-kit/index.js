const imgUrl = 'https://swm-chatbot-46uclz-yobetp.run.goorm.io/request/img';
const resIO = require('../resIO');
const play = require('../play');
const suffix = ' (SOMA 2033)'

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
	const state_dict = play.statesList2dict(user_json.states);
	// text length 500 limitation
	if (story_json.body.length > 500) {
		console.log({ story_id: story_id, errorMsg: 'body length 500 exceeded' });
		story_json.body = story_json.body.slice(0, 500);
	}
	const ret_object = {
		conversationId: conversation_id,
		text: '새로운 이야기가 도착했어요!' + suffix,
		blocks: [
			{
				type: 'header',
				text: 'SOMA 2033',
				style: 'blue',
			},
			getStatusBar(
				state_dict["health"],
				state_dict["wifi"],
				state_dict["coin"]
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
	var cnt = -1;
	for (const option of story_json.options) {
		cnt++;
		var flag = 0;
		const option_condition_dict = play.statesList2dict(option.option_condition);
		for (const op of Object.keys(option_condition_dict)) {
			if (!Object.keys(state_dict).includes(op)) {
				flag = 1;
				break;
			}
			
			if (state_dict[op] < option_condition_dict[op]) {
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
				errorMsg: 'btn  option length 20 exceeded',
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
			text: `*☆ 업적 획득 ☆*`,
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
			text: `*☆ 상태 변경 ☆*`,
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
		text: '상태/업적이 변경되었어요!' + suffix,
		blocks: blocks,
	};

	return ret_object;
};

exports.userInfoBlock = (user_json, states, achieves) => {
	txt_state = '*[ 상태 ]*\n';
	for (state of user_json.states) {
		tmp = state.split('_');
		state = states[tmp[0]];
		if (state != undefined && state != null && state != '') {
			tmp[0] = tmp[0].split('-')[0];
			if(tmp[0] == 'team' || tmp[0] == 'mentor' || tmp[0] == 'main')
				txt_state += ' - ' + state + '\n';
			else
				txt_state += ' - ' + state + ' ' + tmp[1] + '\n';
		}
	}
	txt_achieve = '*[ 업적 ]*\n';
	for (achieve of user_json.achieves) {
		achieve = achieves[achieve];
		if (achieve != undefined && achieve != null && achieve != '')
			txt_achieve += ' - ' + achieve + '\n';
	}
	txt_achieve += '\n';
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
  				type: 'input',
				name: 'restart',
  				required: false,
  				placeholder: '재시작'
			},
			{
				type: 'label',
				text: '오류 등으로 인해 재시작을 원할 경우 위에 \"재시작\"을 입력하고 아래 \"확인\"을 눌러주세요. 재시작할 경우 업적을 제외한 모든 데이터가 초기화됩니다. 이외의 경우 뒤로 가기를 눌러주세요.',
				markdown: true
			}
		],
	};
	return ret_object;
};