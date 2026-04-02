import React from "react";
import { auth, provider } from "../firebase/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
       
        <div className="absolute w-40 h-40 bg-teal-200 rounded-full -top-20 -left-20 opacity-30 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-teal-300 rounded-full -bottom-32 -right-32 opacity-30 animate-pulse"></div>

        <h1 className="text-4xl font-extrabold text-teal-700 mb-6 text-center">
          Welcome to Talksy 
        </h1>

        <p className="text-teal-600 mb-8 text-center">
          Connect and chat with your friends instantly!
        </p>

        <button
          onClick={loginWithGoogle}
          className="flex items-center justify-center w-full gap-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition transform hover:scale-105"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="mt-6 text-teal-500 text-sm text-center">
          By signing in, you agree to our <span className="font-bold">Terms & Privacy</span>.
        </p>
      </div>
    </div>
  );
}