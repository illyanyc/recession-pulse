const BASE_URL = "https://api.typefully.com";

function getApiKey(): string {
  const key = process.env.TYPEFULLY_API_KEY;
  if (!key) throw new Error("TYPEFULLY_API_KEY not configured");
  return key;
}

function getSocialSetId(): number {
  const id = process.env.TYPEFULLY_SOCIAL_SET_ID;
  if (!id) throw new Error("TYPEFULLY_SOCIAL_SET_ID not configured");
  return parseInt(id, 10);
}

interface TypefullyDraftResponse {
  id: number;
  social_set_id: number;
  status: "draft" | "scheduled" | "published" | "publishing" | "error";
  preview: string;
  scheduled_date: string | null;
  published_at: string | null;
  x_published_url: string | null;
  created_at: string;
}

interface TypefullyError {
  error: {
    code: string;
    message: string;
  };
}

type PublishAt = "now" | "next-free-slot" | string;

async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as TypefullyError | null;
    const message = err?.error?.message || `Typefully API ${res.status}`;
    throw new Error(`Typefully API error (${res.status}): ${message}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Create a single tweet and optionally publish/schedule it.
 * @param text Tweet text (max 280 chars)
 * @param publishAt "now" | "next-free-slot" | ISO 8601 datetime | undefined (saves as draft)
 * @param title Internal draft title for organization
 */
export async function createTweet(
  text: string,
  publishAt?: PublishAt,
  title?: string
): Promise<TypefullyDraftResponse> {
  const socialSetId = getSocialSetId();

  const body: Record<string, unknown> = {
    platforms: {
      x: {
        enabled: true,
        posts: [{ text }],
        settings: {},
      },
    },
  };

  if (publishAt) body.publish_at = publishAt;
  if (title) body.draft_title = title;

  return apiRequest<TypefullyDraftResponse>(
    `/v2/social-sets/${socialSetId}/drafts`,
    "POST",
    body
  );
}

/**
 * Create a thread (multiple tweets) and optionally publish/schedule it.
 * @param tweets Array of tweet texts
 * @param publishAt "now" | "next-free-slot" | ISO 8601 datetime | undefined
 * @param title Internal draft title
 */
export async function createThread(
  tweets: string[],
  publishAt?: PublishAt,
  title?: string
): Promise<TypefullyDraftResponse> {
  const socialSetId = getSocialSetId();

  const posts = tweets.map((text) => ({ text }));

  const body: Record<string, unknown> = {
    platforms: {
      x: {
        enabled: true,
        posts,
        settings: {},
      },
    },
  };

  if (publishAt) body.publish_at = publishAt;
  if (title) body.draft_title = title;

  return apiRequest<TypefullyDraftResponse>(
    `/v2/social-sets/${socialSetId}/drafts`,
    "POST",
    body
  );
}

/**
 * Post a single tweet immediately.
 */
export async function postTweetNow(
  text: string,
  title?: string
): Promise<TypefullyDraftResponse> {
  return createTweet(text, "now", title);
}

/**
 * Schedule a tweet to the next free slot in the Typefully queue.
 */
export async function scheduleTweetNextSlot(
  text: string,
  title?: string
): Promise<TypefullyDraftResponse> {
  return createTweet(text, "next-free-slot", title);
}

/**
 * Post a thread immediately.
 */
export async function postThreadNow(
  tweets: string[],
  title?: string
): Promise<TypefullyDraftResponse> {
  return createThread(tweets, "now", title);
}

/**
 * Schedule a thread to the next free slot.
 */
export async function scheduleThreadNextSlot(
  tweets: string[],
  title?: string
): Promise<TypefullyDraftResponse> {
  return createThread(tweets, "next-free-slot", title);
}
