const ts = require('tinyspeck');
const port = process.env.PORT || 3000;
const token = process.env.TOKEN;

let slack = ts.instance({ token: token });

// watch for /ezpoll slash command
slack.on('/ezpoll', payload => {
    var parsedMessage = parseMessage(payload.text);
    var formattedMessage = formatMessage(parsedMessage);
    slack.send(payload.response_url, formattedMessage);
});

// Parse raw message string separated by quotes
function parseMessage(message) {
    var parsedMessage = {};
    var messageParts = message.slice(1,-1).replace(/[\u201C\u201D]/g, '"').split(/"\W+"/);
    parsedMessage.title = messageParts[0];
    parsedMessage.options = messageParts.slice(1);
    return parsedMessage;
}

// Format message object for Slacks API
function formatMessage(message) {
    var formattedMessage = {};
    if (message.options.length < 2) {
        formattedMessage.response_type = 'ephemeral';
        formattedMessage.text = 'You need at least 2 options for your poll';
    } else if (message.options.length > 10) {
        formattedMessage.response_type = 'ephemeral';
        formattedMessage.text = 'Sorry, I can only support up to 10 options for your poll :disappointed:';
    } else {
        formattedMessage.text = `*${message.title}*`;
        formattedMessage.response_type = 'in_channel';
        formattedMessage.attachments = [];
        var buttons = [];
        emojiMap = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];

        message.options.forEach(function(option, i) {
            formattedMessage.attachments.push({ text: `${emojiMap[i]}  ${option}`, fallback: ' ' });
            buttons.push({
                name: emojiMap[i],
                text: emojiMap[i],
                type: 'button',
                value: emojiMap[i],
            });
        });
        formattedMessage.attachments.push({
            text: '',
            actions: buttons,
            callback_id: 'user_voted'
        });
        if (buttons.length > 5) {
            formattedMessage.attachments.push({
                text: '',
                actions: buttons.splice(5),
                callback_id: 'user_voted'
            });
        }
        formattedMessage.attachments.push({
            text: '',
            actions: [{
                name: 'delete',
                text: 'Delete',
                type: 'button',
                value: 'delete',
                style: 'danger',
                confirm: {
                    title: 'Are you sure?',
                    text: 'All votes will be lost forever :cold_sweat:',
                    ok_text: 'Yes',
                    dismiss_text: 'No',
                }
            }],
            callback_id: 'user_deleted'
        });
    }
    return formattedMessage;
}

// Receive payload from vote button and update message
slack.on('/slack/vote', (req, res) => {
    res.end();
    var reqBody = req.body;
    var updatedMessage;
    if (reqBody.actions[0].value === 'delete') {
        updatedMessage = {
            text: `:wastebasket: This poll was deleted by <@${reqBody.user.id}>`,
        };
    } else {
        updatedMessage = reqBody.original_message;
        updatedMessage.attachments.filter((opt) => {
            if (opt.text && opt.text.includes(reqBody.actions[0].value)) {
                var originalText = opt.text.split('   `');
                if (!opt.fallback.includes(`<@${reqBody.user.id}>`)) {
                    opt.fallback += `<@${reqBody.user.id}>, `;
                    var votes = opt.fallback.trim().split(',').slice(0, -1);
                    opt.text = originalText[0] + '   `' + votes.length + '`\n' + votes;
                } else {
                    var updatedFallback = opt.fallback.replace(`<@${reqBody.user.id}>, `, '');
                    opt.fallback = updatedFallback;
                    if (opt.fallback.trim().length === 0) {
                        opt.text = originalText[0];
                    } else {
                        var votes = opt.fallback.trim().split(',').slice(0, -1);
                        opt.text = originalText[0] + '   `' + votes.length + '`\n' + votes;
                    }
                }
            }
        });
    }
    slack.send(reqBody.response_url, updatedMessage);
});

// incoming http requests
slack.listen(port);
