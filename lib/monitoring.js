/*
    globals process
*/
const VALUES = {};
VALUES.mem = () => {
    return process.memoryUsage();
};

const applyToEnv = (Env, data) => {
    if (!Env) { return; }
    Env.monitoring[data.pid] = data;
};
const getData = (type) => {
    const value = {
        pid: process.pid,
        type: type
    };
    Object.keys(VALUES).forEach(key => {
        value[key] = VALUES[key]();
    });
    return value;
};

const remove = (Env, pid) => {
    if (Env && Env.monitoring && pid && Env.monitoring[pid]) {
        delete Env.monitoring[pid];
    }
};

module.exports = {
    interval: 5000,
    applyToEnv,
    getData,
    remove
};
