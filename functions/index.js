const admin = require("firebase-admin");
admin.initializeApp();
const functions = require("firebase-functions");
const axios = require("axios");
const cheerio = require("cheerio");

//exports.imvu = functions.https.onRequest(async (req, res) => {
exports.imvu = functions.pubsub.schedule("0 */1 * * *").timeZone("Asia/Bangkok").onRun(async context => {
    const response = await axios.get("https://www.imvu.com/catalog/web_mypage.php?user=152597046");
    const html = response.data;
    const $ = cheerio.load(html);

    const selector = $("#frame1 p");
    if (selector.length !== 9) {
        return null;
    }

    let current = ""
    selector.each((index, element) => {
        if (index === 0) {
            current = $(element).text()
        } else {
            current = current.concat("|", $(element).text())
        }
    });

    let last = await admin.firestore().doc('line/imvu').get()
    if (!last.exists || last.data().report !== current) {
        await admin.firestore().doc('line/imvu').set({ texts: current });
        broadcast(current);
    }

    //return res.send("OK!")
    //return res.end()
});

const broadcast = (current) => {
    const currents = current.split("|");
    return axios({
      method: "post",
      url: "https://api.line.me/v2/bot/message/broadcast",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 05DFrz+i27dYp3ixnKoo8vm3IEvJpvEB878mOEMPud2xnSXV8h5/aNKWI4qcfiVMe7up5WMIzzywb6R/WzxZlg2ukoK01CYzKa9wwiarJ4bFOgWc5fsuJFx8JNuIHUITBqr7Zzxs6B3f/Cv9kwi+SAdB04t89/1O/w1cDnyilFU="
      },
      data: JSON.stringify({
        messages: [{
            "type": "flex",
            "altText": "Flex Message",
            "contents": {
                "type": "bubble",
                "direction": "ltr",
                "hero": {
                    "type": "image",
                    "url": "https://www.imvu.com/catalog/web_av_pic.php?u=152597046",
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover",
                    "action": {
                        "type": "uri",
                        "label": "Line",
                        "uri": "https://linecorp.com/"
                    }
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "backgroundColor": "#000000FF",
                  "contents": [
                    {
                      "type": "text",
                      "text": "Spindritfz",
                      "weight": "bold",
                      "size": "xl",
                      "color": "#B77FE5FF",
                      "contents": []
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "margin": "lg",
                      "contents": [
                        {
                          "type": "text",
                          "text": currents[2],
                          "color": "#B77FE5FF",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": currents[3],
                          "color": "#FFFFFFFF",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": currents[4],
                          "color": "#FFFFFFFF",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": currents[5],
                          "color": "#FFFFFFFF",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": currents[6],
                          "color": "#FFFFFFFF",
                          "align": "center",
                          "contents": []
                        },
                        {
                          "type": "text",
                          "text": currents[7],
                          "color": "#B77FE5FF",
                          "align": "center",
                          "contents": []
                        }
                      ]
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "flex": 0,
                  "spacing": "none",
                  "backgroundColor": "#000000FF",
                  "contents": [
                    {
                      "type": "spacer",
                      "size": "xs"
                    }
                  ]
                }
            }
        }]
      })
    })
}