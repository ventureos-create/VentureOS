"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Heart, MessageCircle, Share2, Bookmark, Trash2, Pencil, Image as ImageIcon,
  Send, X, TrendingUp, Clock,
} from "lucide-react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn, timeAgo, initials } from "@/lib/utils";
import { PostDoc, CommentDoc } from "@/types";
import {
  fetchPostsPage, createPost, updatePost, deletePost, toggleLike, hasLiked,
  sharePost, addComment, fetchComments, toggleBookmark, isBookmarked,
} from "@/services/posts.service";

export default function CommunityPage() {
  const { user, userDoc } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadFirstPage = async (sort: "recent" | "trending") => {
    setLoading(true);
    const { posts: page, lastDoc, hasMore: more } = await fetchPostsPage(undefined, sort);
    setPosts(page);
    setCursor(lastDoc);
    setHasMore(more);
    setLoading(false);
  };

  useEffect(() => {
    loadFirstPage(sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const { posts: page, lastDoc, hasMore: more } = await fetchPostsPage(cursor, sortBy);
    setPosts((prev) => [...prev, ...page]);
    setCursor(lastDoc);
    setHasMore(more);
    setLoadingMore(false);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, hasMore, loadingMore]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!user || !userDoc || !content.trim()) return;
    setPosting(true);
    try {
      await createPost({
        authorId: user.uid,
        authorName: userDoc.displayName,
        authorPhotoURL: userDoc.photoURL,
        content: content.trim(),
        imageFile,
      });
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      await loadFirstPage(sortBy);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Avatar name={userDoc?.displayName ?? "Founder"} photoURL={userDoc?.photoURL ?? null} />
            <div className="flex-1">
              <Textarea
                placeholder="Share an update, ask a question, or celebrate a win..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[70px] border-navy-100"
              />
              {imagePreview && (
                <div className="relative mt-3 inline-block">
                  <Image src={imagePreview} alt="" width={200} height={140} className="rounded-lg object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1.5 text-sm text-navy-400 hover:text-royal">
                  <ImageIcon className="h-[18px] w-[18px]" />
                  Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </label>
                <Button size="sm" onClick={handlePost} loading={posting} disabled={!content.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("recent")}
          className={cn("flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium", sortBy === "recent" ? "bg-royal text-white" : "bg-white text-navy-400 border border-navy-100")}
        >
          <Clock className="h-3.5 w-3.5" /> Recent
        </button>
        <button
          onClick={() => setSortBy("trending")}
          className={cn("flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium", sortBy === "trending" ? "bg-royal text-white" : "bg-white text-navy-400 border border-navy-100")}
        >
          <TrendingUp className="h-3.5 w-3.5" /> Trending
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-sm text-navy-400">No posts yet. Be the first to share something.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {loadingMore && <Spinner />}
        {!hasMore && posts.length > 0 && <p className="text-xs text-navy-300">You&apos;ve reached the end.</p>}
      </div>
    </div>
  );
}

function Avatar({ name, photoURL, size = 40 }: { name: string; photoURL: string | null; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-royal-50 font-semibold text-royal-700"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {photoURL ? (
        <Image src={photoURL} alt={name} width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function PostCard({ post, onDeleted }: { post: PostDoc; onDeleted: () => void }) {
  const { user, userDoc } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [content, setContent] = useState(post.content);
  const [edited, setEdited] = useState(post.edited);

  useEffect(() => {
    if (!user) return;
    hasLiked(post.id, user.uid).then(setLiked);
    isBookmarked(post.id, user.uid).then(setBookmarked);
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return;
    const next = await toggleLike(post.id, user.uid);
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
  };

  const handleBookmark = async () => {
    if (!user) return;
    setBookmarked(await toggleBookmark(post.id, user.uid));
  };

  const handleShare = async () => {
    await sharePost(post.id);
    setShareCount((c) => c + 1);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard/community`);
    }
  };

  const openComments = async () => {
    setShowComments((s) => !s);
    if (!showComments) setComments(await fetchComments(post.id));
  };

  const handleAddComment = async () => {
    if (!user || !userDoc || !commentText.trim()) return;
    await addComment({
      postId: post.id,
      authorId: user.uid,
      authorName: userDoc.displayName,
      authorPhotoURL: userDoc.photoURL,
      content: commentText.trim(),
    });
    setComments(await fetchComments(post.id));
    setCommentCount((c) => c + 1);
    setCommentText("");
  };

  const handleSaveEdit = async () => {
    await updatePost(post.id, editContent);
    setContent(editContent);
    setEdited(true);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await deletePost(post.id);
    onDeleted();
  };

  const isOwner = user?.uid === post.authorId;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar name={post.authorName} photoURL={post.authorPhotoURL} />
            <div>
              <p className="text-sm font-semibold text-navy">{post.authorName}</p>
              <p className="text-xs text-navy-300">
                {timeAgo(post.createdAt)} {edited && "· Edited"}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-1">
              <button onClick={() => setEditing((e) => !e)} className="rounded-md p-1.5 text-navy-300 hover:bg-navy-50 hover:text-navy">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleDelete} className="rounded-md p-1.5 text-navy-300 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-500">{content}</p>
        )}

        {post.imageURL && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <Image src={post.imageURL} alt="" width={600} height={400} className="w-full object-cover" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-5 border-t border-navy-50 pt-3">
          <button onClick={handleLike} className={cn("flex items-center gap-1.5 text-sm", liked ? "text-red-500" : "text-navy-400 hover:text-red-500")}>
            <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likeCount}
          </button>
          <button onClick={openComments} className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-royal">
            <MessageCircle className="h-4 w-4" /> {commentCount}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-royal">
            <Share2 className="h-4 w-4" /> {shareCount}
          </button>
          <button onClick={handleBookmark} className={cn("ml-auto text-sm", bookmarked ? "text-gold-600" : "text-navy-400 hover:text-gold-600")}>
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-navy-50 pt-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar name={c.authorName} photoURL={c.authorPhotoURL} size={28} />
                <div className="flex-1 rounded-lg bg-navy-50 px-3 py-2">
                  <p className="text-xs font-semibold text-navy">{c.authorName}</p>
                  <p className="text-sm text-navy-500">{c.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-navy-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-400"
              />
              <Button size="sm" onClick={handleAddComment}><Send className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
