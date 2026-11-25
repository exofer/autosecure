async function getpoints(axios) {
    try {
        const response = await axios.get("https://rewards.bing.com/api/getuserinfo?type=1", {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });
        const data = response?.data;
        if (typeof data?.balance === "number") return data.balance;
        if (typeof data?.dashboard?.userStatus?.availablePoints === "number") {
            return data.dashboard.userStatus.availablePoints;
        }
        return 0;
    } catch {
        return 0;
    }
}

module.exports = getpoints;
