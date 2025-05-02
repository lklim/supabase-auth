import "./index.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
export default function App() {
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState({title:"", content:""})
  const {title, content} = post
  const [session, setSession] = useState(null);

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select()
   setPosts(data) 
   console.log("data: ",data)  
  }

  async function createPost(){
    await supabase
      .from('posts')
      .insert([
        {title, content}
      ])
      .single()
   setPost({title:"", content:""}) 
   fetchPosts()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchPosts();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!session) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google", "facebook", "github"]}
          />
        </div>

      </div>
    );
  } else {
    return (
      <div>
        <div className="App"  >
      <input
       placeholder='Title'
       value={title}
       onChange={e => setPost({...post, title: e.target.value}) }
       />
       <input
       placeholder='Content'
       value={content}
       onChange={e => setPost({...post, content: e.target.value}) }
       />
       <button onClick={createPost}>Create Post</button>
       {
        posts.map(post =>(
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            </div>
        ))
       }
       </div>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  }
}