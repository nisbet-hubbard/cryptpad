define([
    'jquery',
    '/api/config',
    '/common/outer/network-config.js',
    '/common/common-credential.js',
    '/common/common-realtime.js',
    '/common/common-constants.js',
    '/common/common-interface.js',
    '/common/outer/local-store.js',
    '/customize/messages.js',
    '/common/outer/login-block.js',
    '/common/common-hash.js',
    '/common/login.js',

    '/bower_components/scrypt-async/scrypt-async.min.js', // better load speed
], function ($, ApiConfig, NetConfig, Cred, Realtime, Constants, UI,
            LocalStore, Messages, Block, Hash, Login) {
    var Exports = {
        Cred: Cred,
        Block: Block,
        // this is depended on by non-customizable files
        // be careful when modifying login.js
        requiredBytes: 192,
    };

    var redirectTo = '/drive/';
    var setRedirectTo = function () {
        var parsed = Hash.parsePadUrl(window.location.href);
        if (parsed.hashData && parsed.hashData.newPadOpts) {
            var newPad = Hash.decodeDataOptions(parsed.hashData.newPadOpts);
            redirectTo = newPad.href;
        }
    };
    if (window.location.hash) {
        setRedirectTo();
    }

    var setMergeAnonDrive = function () { Exports.mergeAnonDrive = 1; };

    var login = Login({
        websocketURL: NetConfig.getWebsocketURL(),
        fileHost: ApiConfig.fileHost || window.location.origin,
        setMergeAnonDrive: setMergeAnonDrive
    });
    Exports.allocateBytes = login.allocateBytes;
    Exports.loginOrRegister = login.loginOrRegister;

    Exports.redirect = function () {
        if (redirectTo) {
            var h = redirectTo;
            var loginOpts = {};
            if (Exports.mergeAnonDrive) {
                loginOpts.mergeAnonDrive = 1;
            }
            h = Hash.getLoginURL(h, loginOpts);

            var parser = document.createElement('a');
            parser.href = h;
            if (parser.origin === window.location.origin) {
                window.location.href = h;
                return;
            }
        }
        window.location.href = '/drive/';
    };

    var hashing;
    Exports.loginOrRegisterUI = function (uname, passwd, isRegister, shouldImport, testing, test) {
        if (hashing) { return void console.log("hashing is already in progress"); }
        hashing = true;

        var proceed = function (result) {
            hashing = false;
            // NOTE: test is also use as a cb for the install page
            if (test && typeof test === "function" && test(result)) { return; }
            LocalStore.clearLoginToken();
            Realtime.whenRealtimeSyncs(result.realtime, function () {
                Exports.redirect();
            });
        };

        // setTimeout 100ms to remove the keyboard on mobile devices before the loading screen
        // pops up
        window.setTimeout(function () {
            UI.addLoadingScreen({
                loadingText: Messages.login_hashing,
                hideTips: true,
            });

            // We need a setTimeout(cb, 0) otherwise the loading screen is only displayed
            // after hashing the password
            window.setTimeout(function () {
                Exports.loginOrRegister(uname, passwd, isRegister, shouldImport, function (err, result) {
                    var proxy;
                    if (result) { proxy = result.proxy; }

                    if (err) {
                        switch (err) {
                            case 'NO_SUCH_USER':
                                UI.removeLoadingScreen(function () {
                                    UI.alert(Messages.login_noSuchUser, function () {
                                        hashing = false;
                                        $('#password').focus();
                                    });
                                });
                                break;
                            case 'INVAL_USER':
                                UI.removeLoadingScreen(function () {
                                    UI.alert(Messages.login_invalUser, function () {
                                        hashing = false;
                                        $('#password').focus();
                                    });
                                });
                                break;
                            case 'INVAL_PASS':
                                UI.removeLoadingScreen(function () {
                                    UI.alert(Messages.login_invalPass, function () {
                                        hashing = false;
                                        $('#password').focus();
                                    });
                                });
                                break;
                            case 'PASS_TOO_SHORT':
                                UI.removeLoadingScreen(function () {
                                    var warning = Messages._getKey('register_passwordTooShort', [
                                        Cred.MINIMUM_PASSWORD_LENGTH
                                    ]);
                                    UI.alert(warning, function () {
                                        hashing = false;
                                        $('#password').focus();
                                    });
                                });
                                break;
                            case 'ALREADY_REGISTERED':
                                UI.removeLoadingScreen(function () {
                                    UI.confirm(Messages.register_alreadyRegistered, function (yes) {
                                        if (!yes) {
                                            hashing = false;
                                            return;
                                        }
                                        proxy.login_name = uname;

                                        if (!proxy[Constants.displayNameKey]) {
                                            proxy[Constants.displayNameKey] = uname;
                                        }

                                        if (result.blockHash) {
                                            LocalStore.setBlockHash(result.blockHash);
                                        }

                                        LocalStore.login(result.userHash, result.userName, function () {
                                            setTimeout(function () { proceed(result); });
                                        });
                                    });
                                });
                                break;
                            case 'E_RESTRICTED':
                                UI.errorLoadingScreen(Messages.register_registrationIsClosed);
                                break;
                            default: // UNHANDLED ERROR
                                hashing = false;
                                UI.errorLoadingScreen(Messages.login_unhandledError);
                        }
                        return;
                    }

                    //if (testing) { return void proceed(result); }

                    if (!(proxy.curvePrivate && proxy.curvePublic &&
                          proxy.edPrivate && proxy.edPublic)) {

                        console.log("recovering derived public/private keypairs");
                        // **** reset keys ****
                        proxy.curvePrivate = result.curvePrivate;
                        proxy.curvePublic  = result.curvePublic;
                        proxy.edPrivate    = result.edPrivate;
                        proxy.edPublic     = result.edPublic;
                    }

                    setTimeout(function () {
                        Realtime.whenRealtimeSyncs(result.realtime, function () {
                            proceed(result);
                        });
                    });
                });
            }, 500);
        }, 200);
    };

    return Exports;
});
