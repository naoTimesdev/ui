import type { GraphQLFormattedError } from "graphql";

type Nullable<T> = T | null;

export type UlidGQL = string;
export type APIKey = `nsh_${string}`;

export type UserKindGQL = "USER" | "ADMIN" | "OWNER";

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
