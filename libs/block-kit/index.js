const resIO = require('../resIO');
const imageUrl = 'https://drive.google.com/uc?id=';
const basic_state = resIO.readJsonSync("libs/block-kit/basic-state.json");

getBaseStateUrl = (bs) => {
  return basic_state[bs]
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
        url: imageUrl + getBaseStateUrl(userBaseState[0] + userBaseState[1] + userBaseState[2]), // ToDo: Implementation
      },
      {
        type: 'image_link',
        url: 'https://github.com/shlee4290/SWM-mini-soma2033/blob/main/res/img/sample-image.png?raw=true',
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
