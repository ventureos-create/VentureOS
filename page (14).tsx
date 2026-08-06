"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Bookmark as BookmarkIcon, Heart, MessageCircle } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toggleBookmark } from "@/services/posts.service";
import { initials, timeAgo } from "@/lib/utils";
import { PostDoc } from "@/types";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const bookmarksSnap = await getDocs(
      query(collection(db, "bookmarks"), where("userId", "==", user.uid))
    );
    const postIds = bookmarksSnap.docs.map((d) => d.data().postId as string);
    const postDocs = await Promise.all(
      postIds.map((id) => getDoc(doc(db, "posts", id)))
    );
    setPosts(
      postDocs
        .filter((d) => d.exists())
        .map((d) => {
          const data = d.data()!;
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
          } as PostDoc;
        })
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRemove = async (postId: string) => {
    if (!user) return;
    await toggleBookmark(postId, user.uid);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Bookmarks</h1>
        <p className="mt-1 text-sm text-navy-400">Posts you've saved to read again later.</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BookmarkIcon className="h-8 w-8 text-navy-200" />
            <p className="text-sm text-navy-400">No bookmarks yet — save posts from the Community feed to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-royal-50 text-sm font-semibold text-royal-700">
                    {post.authorPhotoURL ? (
                      <Image src={post.authorPhotoURL} alt="" width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      initials(post.authorName)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{post.authorName}</p>
                    <p className="text-xs text-navy-300">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm text-navy-500">{post.content}</p>
                {post.imageURL && (
                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl">
                    <Image src={post.imageURL} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="mt-4 flex items-center gap-6 border-t border-navy-50 pt-3 text-xs text-navy-400">
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {post.likeCount}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {post.commentCount}</span>
                  <button onClick={() => handleRemove(post.id)} className="ml-auto flex items-center gap-1.5 font-medium text-royal">
                    <BookmarkIcon className="h-4 w-4 fill-royal" /> Remove
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
