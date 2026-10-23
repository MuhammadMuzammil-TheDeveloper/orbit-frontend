import { useEffect, useState } from "react";
import {
  Activity, Bell, Bookmark, Check, Compass, Heart,
  ImagePlus, LoaderCircle, MessageCircle, MoreHorizontal,
  Plus, Search, Send, Sparkles, Users, X, Zap
} from "lucide-react";
import { getPosts, createPost, toggleLike } from "./api";

const people = [
  { name: "Maya Chen", handle: "@mayacreates", color: "#edb69e" },
  { name: "Noah Williams", handle: "@noahbuilds", color: "#a9b8ef" },
  { name: "Zara Ahmed", handle: "@zara.jpg", color: "#d4b1e8" }
];

const stories = [
  { name: "Maya", color: "#edb69e" },
  { name: "Noah", color: "#a9b8ef" },
  { name: "Zara", color: "#d4b1e8" },
  { name: "Leo", color: "#b7d7ac" },
  { name: "Amara", color: "#efce91" }
];

function Avatar({ name = "User", color = "#c5f277", image }) {
  return (
    <div className="avatar" style={{ "--avatar-color": color }}>
      {image ? (
        <img src={image} alt="" />
      ) : (
        name.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

function Sidebar({ active, setActive }) {
  const links = [
    ["Home", Activity],
    ["Explore", Compass],
    ["Notifications", Bell],
    ["Messages", MessageCircle],
    ["Bookmarks", Bookmark]
  ];

  return (
    <aside className="sidebar">
      <a href="#home" className="brand">
        <span className="brand-mark"><Zap size={21} fill="currentColor" /></span>
        orbit<span className="brand-dot">.</span>
      </a>

      <div className="mini-profile">
        <Avatar name="Alex Morgan" />
        <div><strong>Alex Morgan</strong><small>@alexmorgan</small></div>
      </div>

      <p className="section-label">MENU</p>
      <nav className="side-nav">
        {links.map(([label, Icon]) => (
          <button
            key={label}
            className={active === label ? "nav-link active" : "nav-link"}
            onClick={() => setActive(label)}
          >
            <Icon size={19} /> {label}
            {label === "Notifications" && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <p className="section-label">YOUR SPACES</p>
      {["Design Club", "Indie Makers", "Photo Walks"].map((name, i) => (
        <button className="space-link" key={name} onClick={() => setActive(name)}>
          <span className={`space-icon space-${i}`}>
            {i === 0 ? <Sparkles size={16} /> : i === 1 ? <Zap size={16} /> : <Compass size={16} />}
          </span>
          {name}
        </button>
      ))}

      <div className="sidebar-bottom">
        <div className="promo">
          <Sparkles size={19} />
          <strong>Your corner of the internet.</strong>
          <p>Good people. Fresh ideas. No noise.</p>
        </div>
        <small className="online"><span /> All systems feeling good</small>
      </div>
    </aside>
  );
}

function Composer({ onSubmit, busy }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!text.trim() || busy) return;

    const success = await onSubmit({
      text: text.trim(),
      imageUrl: imageUrl.trim()
    });

    if (success) {
      setText("");
      setImageUrl("");
      setShowImage(false);
    }
  }

  return (
    <form className="card composer" onSubmit={submit}>
      <div className="composer-main">
        <Avatar name="Alex Morgan" />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's orbiting your mind?"
          aria-label="Write a post"
          maxLength={2000}
          rows={3}
        />
      </div>

      {showImage && (
        <input
          className="image-input"
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Paste an HTTPS image URL"
          aria-label="Image URL"
        />
      )}

      <div className="composer-footer">
        <div className="composer-tools">
          <button
            type="button"
            className="tool-button"
            onClick={() => setShowImage(v => !v)}
          >
            <ImagePlus size={17} /> Photo
          </button>
          <small>{text.length}/2000</small>
        </div>
        <button className="primary-button" disabled={!text.trim() || busy}>
          {busy ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}
          Share post
        </button>
      </div>
    </form>
  );
}

function PostCard({ post, onLike, busy }) {
  const author = post.author || {};

  return (
    <article className="card post-card">
      <div className="post-header">
        <Avatar name={author.name || "Orbit user"} image={author.avatar} />
        <div className="post-author">
          <strong>{author.name || "Orbit user"}</strong>
          <small>
            @{author.handle || "member"} ·{" "}
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : "Just now"}
          </small>
        </div>
        <button className="icon-button" aria-label="Post options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="post-text">{post.text}</p>

      {post.imageUrl && (
        <img className="post-image" src={post.imageUrl} alt="Post attachment" />
      )}

      <div className="post-actions">
        <button
          className={`engagement ${post.liked ? "liked" : ""}`}
          disabled={busy}
          onClick={() => onLike(post.id)}
          aria-label={post.liked ? "Unlike post" : "Like post"}
        >
          <Heart size={18} fill={post.liked ? "currentColor" : "none"} />
          {post.likesCount || 0}
        </button>
        <button
          className="engagement"
          onClick={() => window.alert("Comments are coming soon!")}
        >
          <MessageCircle size={18} /> Reply
        </button>
        <button
          className="engagement"
          onClick={() => {
            const url = `${window.location.origin}/?post=${post.id}`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(url)
                .then(() => window.alert("Post link copied!"))
                .catch(() => window.alert(url));
            } else {
              window.alert(url);
            }
          }}
        >
          <Send size={17} /> Share
        </button>
        <button
          className="engagement save-action"
          onClick={e => e.currentTarget.classList.toggle("saved")}
          aria-label="Save post"
        >
          <Bookmark size={18} />
        </button>
      </div>
    </article>
  );
}

function RightRail() {
  const [following, setFollowing] = useState([]);

  function toggleFollow(handle) {
    setFollowing(current =>
      current.includes(handle)
        ? current.filter(item => item !== handle)
        : [...current, handle]
    );
  }

  return (
    <aside className="right-rail">
      <label className="search-box">
        <Search size={18} />
        <input placeholder="Search your orbit..." aria-label="Search" />
      </label>

      <section className="rail-section">
        <div className="rail-title">
          <h3>People to know</h3>
          <span className="accent-text">Discover</span>
        </div>
        <div className="card suggestions">
          {people.map(person => (
            <div className="suggestion" key={person.handle}>
              <Avatar name={person.name} color={person.color} />
              <div className="suggestion-info">
                <strong>{person.name}</strong>
                <small>{person.handle}</small>
              </div>
              <button
                className={`follow-button ${following.includes(person.handle) ? "following" : ""}`}
                onClick={() => toggleFollow(person.handle)}
                aria-label={`Follow or unfollow ${person.name}`}
              >
                {following.includes(person.handle) ? <Check size={15} /> : <Plus size={16} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rail-section">
        <div className="rail-title"><h3>Making waves ✳</h3></div>
        <div className="card trends">
          {[
            ["01", "#DesignSystems", "2.4k posts"],
            ["02", "#BuildInPublic", "1.8k posts"],
            ["03", "#CreativeCoding", "956 posts"]
          ].map(([n, tag, count]) => (
            <div className="trend" key={tag}>
              <span className="trend-number">{n}</span>
              <div><strong>{tag}</strong><small>{count}</small></div>
            </div>
          ))}
        </div>
      </section>

      <div className="quote-card">
        <Sparkles size={18} />
        <p>The internet feels smaller when you find your people.</p>
        <small>A little reminder from Orbit</small>
      </div>

      <footer className="rail-footer">
        About · Guidelines · Privacy · Terms
        <small>© 2026 Orbit Social</small>
      </footer>
    </aside>
  );
}

export default function App() {
  const [active, setActive] = useState("Home");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    getPosts()
      .then(data => {
        if (!cancelled) setPosts(data.posts || []);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || "Could not connect to the API.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  async function handleCreatePost(payload) {
    setPosting(true);
    setError("");
    setNotice("");

    try {
      const data = await createPost(payload);
      setPosts(current => [data.post, ...current]);
      setNotice("Your post is now in orbit!");
      return true;
    } catch (err) {
      setError(err.message || "Could not create post.");
      return false;
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(id) {
    if (busyIds.includes(id)) return;

    setBusyIds(current => [...current, id]);
    setError("");

    try {
      const data = await toggleLike(id);
      setPosts(current =>
        current.map(post => post.id === id ? data.post : post)
      );
    } catch (err) {
      setError(err.message || "Could not update like.");
    } finally {
      setBusyIds(current => current.filter(item => item !== id));
    }
  }

  const titles = {
    Home: "Your orbit",
    Explore: "Explore",
    Notifications: "Notifications",
    Messages: "Messages",
    Bookmarks: "Saved for later"
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} />

      <main className="main-content" id="home">
        <header className="mobile-header">
          <a className="brand" href="#home">
            <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
            orbit<span className="brand-dot">.</span>
          </a>
          <button className="icon-button" onClick={() => setActive("Notifications")} aria-label="Notifications">
            <Bell size={20} />
          </button>
        </header>

        <header className="page-heading">
          <div>
            <div className="eyebrow"><span /> YOUR DAILY FREQUENCY</div>
            <h1>{titles[active] || active}<span className="brand-dot">.</span></h1>
            <p>Good things happen when we connect.</p>
          </div>
          <button className="icon-button desktop-bell" onClick={() => setActive("Notifications")} aria-label="Notifications">
            <Bell size={20} />
          </button>
        </header>

        <section className="card stories">
          <div className="stories-heading">
            <strong>Little moments</strong>
            <small><span /> HAPPENING NOW</small>
          </div>
          <div className="story-list">
            <button className="story" onClick={() => document.querySelector("textarea")?.focus()}>
              <span className="story-ring add-story">
                <Avatar name="Alex Morgan" />
                <span className="story-plus"><Plus size={14} /></span>
              </span>
              <small>Your story</small>
            </button>
            {stories.map(story => (
              <button
                className="story"
                key={story.name}
                onClick={() => setNotice(`${story.name}'s stories are coming soon.`)}
              >
                <span className="story-ring"><Avatar name={story.name} color={story.color} /></span>
                <small>{story.name}</small>
              </button>
            ))}
          </div>
        </section>

        <div className="feed-toolbar">
          <div>
            <button className="feed-tab active"><Sparkles size={15} /> For you</button>
            <button className="feed-tab" onClick={() => setNotice("Following feed is coming soon.")}>
              <Users size={15} /> Following
            </button>
          </div>
          <span className="feed-count">{posts.length} POSTS</span>
        </div>

        {error && (
          <div className="alert error" role="alert">
            {error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}
        {notice && (
          <div className="alert success" role="status">
            {notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}

        <Composer onSubmit={handleCreatePost} busy={posting} />

        <div className="feed-label">FRESH FROM YOUR ORBIT</div>

        {loading ? (
          <div className="card empty-state">
            <LoaderCircle className="spin" size={28} />
            <strong>Finding your orbit...</strong>
            <p>Bringing the latest conversations together.</p>
          </div>
        ) : posts.length ? (
          <div className="post-list">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                busy={busyIds.includes(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <Sparkles size={28} />
            <strong>It's quiet out here. For now.</strong>
            <p>Be the first to share something good.</p>
          </div>
        )}

        <div className="end-feed">— YOU'RE ALL CAUGHT UP —</div>
      </main>

      <RightRail />

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          ["Home", Activity],
          ["Explore", Compass],
          ["Create", Plus],
          ["Messages", MessageCircle],
          ["Profile", Users]
        ].map(([label, Icon]) => (
          <button
            key={label}
            className={active === label ? "mobile-active" : ""}
            onClick={() => {
              if (label === "Create") {
                document.querySelector("textarea")?.focus();
              } else {
                setActive(label === "Profile" ? "Alex Morgan" : label);
              }
            }}
            aria-label={label}
          >
            <Icon size={21} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}