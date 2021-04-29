const imgUrl = 'https://swm-mini-soma2033-girbv.run.goorm.io/request/img';
const resIO = require('../resIO');

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
	ret_object = {
		conversationId: conversation_id,
		text: 'SOMA 2033 test',
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
	for (option of story_json.options) {
		cnt++;
		flag = 0;
		for (op of option.option_condition) {
			if (!user_json.states.includes(op)) {
				flag = 1;
				break;
			}
		}
		if (flag) continue;
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

exports.stateUpdateBlock = (conversation_id, user_json, state) => {
	// parameter state is for "representation". plz check once
	ret_object = {
		conversationId: conversation_id,
		text: 'SOMA 2033 test',
		blocks: [
			{
				type: 'header',
				text: '상태 획득!',
				style: 'blue',
			},
			{
				type: 'text',
				text: '상태 ' + state + '획득!',
				markdown: true,
			},
			{
				type: 'divider',
			},
			{
				type: 'button',
				text: '업적/상태 확인하기',
				action_type: 'call_modal',
				action_name: 'AcTioN nAmE',
				value: 'getUserInfo',
				style: 'default',
			},
		],
	};
	return ret_object;
};

exports.achieveUpdateBlock = (conversation_id, user_json, achieve) => {
	// parameter achieve is for "representation". plz check once
	ret_object = {
		conversationId: conversation_id,
		text: 'SOMA 2033 test',
		blocks: [
			{
				type: 'header',
				text: '업적 획득!',
				style: 'blue',
			},
			{
				type: 'text',
				text: '업적 ' + achieve + '획득!',
				markdown: true,
			},
			{
				type: 'divider',
			},
			{
				type: 'button',
				text: '업적/상태 확인하기',
				action_type: 'call_modal',
				action_name: 'AcTioN nAmE',
				value: 'getUserInfo',
				style: 'default',
			},
		],
	};
	return ret_object;
};

exports.userInfoBlock = (user_json, states, achieves) => {
	txt = ''; // text 글자 수 너무 많으면 모달이 안오는거 같아요
	txt += '[ 상태 ]\n';
	for (state of user_json.states) {
		state = state.split('_')[0];
		state = states[state]
		if (state != undefined && state != null && state != '') txt += ' - ' + state + '\n';
	}
	txt += '[ 업적 ]\n';
	for (achieve of user_json.achieves) {
		achieve = achieves[achieve]
		if (achieve != undefined && achieve != null && achieve != '') txt += ' - ' + achieve + '\n';
	}
	ret_object = {
		title: 'User Info',
		accept: '확인',
		decline: '취소',
		value: 'vAlUe', // implement if necessary
		blocks: [
			{
				type: 'label',
				text: txt,
				markdown: true,
			},
		],
	};
	return ret_object;
};