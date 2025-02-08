import { useSession, signIn, signOut } from "next-auth/react";
import Upload from "../components/Upload";

const Home = () => {
  const { data: session } = useSession();

  return (
    <div className="animated-bg d-flex align-items-center justify-content-center vh-100">
      <div
        className="container p-4 bg-white shadow-lg rounded text-center"
        style={{
          maxWidth: "400px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {!session ? (
          <div>
            <h2 className="h4 fw-bold">Welcome!</h2>
            <p className="text-muted">
              Sign in to upload files to Google Drive.
            </p>
            <button
              onClick={() => signIn("google")}
              className="btn btn-primary mt-3"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div>
            <img
              src={session.user.image}
              alt="Profile"
              className="rounded-circle mb-3"
              width="64"
              height="64"
            />
            <h2 className="h5 fw-bold">Welcome, {session.user.name}</h2>
            <p className="text-muted">{session.user.email}</p>
            <button onClick={() => signOut()} className="btn btn-danger mt-3">
              Sign Out
            </button>
            <div className="mt-4">
              <Upload />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
