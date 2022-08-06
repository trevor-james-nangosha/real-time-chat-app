const moment = require('moment')

const formatMessage = (userName, textMessage) => {
    return {
        userName,
        textMessage,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage