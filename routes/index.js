// routes/index.js
const express = require('express');
const router = express.Router();
const imageUrl = 'https://drive.google.com/uc?id=';

const libKakaoWork = require('../libs/kakaoWork');
const resIO = require('../libs/resIO');
const play = require('../libs/play');
const block_kit = require('../libs/block-kit');

module.exports = router;

const userInfos = resIO.readJsonSync('res/user.json');
const states = resIO.readJsonSync("res/state.json")
const achievements = resIO.readJsonSync("res/achieve.json")
const stories = play.loadStories("res/story")
divided_option_action = play.divideOptionsByTypeOfAction(stories["mentoring1"]["options"][0]["option_action"])
stories['start']['story_id'] = 'start';
userExample = {
	current_story: "main",
	states: ['health_3', 'wifi_3', 'coin_3'],
	essentials: [],
	achieves: []
}

router.get('/', async (req, res, next) => {
	// 유저 목록 검색 (1)
	const users = await libKakaoWork.getUserList();
	const new_users = [];

	existing_user_ids = Object.keys(userInfos);
	var new_user_added_flag = false;
	for (user of users) {
		if (existing_user_ids.includes(user.id)) continue;

		new_users.push(user);
		Object.assign(userInfos, play.createNewUser(user));
		new_user_added_flag = true;
	}

	var conversations;
	var messages;
	const conv2user = {};
	if (new_user_added_flag) {
		resIO.saveJsonAsync('res/user.json', userInfos, () => {
			console.log('save user.json');
		});

		conversations = await Promise.all(
			new_users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
		);
		
		conversations.forEach((conversation, i) => conv2user[conversation.id] = new_users[i].id);

		// 생성된 채팅방에 메세지 전송 (3)
		messages = await Promise.all([
			conversations.map((conversation) =>
				libKakaoWork.sendMessage(block_kit.storyBlock(conversation.id, userInfos[conv2user[conversation.id]], stories["start"], "start"))
			),
		]);
	}

	// 응답값은 자유롭게 작성하셔도 됩니다.
	res.json({
		users,
		conversations,
		messages,
	});
});

router.post('/request', async (req, res, next) => {
	const { message, value, react_user_id } = req.body;

	switch (value) {
		case 'getUserInfo':
			const modal_block = block_kit.userInfoBlock(userInfos[react_user_id], states, achievements);
			return res.json({view: modal_block});
			break;
		default:
			console.log("여기에 오면 안되는데...")
	}

	res.json({});
});

router.post('/callback', async (req, res, next) => {
	const { message, actions, action_time, value, react_user_id } = req.body; // 설문조사 결과 확인 (2)

	switch (value) {
		case 'gotUserInfo':
			// copied from libs/play/index.js
			play.initUser(react_user_id, userInfos);	
			// userInfos 저장
			play.saveUserInfos(userInfos);
			
			// 처음부터 다시 시작
			const start_block = block_kit.storyBlock(message.conversation_id, userInfos[react_user_id], stories["start"], "start");
			libKakaoWork.sendMessage(start_block);
			break;
			
		default:
			// 게임 진행 중 버튼 선택해 눌렀을 때 여기로 넘어온다
			// value를 parsing해서 어떤 스토리로 넘어갈지 등등 결정해야 한다. (story 객체 이용) + 현재 사용자가 위치하는 story가 맞는지 확인 -> onButtonClicked()에서 확인 
			play.onButtonClicked(value, react_user_id, userInfos, stories, message.conversation_id, states, achievements);
	}

	res.json({ result: true });
});

router.get('/request/img', async (req, res, next) => {
	res.sendFile('/workspace/SWM-mini-soma2033/res/img/' + req.query.name);
})



function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
