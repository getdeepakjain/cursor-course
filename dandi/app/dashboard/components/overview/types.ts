/** Row shape returned by `GET /api/keys` (secret never full in list). */
export type KeyRow = {
  id: string;
  name: string;
  maskedSecret: string;
  createdAt: string;
  usage: number;
};

/** `POST /api/keys` returns the plaintext secret once for the “copy now” modal. */
export type CreateResponse = {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
  usage?: number;
};

export type ToastVariant = "success" | "danger";
