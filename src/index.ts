import Kasumi, { BaseCommand, BaseSession, Card, CommandFunction } from "kasumi.js";

class PingCommand extends BaseCommand<Kasumi<any>> {
    description = "测试 Kasumi 与 KOOK 服务器之间的延迟。"

    constructor(name: string = "ping") {
        super();
        this.name = name;
    }

    func: CommandFunction<BaseSession, any> = async (session) => {
        const remoteOrigin = session.event.timestamp;
        const localOrigin = Date.now();
        session.send([new Card()
            .addModule({
                "type": "section",
                "text": {
                    "type": "paragraph",
                    "cols": 2,
                    "fields": [
                        {
                            "type": "kmarkdown",
                            "content": `**Local Origin**\n(font)${localOrigin}(font)[success]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**Remote Origin**\n(font)${remoteOrigin}(font)[primary]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**Local Response**\n(font)N/A(font)[secondary]`
                        },
                        {
                            "type": "kmarkdown",
                            "content": `**Remote Response**\n(font)N/A(font)[secondary]`
                        }
                    ]
                }
            })]).then(({ err, data: res }) => {
                const localResponse = Date.now()
                if (res) {
                    const remoteReponse = res.msg_timestamp;
                    const messageId = res.msg_id;
                    if (messageId && remoteReponse) {
                        const localLatency = localResponse - localOrigin;
                        const remoteLatency = remoteReponse - remoteOrigin;
                        const originDiff = Math.abs(localOrigin - remoteOrigin);
                        const responseDiff = Math.abs(localResponse - remoteReponse);
                        const colorizeLatencyString = (time: number): string => {
                            return `(font)${time}ms(font)[${time > 1000 ? "danger" : time > 500 ? "warning" : "primary"}]`;
                        }
                        session.update(messageId, [new Card()
                            .addModule({
                                "type": "section",
                                "text": {
                                    "type": "paragraph",
                                    "cols": 2,
                                    "fields": [
                                        {
                                            "type": "kmarkdown",
                                            "content": `**LocalOrigin**\n(font)${localOrigin}(font)[success]`
                                        },
                                        {
                                            "type": "kmarkdown",
                                            "content": `**RemoteOrigin**\n(font)${remoteOrigin}(font)[primary]`
                                        },
                                        {
                                            "type": "kmarkdown",
                                            "content": `**LocalResponse**\n(font)${localResponse}(font)[pink]`
                                        },
                                        {
                                            "type": "kmarkdown",
                                            "content": `**RemoteResponse**\n(font)${remoteReponse}(font)[purple]`
                                        }
                                    ]
                                }
                            })
                            .addDivider()
                            .addText(`Local Latency: ${colorizeLatencyString(localLatency)}`)
                            .addContext("The time it takes to complete a /message/create API call.")
                            .addText(`Remote Latency: ${colorizeLatencyString(remoteLatency)}`)
                            .addContext("The time it takes to finish a barebone command like this.")
                            .addText(`Origin Diff: ${colorizeLatencyString(originDiff)}`)
                            .addContext("The time it takes for KOOK to deliver the message event to client, but take account for time inaccuracy on both servers.")
                            .addText(`Response Diff: ${colorizeLatencyString(responseDiff)}`)
                            .addContext("**Unreliable** The time it takes for KOOK to process a `/message/create` API call.")
                        ])
                    }
                }
            })
    }
}

export default PingCommand;
