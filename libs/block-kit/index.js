const imgUrl = "https://swm-mini-soma2033-girbv.run.goorm.io/request/img"
const resIO = require('../resIO');

getImageUrl = (imgName) => {
  return imgUrl + "?name=" + imgName;
}

// 스토리 블록킷을 넘겨줍니다.
exports.storyBlock = (conversation_id, user_json, story_json) => {
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
  console.log(imageUrl + story_json.picture);
  console.log(getBaseStateUrl(userBaseState[0] + userBaseState[1] + userBaseState[2]));
  ret_object = {
    conversationId: conversation_id,
    text: 'SOMA 2033 test',
    blocks: [
      {
        type: 'header',
        text: 'SOMA 2033',
        style: 'blue',
      },
      {
        type: 'image_link',
        url: getImageUrl(userBaseState[0] + userBaseState[1] + userBaseState[2] + '.jpg'), // ToDo: Implementation
      },
      {
        type: 'image_link',
        url: getImageUrl(story_json.picture)
      },
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
      value: story_json.story_id + String(cnt),
      style: 'default'
    })
  }

  return ret_object;
}
