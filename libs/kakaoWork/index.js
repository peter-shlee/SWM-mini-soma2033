// libs/kakaoWork/index.js
const Config = require('config');

const axios = require('axios');
const kakaoInstance = axios.create({
	baseURL: 'https://api.kakaowork.com',
	headers: {
		Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
	},
});

// 유저 목록 검색 (1)
exports.getUserList = async () => {
	var all_users = [];
	var res = await kakaoInstance.get('/v1/users.list?limit=50');
	all_users = all_users.concat(res.data.users)
	while (res.data.cursor) {
		try{
			res = await kakaoInstance.get(`/v1/users.list?cursor=${res.data.cursor}`);
			all_users = all_users.concat(res.data.users);
		} catch (err) {
			console.log(err);
			break;
		}
	}
	return all_users;
};

// 채팅방 생성 (2)
exports.openConversations = async ({ userId }) => {
	const data = {
		user_id: userId,
	};
	const res = await kakaoInstance.post('/v1/conversations.open', data);
	return res.data.conversation;
};

// 메시지 전송 (3)
exports.sendMessage = async ({ conversationId, text, blocks }) => {
	const data = {
		conversation_id: conversationId,
		text,
		...(blocks && { blocks }),
	};
	const res = await kakaoInstance.post('/v1/messages.send', data);
	return res.data.message;
};