module.exports = {
    Mode: require('./Mode'),
    FFA: require('./FFA'),
    Teams: require('./Teams'),
    Experimental: require('./Experimental'),
    Rainbow: require('./Rainbow'),
    EjectEat: require('./EjectEat'),
    Tournament: require('./Tournament'),
    HungerGames: require('./HungerGames'),
};

var get = function (id) {
    var mode;
    switch (parseInt(id)) {
        case 1:
            mode = new module.exports.Teams();
            break;
        case 2:
            mode = new module.exports.Experimental();
            break;
        case 3:
            mode = new module.exports.Rainbow();
            break;
        case 4:
            mode = new module.exports.EjectEat();
            break;
        case 5:
            mode = new module.exports.Tournament();
            break;
        case 6:
            mode = new module.exports.HungerGames();
            break;
        default:
            mode = new module.exports.FFA();
            break;
    }
    return mode;
};

module.exports.get = get;
