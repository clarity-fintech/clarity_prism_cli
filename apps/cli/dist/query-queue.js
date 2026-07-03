import { QueryQueue } from "@clrt/prism-core";
import { PrismClient } from "@clrt/prism-sdk";
const client = new PrismClient();
export const prismQueryQueue = new QueryQueue(async (text) => {
    const intent = text.includes(" ") ? text.split(" ")[0] : text;
    return client.query({ intent, query: text });
});
//# sourceMappingURL=query-queue.js.map