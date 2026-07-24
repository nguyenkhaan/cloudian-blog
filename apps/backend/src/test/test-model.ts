import { mistralModel } from "../agent/model";
import { HumanMessage } from "langchain";

async function main() {
    try {
        const response = await mistralModel.invoke([
            new HumanMessage("Bài viết nào liên quan chủ đề developer và IT")
        ]);
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error(e);
    }
}
main();
