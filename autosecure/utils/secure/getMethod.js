const axios = require("axios")
module.exports = async (ssid) => {
    try {
        const licenses = await axios({
            method: "GET",
            url: "https://api.minecraftservices.com/entitlements/license?requestId=c24114ab-1814-4d5c-9b1f-e8825edaec1f",
            headers: {
                Authorization: `Bearer ${ssid}`
            },
            validateStatus: (status) => status >= 200 && status < 500,
        })
        console.log(licenses)
        if (licenses?.data?.items) {
            for (let item of licenses.data.items) {
                if (item.name == "product_minecraft" || item.name == "game_minecraft") {
                    if (item.source == "GAMEPASS") {
                        return "Gamepass"
                    } else if (item.source == "PURCHASE" || item.source == "MC_PURCHASE") {
                        return "Purchased"
                    } else {
                        return "Couldn't get!"
                    }
                }
            }
        }
    } catch (e) {
        return false
    }
}
