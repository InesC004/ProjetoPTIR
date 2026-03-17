import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-wgz277zrovymotmr.us.auth0.com"
      clientId="Ug8lxW0wDqeofYLblhBrMeUpSA949aSS"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://takeacab-api"
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);