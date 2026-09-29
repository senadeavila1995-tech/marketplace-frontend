import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./App.css";

import App from "./App";

const GOOGLE_CLIENT_ID =
  "1040411300061-nn3bmo963gcgmh0mpgri50k7mhg98tc4.apps.googleusercontent.com";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
