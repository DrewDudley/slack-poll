const ts = require('tinyspeck');
const port = process.env.PORT || 3000;
const token = process.env.TOKEN;

// setting defaults for all Slack API calls
let slack = ts.instance({ token: token });

// watch for slash command
slack.on('/bhpoll', payload => {
  let parsedMessage = parseMessage(payload.text);
  let message = formatMessage(parsedMessage);

  slack.send(payload.response_url, message);
});

// Format message object for Slacks API
function formatMessage(message) {
  var poll = {};

  if (message.options.length < 2) {
    poll.response_type = "ephemeral";
    poll.text = "You need at least 2 options for your poll";
  } else if (message.options.length > 10) {
    poll.response_type = "ephemeral";
    poll.text = "Sorry, I can only support up to 10 options for your poll :disappointed:";
  } else {
    poll.text = '*' + message.title + '*';
    poll.response_type = "in_channel";
    poll.attachments = [{
      text: '',
      color: '#567dd0'
    }];
    emojiMap = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];
  
    message.options.forEach(function(option, i) {
      poll.attachments[0].text += emojiMap[i] + '  ' + option + '\n\n';
    });
  }
  return poll;
}

// Parse raw message string separated by quotes
function parseMessage(message) {
  var parsedMessage = {};
  var messageParts = message.replace(/(^"|"$)/g, '').split('" "');
  parsedMessage.title = messageParts[0];
  parsedMessage.options = messageParts.slice(1);
  return parsedMessage;
}

// incoming http requests
slack.listen(port);