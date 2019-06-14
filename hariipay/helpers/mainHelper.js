const bcrypt = require('bcryptjs');

class MainHelper {
    constructor() {};
    isExists(str) {
        return typeof str !== 'undefined';
    };
    isUniqueError(_error) {
        return _error.code === 11000;
    };
    isUpdateFail(result) {
        return result.n === 0;
    };
    hashSync(password) {
        return bcrypt.hashSync(password  , 5);
    };
    compareSync(password , hash) {
        return bcrypt.compareSync(password  , hash);
    };
};

module.exports = mainHelper = new MainHelper();
