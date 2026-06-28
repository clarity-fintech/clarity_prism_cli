import { QueryQueue } from "@clrt/prism-core";
import { PrismClient } from "@clrt/prism-sdk";

export type QueryResult = Awaited<ReturnType<PrismClient["query"]>>;

const client = new PrismClient();

export const prismQueryQueue = new QueryQueue<QueryResult>(async (text) => {
  const intent = text.includes(" ") ? text.split(" ")[0]! : text;
  return client.query({ intent, query: text });
});
