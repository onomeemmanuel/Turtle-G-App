function Comment({ comment }) {
  return (
    <div className="comment-item">
      <div className="comment-author">{comment.author?.name || 'Student'}</div>
      <div className="comment-text">{comment.text}</div>
    </div>
  );
}

export default Comment;
