console.log(__dirname);
const Message = require('./dao/models/message.model'); 
console.log(Message);

describe('testing Users Dao', () => {
    before (function () {
        console.log('before');
    });
    after (function () {
        console.log('after');
    });
    beforeEach (function () {
        console.log('beforeEach');
    });
    afterEach (function () {
        console.log('afterEach');
    });
});