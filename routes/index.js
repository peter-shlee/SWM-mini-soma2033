// routes/index.js
// leeez : https://swm-mini-soma2033-hvbpc.run.goorm.io
const express = require('express');
const router = express.Router();
const imageUrl = 'https://drive.google.com/uc?id=';

const libKakaoWork = require('../libs/kakaoWork');
const resIO = require('../libs/resIO');
const play = require('../libs/play');
const block_kit = require('../libs/block-kit');

module.exports = router;

const userInfos = resIO.readJsonSync('res/user.json');
// const states = resIO.readJsonSync("res/state.json")
// const achivements = resIO.readJsonSync("res/achieve.json")
const stories = play.loadStories("res/story")
divided_option_action = play.divideOptionsByTypeOfAction(stories["mentoring1"]["options"][0]["option_action"])
<<<<<<< HEAD
stories['start']['story_id'] = 'start';
=======
// console.log(divided_option_action)
// console.log(play.getNextStory(divided_option_action["execute"], stories))
//console.log(resIO.readJsonSync('res/state.json'));
>>>>>>> a6bd37448dfad341c21e1cb50822ed469d51a18e
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
	if (new_user_added_flag) {
		resIO.saveJsonAsync('res/user.json', userInfos, () => {
			console.log('save user.json');
		});

		conversations = await Promise.all(
			new_users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
		);

		// 생성된 채팅방에 메세지 전송 (3)
		messages = await Promise.all([
			conversations.map((conversation)
				libKakaoWork.sendMessage(getWelcomBlock(conversation))
			),
		]);
		
		
		// messages = await Promise.all([
		// 	conversations.map((conversation) =>
		// 		libKakaoWork.sendMessage(block_kit.storyBlock(conversation.id, ))
		// 	),
		// ]);
	}

	// 응답값은 자유롭게 작성하셔도 됩니다.
	res.json({
		users,
		conversations,
		messages,
	});
});

router.post('/request', async (req, res, next) => {
	const { message, value } = req.body;

	switch (value) {
		case 'cafe_survey':
			// 설문조사용 모달 전송
			return res.json({
				view: {
					title: '설문조사',
					accept: '설문조사 전송하기',
					decline: '취소',
					value: 'cafe_survey_results',
					blocks: [
						{
							type: 'label',
							text: '카페 평점을 알려주세요',
							markdown: false,
						},
						{
							type: 'select',
							name: 'rating',
							required: true,
							options: [
								{
									text: '1점',
									value: '1',
								},
								{
									text: '2점',
									value: '2',
								},
								{
									text: '3점',
									value: '3',
								},
								{
									text: '4점',
									value: '4',
								},
								{
									text: '5점',
									value: '5',
								},
							],
							placeholder: '평점',
						},
						{
							type: 'label',
							text: '바라는 점이 있다면 알려주세요!',
							markdown: false,
						},
						{
							type: 'input',
							name: 'wanted',
							required: false,
							placeholder: 'ex) 와플을 팔면 좋겠습니다',
						},
					],
				},
			});
			break;
		default:
	}

	res.json({});
});

router.post('/callback', async (req, res, next) => {
	const { message, actions, action_time, value, react_user_id } = req.body; // 설문조사 결과 확인 (2)

	console.log(value);
	console.log(req.body)

	switch (value) {
		case 'welcome':
			console.log(userInfos[react_user_id])
			await libKakaoWork.sendMessage(libKakaoWork.sendMessage(block_kit.storyBlock(message.conversation_id, userInfos[react_user_id], stories, "start")));
			break;

		case 'cafe_survey_results':
			// 설문조사 응답 결과 메세지 전송 (3)
			await libKakaoWork.sendMessage({
				conversationId: message.conversation_id,
				text: '설문조사에 응해주셔서 감사합니다!',
				blocks: [
					{
						type: 'text',
						text: '설문조사에 응해주셔서 감사합니다! 🎁',
						markdown: true,
					},
					{
						type: 'text',
						text: '*답변 내용*',
						markdown: true,
					},
					{
						type: 'description',
						term: '평점',
						content: {
							type: 'text',
							text: actions.rating,
							markdown: false,
						},
						accent: true,
					},
					{
						type: 'description',
						term: '바라는 점',
						content: {
							type: 'text',
							text: actions.wanted,
							markdown: false,
						},
						accent: true,
					},
					{
						type: 'description',
						term: '시간',
						content: {
							type: 'text',
							text: action_time,
							markdown: false,
						},
						accent: true,
					},
				],
			});
			break;
		default:
		// 게임 진행 중 버튼 선택해 눌렀을 때 여기로 넘어온다
		// value를 parsing해서 어떤 스토리로 넘어갈지 등등 결정해야 한다. (story 객체 이용) + 현재 사용자가 위치하는 story가 맞는지 확인 필요
	}

	res.json({ result: true });
});

router.get('/request/img', async (req, res, next) => {
	console.log(req.query.name);
	res.sendFile('/workspace/SWM-mini-soma2033/res/img/' + req.query.name);
})

// console.log(stories);
// //console.log(stories["mentoring1"]["options"][0]["option_action"])
// divided_option_action = play.divideOptionsByTypeOfAction(
// 	stories['conv12']['options'][0]['option_action']
// );
// console.log(divided_option_action);
// next_execute = divided_option_action['execute'];
// console.log(play.getNextStoryId(stories, userInfos[2632306], next_execute));
// //console.log(resIO.readJsonSync('res/state.json'));


// console.log(userInfos[2632306].states)
// const state_dict = play.statesList2dict(userInfos[2632306].states);
// console.log(state_dict);
// const state_list = play.statesDict2list(state_dict);
// console.log(state_list);

// play.addState(2632306, userInfos, "hello", 2);
// console.log("add hello");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "backend", 3);
// console.log("delete backend");
// console.log(userInfos);
// play.addState(2632306, userInfos, "backend", 1)
// console.log("add backend");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "health", 1)
// console.log("delete health");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "backend", 2)
// console.log("delete backend");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "backend", 1)
// console.log("delete backend");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "health", 1)
// console.log("delete health");
// console.log(userInfos);
// play.deleteState(2632306, userInfos, "coin", 1)
// console.log("delete coin");
// console.log(userInfos);
// play.addState(2632306, userInfos, "coin", 1)
// console.log("add coin");
// console.log(userInfos);
// play.addState(2632306, userInfos, "coin", 1)
// console.log("add coin");
// console.log(userInfos);
// play.addState(2632306, userInfos, "health", 1)
// console.log("add health");
// console.log(userInfos);

function getWelcomBlock(conversation) {
	return {
					conversationId: conversation.id,
					text: 'SOMA 2033 test',
					blocks: [
						{
							type: 'header',
							text: 'SOMA 2033',
							style: 'blue',
						},
						{
							type: 'image_link',
							url: imageUrl + '1HPY4cY7ml_zkpCuf7zdgTPA-sju97fzu',
						},
						{
							type: 'text',
							text:
								'📟전세계가 주목하는 소마2033📟\n2033년, 기술의 발전은 모든 전문가의 예상을 깨고 급속도로 발전하여, 인류는 화성에 거주지를 마련하고, 인공지능 로봇이 지배하는 국가와 전쟁을 벌이고, 사후세계대신 가상세계로 이주를 시작하였습니다.\n이러한 추세를 따라가기 위해서는 열심히 소프트웨어 역량을 길러야겠죠!?\n2021년 한국의 소프트웨어 인재를 양성하는 프로그램이었던 소프트웨어 마에스트로는 이제 ❗️전세계에서 가장 유명한 소프트웨어 인재양성 프로그램❗️이 되었습니다!\n면접 경쟁률만 2033:1인 경쟁률을 뚫고 당신은 소프트웨어 마에스트로 프로그램에 합격한 당신은 이제 프로젝트를 수행하기 위해서 모험을 떠납니다! 준비되셨나요?',
							markdown: true,
						},
						{
							type: 'divider',
						},
						{
							type: 'button',
							text: '🕹 게임 시작하기',
							action_type: 'submit_action',
							action_name: 'welcome', // action_name이 없으면 submit_action 작동 안함
							value: 'welcome',
							style: 'default',
						},
					],
				}
}

function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
