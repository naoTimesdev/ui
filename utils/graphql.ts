import type { GraphQLFormattedError } from "graphql";

type Nullable<T> = T | null;

export type UlidGQL = string;
export type DateTimeGQL = string;
export type APIKey = `nsh_${string}`;

export type UserKindGQL = "USER" | "ADMIN" | "OWNER";
export type ProjectKindGQL =
  | "SERIES"
  | "MOVIES"
  | "OVA"
  | "BOOKS"
  | "MANGA"
  | "LIGHT_NOVEL"
  | "GAMES"
  | "VISUAL_NOVEL"
  | "UNKNOWN";

export interface ImageMetadataGQL {
  url?: string;
}

export interface UserGQL {
  id: UlidGQL;
  username: string;
  apiKey: APIKey;
  avatar: Nullable<ImageMetadataGQL>;
  kind: UserKindGQL;
}

export interface UserSessionGQL {
  token: string;
  user: UserGQL;
}

export interface ProjectLatestGQL {
  id: UlidGQL;
  title: string;
  kind: ProjectKindGQL;
  poster: {
    image: ImageMetadataGQL;
  };
  progress: {
    airDate: Nullable<DateTimeGQL>;
    delayReason: Nullable<string>;
    finished: boolean;
    number: number;
    statuses: {
      role: {
        key: string;
        name: string;
      };
      finished: boolean;
    }[];
  }[];
  count: number;
  startTime: Nullable<DateTimeGQL>;
  updated: DateTimeGQL;
}

export const mutateAuthDiscord = gql`
  mutation MutateAuthDiscord($code: String!, $state: String!) {
    auth(token: $code, state: $state) {
      token
      user {
        id
        username
        apiKey
        avatar {
          url
        }
        kind
      }
    }
  }
`;

export const queryCurrentUser = gql`
  query CurrentAuthUser {
    current {
      token
      user {
        id
        username
        apiKey
        avatar {
          url
        }
        kind
      }
    }
  }
`;

const queryLatestProjectServers = `query allProjects($serverId: UlidGQL!) {
  projects(serverIds: [$serverId], unpaged: true) {
    node {
      id
      title
      kind
      poster {
        image {
          url
        }
      }
      progress(limitLatest: 4, returnLast: false) {
        airDate
        delayReason
        finished
        number
        statuses {
          role {
            key
            name
          }
          finished
        }
      }
      count
      startTime
      updated
    }
  }
}
`;

function buildErrorMessageStack(errors: readonly GraphQLFormattedError[]) {
  return errors
    .map((error, idx) => {
      if (errors.length > 1) {
        return `${idx + 1}. ${error.message}`;
      }

      return error.message;
    })
    .join("\n");
}

/**
 * A simple error class that can be thrown to provide a list of GraphQL errors.
 */
export class GraphQLSimpleError extends Error {
  context: readonly GraphQLFormattedError[];

  constructor(context: readonly GraphQLFormattedError[] | string) {
    if (Array.isArray(context)) {
      const message = buildErrorMessageStack(context);

      super(message);

      this.context = context;
    } else if (typeof context === "string") {
      super(context);
      this.context = [];
    } else {
      super("An unknown error occurred");
      this.context = [];
    }
  }
}

export async function graphqlGetLatestProjectsInformation(serverId: UlidGQL) {
  const runtimeConfig = useRuntimeConfig();
  const { makeUrl } = useServerUrl();

  const variables = {
    serverId,
  };

  const queryData = JSON.stringify({
    query: queryLatestProjectServers,
    variables,
    operationName: "allProjects",
  });

  const results = await fetch(makeUrl("/graphql"), {
    method: "POST",
    headers: {
      Authorization: `Token ${runtimeConfig.apiPrivateKey}`,
      "Content-Type": "application/json",
    },
    body: queryData,
  });

  if (results.ok) {
    const json = await results.json();

    if (json.errors) {
      throw new GraphQLSimpleError(json.errors);
    }

    return json.data.projects.node as ProjectLatestGQL[];
  }

  throw new Error("An unknown error occurred");
}
