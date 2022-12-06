const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
};

const generateRandomString = (num) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

const parsePath = (path) => {
    if (!path) {
        return [];
    }

    return path.split("/").filter((node) => {
        return !!node;
    });
};

const formatPath = (parsedPath) => {
    if (!Array.isArray(parsedPath) || parsedPath.length === 0) {
        return "/";
    }
    let formatted = "";
    for (const label of parsedPath) {
        formatted += "/" + String(label);
    }
    return (formatted.startsWith("/") ? "" : "/") + formatted;
};

module.exports = {
    getRandomInt,
    generateRandomString,
    parsePath,
    formatPath,
};
