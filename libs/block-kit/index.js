const imgUrl = "https://swm-mini-soma2033-girbv.run.goorm.io/request/img"
const resIO = require('../resIO');

getImageUrl = (imgName) => {
  return imgUrl + "?name=" + imgName;
}
getStatusBar = (a, b, c) => {
  txt = '';
	a=0;b=0;c=0;
  if(a == 0) txt += '💔';
  for(i = 0; i < a; i++) txt += '❤️'; txt += ' | ';
  if(b == 0) txt += '📵';
  for(i = 0; i < b; i++) txt += '📡'; txt += ' | ';
  if(c == 0) txt += '❌';
  for(i = 0; i < c; i++) txt += '💰';
  return {
    type: 'text',
    text: txt,
    markdown: true,
  };
}

// 스토리 블록킷을 넘겨줍니다.
exports.storyBlock = (conversation_id, user_json, story_json, story_id) => {
  userBaseState = ['', '', ''];
  for(state of user_json.states){
    first = state.split('_')[0]
    if(first == 'health'){
      userBaseState[0] = state.split('_')[1];
    }
    if(first == 'wifi'){
      userBaseState[1] = state.split('_')[1];
    }
    if(first == 'coin'){
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
      getStatusBar(parseInt(userBaseState[0]), parseInt(userBaseState[1]), parseInt(userBaseState[2])),
      {
        type: 'text',
        text: story_json.body,
        markdown: true,
      },
      {
        type: 'divider',
      }
    ],
  }
  if(story_json.picture){
    imgBlock = {
      type: 'image_link',
      url: getImageUrl(story_json.picture)
    };
	ret_object.blocks.splice(2, 0, imgBlock);
  }
  cnt = -1;
  for(option of story_json.options){
    cnt++;
    flag = 0;
    for(op of option.option_condition){
      if(!user_json.states.includes(op)) {flag = 1; break;}
    }
    if(flag) continue;
    ret_object.blocks.push({
      type: 'button',
      text: option.option_text,
      action_type: 'submit_action',
      action_name: "AcTioN nAmE",
      value: story_id + '_' + String(cnt),
      style: 'default'
    })
  }
  return ret_object;
}
