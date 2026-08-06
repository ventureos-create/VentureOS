import * as admin from "firebase-admin";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

/**
 * Firestore does not cascade-delete subcollections. When a post is deleted
 * from the client (see src/services/posts.service.ts -> deletePost), its
 * `comments` and `likes` subcollections would otherwise be orphaned. This
 * trigger cleans them up server-side.
 */
export const onPostDeleted = onDocumentDeleted("posts/{postId}", async (event) => {
  const postId = event.params.postId;
  const batchDelete = async (subcollection: string) => {
    const snap = await db.collection("posts").doc(postId).collection(subcollection).get();
    if (snap.empty) return;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    logger.info(`Deleted ${snap.size} docs from posts/${postId}/${subcollection}`);
  };
  await Promise.all([batchDelete("comments"), batchDelete("likes")]);
});

/**
 * Same cleanup pattern for a deleted user: remove their profile doc so
 * co-founder matching doesn't surface a profile for a user that no longer
 * exists. (Their posts/comments are intentionally left in place, matching
 * how most social platforms handle account deletion — extend this if you
 * want a full data purge instead.)
 */
export const onUserDeleted = onDocumentDeleted("users/{userId}", async (event) => {
  const userId = event.params.userId;
  await db.collection("profiles").doc(userId).delete().catch(() => undefined);
  logger.info(`Cleaned up profile for deleted user ${userId}`);
});
