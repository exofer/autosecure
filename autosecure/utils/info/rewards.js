const HttpClient = require("../process/HttpClient");

/**
 * 
 * @param {HttpClient} axios 
 */
module.exports = async (axios) => {
    try {
        const res = await axios.get("https://rewards.bing.com/api/getuserinfo?type=1", {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });
        const payload = res?.data;
        if (typeof payload?.dashboard?.userStatus?.availablePoints === "number") {
            return payload.dashboard.userStatus.availablePoints;
        }
        return payload ?? 0;
    } catch {
        return 0;
    }
};