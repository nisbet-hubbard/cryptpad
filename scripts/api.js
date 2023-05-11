/* globals global */
//  "/2/drive/edit/4SH+XD5NqierGNeW5S3vHqbx/" 

/* XXX
 * Use nacl-fast in chainpad-crypto
 */

/* TODO
 * LOGIN
   * [x] loadUserObject
     * [x] Copy
       * [x] ListMap
       * [x] ChainPad
       * [x] NetConfig
   * [ ] Feedback.send
     * [ ] if required, should be rewritten for node
     * [ ] provide a stub in the meantime
   * [x] setMergeAnonDrive
     * [x] not needed in Node
     * [x] Copy the function from old login code, check where it's used and how to transmit, maybe in the callback?
   * [x] Realtime.whenRealtimeSyncs
     * easy to reuse
   * [x] loginOptionsFromBlock
     * copy-paste, requires Hash
   * [ ] pinpad
     * should be easy
   * [ ] LocalStore
     * [x] Not needed in Node
     * [ ] provide a stub to the factory

* Maybe we should split this huge function into smaller parts
  * Deprecate old login in the node API?
  


 */

const WebSocketClient = require('faye-websocket').Client;
const n = require('tweetnacl/nacl-fast');


global.window = {
    addEventListener: function () {},
    WebSocket: WebSocketClient,
    Proxy: Proxy,
    localStorage: {
        setItem: function (k, v) { this[k] = v; },
        getItem: function (k) { return this[k]; },
        removeItem: function (k) { delete this[k]; }
    },
    nacl: n
};
global.localStorage = window.localStorage;

const Login = require('../www/common/login');
const login = Login({
    websocketURL: 'ws://localhost:3000/cryptpad_websocket',
    fileHost: 'http://localhost:3000'
});


login.loginOrRegister('blu', 'register2', false, false, function (err, data) {
    //console.error(err, data.proxy);
    console.log(data.proxy['cryptpad.username']);
    //data.proxy['cryptpad.username'] = "blu-reg";
});


