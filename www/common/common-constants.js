(function () {
var factory = function (AppConfig) {
    return {
        // localStorage
        userHashKey: 'User_hash',
        userNameKey: 'User_name',
        blockHashKey: 'Block_hash',
        fileHashKey: 'FS_hash',
        // Store
        displayNameKey: 'cryptpad.username',
        oldStorageKey: 'CryptPad_RECENTPADS',
        storageKey: 'filesData',
        tokenKey: 'loginToken',
        prefersDriveRedirectKey: 'prefersDriveRedirect',
        isPremiumKey: 'isPremiumUser',
        displayPadCreationScreen: 'displayPadCreationScreen',
        deprecatedKey: 'deprecated',
        MAX_TEAMS_SLOTS: AppConfig.maxTeamsSlots || 5,
        MAX_TEAMS_OWNED: AppConfig.maxOwnedTeams || 5,
        // Apps
        criticalApps: ['profile', 'settings', 'debug', 'admin', 'support', 'notifications', 'calendar'],
        earlyAccessApps: ['doc', 'presentation']
    };
};

if (typeof(module) !== 'undefined' && module.exports) {
    module.exports = factory(
        {} // XXX AppConfig stub
    );
} else if ((typeof(define) !== 'undefined' && define !== null) && (define.amd !== null)) {
    define([
        '/customize/application_config.js',
    ], factory);
}

})();
