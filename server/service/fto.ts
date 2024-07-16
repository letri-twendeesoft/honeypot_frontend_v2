import { pg } from "@/lib/db";

export const ftoService = {
  createFtoProject: async (data: {
    pair: string;
    provider: string;
    chain_id: number;
  }) => {
    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      provider: data.provider.toLowerCase(),
      chain_id: data.chain_id,
    })}`;
  },
  getProjectInfo: async (data: { pair: string; chain_id: number }) => {
    const res = await pg<
      {
        twitter: string;
        telegram: string;
        website: string;
        description: string;
        name: string;
        provider: string;
      }[]
    >`SELECT twitter, telegram, website,description,name, provider  FROM fto_project WHERE pair = ${data.pair.toLowerCase()} and chain_id = ${
      data.chain_id
    }`;
    return res?.[0];
  },
  getFtoProjectsByAccount: async ({
    provider,
    chain_id,
  }: {
    provider: string;
    chain_id: number;
  }) => {
    return pg`SELECT * FROM fto_project WHERE provider = ${provider.toLowerCase()} and chain_id = ${chain_id} order by id desc`;
  },
  createOrUpdateProjectInfo: async (data: {
    twitter: string;
    telegram: string;
    website: string;
    description: string;
    projectName: string;
    pair: string;
    chain_id: number;
  }) => {
    await pg`INSERT INTO fto_project ${pg({
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
      description: data.description,
      name: data.projectName,
      pair: data.pair.toLowerCase(),
      chain_id: data.chain_id,
    })} ON CONFLICT (pair, chain_id) DO UPDATE SET twitter = ${
      data.twitter
    }, telegram = ${data.telegram}, website = ${data.website}, description = ${
      data.description
    }, name = ${data.projectName}`;
  },
  createOrUpdateProjectVotes: async (data: {
    project_pair: string;
    wallet_address: string;
    vote: string;
  }) => {
    await pg`INSERT INTO fto_project_vote ${pg({
      project_pair: data.project_pair.toLowerCase(),
      wallet_address: data.wallet_address.toLowerCase(),
      vote: data.vote,
    })} ON CONFLICT (wallet_address, project_pair) DO UPDATE SET vote = ${
      data.vote
    }`;
  },
  getProjectVotes: async (data: {
    pair: string;
  }): Promise<{
    rocket_count: number;
    fire_count: number;
    poo_count: number;
    flag_count: number;
  }> => {
    const res = await pg`SELECT 
    COUNT(CASE WHEN vote = 'rocket' THEN 1 END) AS rocket_count,
    COUNT(CASE WHEN vote = 'fire' THEN 1 END) AS fire_count,
    COUNT(CASE WHEN vote = 'poo' THEN 1 END) AS poo_count,
    COUNT(CASE WHEN vote = 'flag' THEN 1 END) AS flag_count
    FROM public.fto_project_vote
    WHERE project_pair = ${data.pair.toLowerCase()};
  `;
    Object.entries(res[0]).forEach(([key, value]) => {
      res[0][key] = Number(value);
    });

    const outdata = res[0];
    return outdata as any;
  },
};
