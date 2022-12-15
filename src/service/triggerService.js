const axios = require("axios");
const fs = require("fs/promises");
const bucket = require("../external/bucket");
const ain = require("../external/ain");
const { createTask, getCompletedTask } = require("../external/text-to-art");
const { compositeImage, generateRandomString } = require("../util/util");
const { CAT_TYPES } = require("../const");

const writeWeatherImageUrlToAin = async (ref, weather) => {
    // ref: app/bready_cat/$date/weather
    const parsedRef = ain.parseRef(ref);
    const date = parsedRef[2];

    // text-to-image
    // TODO: env로 postfix, prefix 빼기
    const prompt = `${weather} weather landscape with half hill and half sky , solid color, simple cartoon style`;
    const imageUrl = await textToImage(prompt);

    const { data: background } = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // So, use random strings to prevent overwriting
    const backgroundFilePath = `${date}/weather/background_${generateRandomString(5)}.png`;
    await bucket.upload(backgroundFilePath, background);
    console.log(`Storage: upload ${imageUrl} to ${backgroundFilePath}`);

    const backgroundImgPath = `./resource/tmp/background.png`;
    await bucket.download(backgroundFilePath, backgroundImgPath);
    const compositeImgPath = "./resource/tmp/composite.png";
    for (const catType of CAT_TYPES) {
        const catImgPath = `./resource/cat/${catType}.png`;
        // NOTE(haechan@comcom.ai): Which is better, storage or local?
        // await bucket.download(`v1/cat/${catType}.png`, catImgPath);
        await compositeImage(backgroundImgPath, catImgPath, compositeImgPath);
        const compositeImg = await fs.readFile(compositeImgPath);
        await bucket.uploadPublic(`v1/ainft/${catType}.png`, compositeImg);

        console.log(`update v1/ainft/${catType}.png`);
    }
    console.log("update all AINFTs");

    const backgroundRef = ain.formatRef([
        ...parsedRef.slice(0, parsedRef.length - 1),
        "background",
    ]);

    // write image url to ain
    const backgroundImgUrl = bucket.objectUrl(backgroundFilePath);
    const ainRes = await ain.write(backgroundRef, backgroundImgUrl);
    console.log(`Ain: set url(${backgroundImgUrl}) at ${backgroundRef}`);
    console.log(JSON.stringify(ainRes));
};

async function textToImage(prompt) {
    const { task_id: taskId } = await createTask(prompt);
    console.log("taskId :>> ", taskId);

    const { result } = await getCompletedTask(taskId);
    console.log("result :>> ", JSON.stringify(result));

    // upload image to storage
    return result[1].url;
}

module.exports = {
    writeWeatherImageUrlToAin,
};
