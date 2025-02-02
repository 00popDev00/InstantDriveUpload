import { useSession, signIn, signOut } from "next-auth/react";
import Upload from "../components/Upload";

const Home = () => {
  const { data: session } = useSession();

  return (
    <div className="container">
      {!session ? (
        <div className="card">
          <h2>Welcome!</h2>
          <p>Sign in to upload files to Google Drive.</p>
          <button onClick={() => signIn("google")} className="button">
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="card">
          <img src={session.user.image} alt="Profile" />
          <h2>Welcome, {session.user.name}</h2>
          <p>{session.user.email}</p>
          <button onClick={() => signOut()} className="button button-red">
            Sign Out
          </button>

          {/* Upload Section */}
          <div className="mt-6">
            <Upload />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

// import { useSession, signIn, signOut } from "next-auth/react";
// import Upload from "../components/Upload";

// export default function Home() {
//   const { data: session } = useSession();

//   return (
//     <div>
//       {!session ? (
//         <button onClick={() => signIn("google")}>Sign in with Google</button>
//       ) : (
//         <div>
//           <p>Welcome, {session.user.email}</p>
//           <button onClick={() => signOut()}>Sign Out</button>
//           <Upload />
//         </div>
//       )}
//     </div>
//   );
// }
