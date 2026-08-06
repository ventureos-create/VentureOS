import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { PostDoc, CommentDoc } from "@/types";
import { createNotification } from "@/services/notifications.service";

const PAGE_SIZE = 10;

function toPost(d: QueryDocumentSnapshot<DocumentData>): PostDoc {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as PostDoc;
}

export async function fetchPostsPage(
  cursor?: QueryDocumentSnapshot<DocumentData>,
  sortBy: "recent" | "trending" = "recent"
) {
  const field = sortBy === "trending" ? "likeCount" : "createdAt";
  const base = query(collection(db, "posts"), orderBy(field, "desc"), limit(PAGE_SIZE));
  const q = cursor ? query(base, startAfter(cursor)) : base;
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map(toPost),
    lastDoc: snap.docs[snap.docs.length - 1],
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

export async function createPost(params: {
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  imageFile?: File | null;
}) {
  let imageURL: string | null = null;
  if (params.imageFile) {
    const path = `posts/${params.authorId}/${Date.now()}-${params.imageFile.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, params.imageFile);
    imageURL = await getDownloadURL(storageRef);
  }
  const docRef = await addDoc(collection(db, "posts"), {
    authorId: params.authorId,
    authorName: params.authorName,
    authorPhotoURL: params.authorPhotoURL,
    content: params.content,
    imageURL,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    edited: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePost(postId: string, content: string) {
  await updateDoc(doc(db, "posts", postId), {
    content,
    edited: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}

export async function toggleLike(postId: string, uid: string): Promise<boolean> {
  const likeRef = doc(db, "posts", postId, "likes", uid);
  const postRef = doc(db, "posts", postId);
  const likeSnap = await getDoc(likeRef);
  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likeCount: increment(-1) });
    return false;
  } else {
    await setDoc(likeRef, { likedAt: serverTimestamp() });
    await updateDoc(postRef, { likeCount: increment(1) });
    const post = await getDoc(postRef);
    const authorId = post.data()?.authorId;
    if (authorId && authorId !== uid) {
      await createNotification({
        userId: authorId,
        type: "like",
        message: "Someone liked your post",
        link: `/dashboard/community`,
      });
    }
    return true;
  }
}

export async function hasLiked(postId: string, uid: string) {
  const snap = await getDoc(doc(db, "posts", postId, "likes", uid));
  return snap.exists();
}

export async function sharePost(postId: string) {
  await updateDoc(doc(db, "posts", postId), { shareCount: increment(1) });
}

export async function addComment(params: {
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
}) {
  await addDoc(collection(db, "posts", params.postId, "comments"), {
    postId: params.postId,
    authorId: params.authorId,
    authorName: params.authorName,
    authorPhotoURL: params.authorPhotoURL,
    content: params.content,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "posts", params.postId), { commentCount: increment(1) });

  const post = await getDoc(doc(db, "posts", params.postId));
  const authorId = post.data()?.authorId;
  if (authorId && authorId !== params.authorId) {
    await createNotification({
      userId: authorId,
      type: "comment",
      message: `${params.authorName} commented on your post`,
      link: `/dashboard/community`,
    });
  }
}

export async function fetchComments(postId: string): Promise<CommentDoc[]> {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    } as CommentDoc;
  });
}

export async function toggleBookmark(postId: string, uid: string): Promise<boolean> {
  const id = `${uid}_${postId}`;
  const ref = doc(db, "bookmarks", id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  } else {
    await setDoc(ref, { userId: uid, postId, createdAt: serverTimestamp() });
    return true;
  }
}

export async function isBookmarked(postId: string, uid: string) {
  const snap = await getDoc(doc(db, "bookmarks", `${uid}_${postId}`));
  return snap.exists();
}
