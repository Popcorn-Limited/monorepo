import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const OFAC_LIST_URL = "https://www.treasury.gov/ofac/downloads/sdnlist.txt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  let response;
  try {
    const list = ((await axios.get(OFAC_LIST_URL)).data as string).toLowerCase();
    response =
      typeof address === "string"
        ? !list.includes(address.toLowerCase())
        : !address.some((entry) => list.includes(entry.toLowerCase()));
  } catch (err) {
    return res.status(400).send({ error: err });
  }

  res.setHeader("Cache-Control", "s-maxage=43200");
  return res.json({ success: true, permitted: response });
}
